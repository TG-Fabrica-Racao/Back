CREATE DATABASE IF NOT EXISTS fabrica_racao;

USE fabrica_racao;

CREATE TABLE IF NOT EXISTS grupos (
	id INT AUTO_INCREMENT,
    nome VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

/* Grupos dos ingredientes */
INSERT INTO grupos (nome) VALUES ('Aditivo');
INSERT INTO grupos (nome) VALUES ('Aminoácidos');
INSERT INTO grupos (nome) VALUES ('Energético');
INSERT INTO grupos (nome) VALUES ('Fibrosos');
INSERT INTO grupos (nome) VALUES ('Lácteo');
INSERT INTO grupos (nome) VALUES ('Macro minerais');
INSERT INTO grupos (nome) VALUES ('Micro nutrientes');
INSERT INTO grupos (nome) VALUES ('Milho/sorgo');
INSERT INTO grupos (nome) VALUES ('Outros');
INSERT INTO grupos (nome) VALUES ('Palatabilizantes');
INSERT INTO grupos (nome) VALUES ('Promotor e medicamento');
INSERT INTO grupos (nome) VALUES ('Protéicos');

CREATE TABLE IF NOT EXISTS categorias (
	id INT AUTO_INCREMENT,
    nome VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

/* Categorias das rações */
INSERT INTO categorias (nome) VALUES ('Pré-inicial');
INSERT INTO categorias (nome) VALUES ('Inicial');
INSERT INTO categorias (nome) VALUES ('Recria');
INSERT INTO categorias (nome) VALUES ('Terminação');
INSERT INTO categorias (nome) VALUES ('Gestação');
INSERT INTO categorias (nome) VALUES ('Lactação');
INSERT INTO categorias (nome) VALUES ('Outros');

CREATE TABLE IF NOT EXISTS fases_granja (
	id INT AUTO_INCREMENT,
    nome VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

/* Fases onde a ração pode ser utilizada */
INSERT INTO fases_granja (nome) VALUES ("Reprodução");
INSERT INTO fases_granja (nome) VALUES ("Maternidade");
INSERT INTO fases_granja (nome) VALUES ("Creche");
INSERT INTO fases_granja (nome) VALUES ("Terminação");

CREATE TABLE IF NOT EXISTS usuarios (
	id INT AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    status_usuario ENUM ('Ativo', 'Inativo') NOT NULL,
    cargo ENUM ('Administrador', 'Funcionário') NOT NULL,
    passwordResetToken VARCHAR(100),
    passwordResetExpires DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS ingredientes (
    id INT AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    id_grupo INT NOT NULL,
    estoque_minimo DECIMAL(10, 2) NOT NULL,
    estoque_atual DECIMAL(10, 2),
    PRIMARY KEY (id),
    FOREIGN KEY (id_grupo) REFERENCES grupos (id)
);

CREATE TABLE IF NOT EXISTS racoes (
    id INT AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    id_categoria INT NOT NULL,
    tipo_racao ENUM ('Produção própria', 'Comprada', 'Ambos') NOT NULL, 
    fase_utilizada INT NOT NULL,
    batida DECIMAL(10,2),
    estoque_minimo DECIMAL(10,2) NOT NULL,
    estoque_atual DECIMAL(10,2),
    PRIMARY KEY (id),
    FOREIGN KEY (id_categoria) REFERENCES categorias (id),
    FOREIGN KEY (fase_utilizada) REFERENCES fases_granja (id)
);

CREATE TABLE IF NOT EXISTS ingrediente_racao (
    id_ingrediente INT NOT NULL,
    id_racao INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes (id),
    FOREIGN KEY (id_racao) REFERENCES racoes (id)
);

CREATE TABLE IF NOT EXISTS compras_ingrediente (
	id INT AUTO_INCREMENT,
    data_compra DATETIME NOT NULL,
    id_ingrediente INT NOT NULL,
    quantidade_bruta DECIMAL(10,2) NOT NULL,
    pre_limpeza DECIMAL(10,2) NOT NULL,
    quantidade_liquida DECIMAL(10,2) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    numero_nota VARCHAR(50) NOT NULL,
    fornecedor VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes (id)
);

CREATE TABLE IF NOT EXISTS compras_racao (
	id INT AUTO_INCREMENT,
    data_compra DATETIME NOT NULL,
    id_racao INT NOT NULL,
    quantidade DECIMAL(10,2) NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    numero_nota VARCHAR(50) NOT NULL,
    fornecedor VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_racao) REFERENCES racoes (id)
);

CREATE TABLE IF NOT EXISTS producao_racao (
    id INT AUTO_INCREMENT,
    id_racao INT NOT NULL,
    data_producao DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_racao) REFERENCES racoes (id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS acerto_estoque (
    id INT AUTO_INCREMENT,
    id_ingrediente INT,
    id_racao INT,
    data_acerto DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_racao) REFERENCES racoes (id),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes (id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS acoes (
    id INT AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

/* Todas as ações possíveis - Ingredientes */
INSERT INTO acoes (nome) VALUES ('Cadastrar ingrediente');
INSERT INTO acoes (nome) VALUES ('Atualizar ingrediente');
INSERT INTO acoes (nome) VALUES ('Deletar ingrediente');
INSERT INTO acoes (nome) VALUES ('Comprar ingrediente');

/* Todas as ações possíveis - Rações */
INSERT INTO acoes (nome) VALUES ('Cadastrar ração');
INSERT INTO acoes (nome) VALUES ('Atualizar ração');
INSERT INTO acoes (nome) VALUES ('Adicionar ingredientes na fórmula da ração');
INSERT INTO acoes (nome) VALUES ('Atualizar ingredientes na fórmula da ração');
INSERT INTO acoes (nome) VALUES ('Deletar ingrediente da fórmula da ração');
INSERT INTO acoes (nome) VALUES ('Comprar ração');
INSERT INTO acoes (nome) VALUES ('Produzir ração');
INSERT INTO acoes (nome) VALUES ('Acertar estoque da ração');
INSERT INTO acoes (nome) VALUES ('Deletar ração');

CREATE TABLE IF NOT EXISTS registros (
    id BIGINT AUTO_INCREMENT,
    data_registro DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    id_acao INT NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id),
    FOREIGN KEY (id_acao) REFERENCES acoes (id)
);

DELIMITER //

CREATE TRIGGER atualizar_estoque_ingredientes AFTER INSERT ON producao_racao
FOR EACH ROW
BEGIN
    CALL atualizarEstoque(NEW.id, NEW.quantidade);
END; // 

DELIMITER //

CREATE PROCEDURE atualizarEstoque(IN id_producao INT, IN quantidade_produzida INT)
BEGIN
    DECLARE ingredientes_racao INT;
    DECLARE id_ingrediente_update INT;
    DECLARE index_loop INT;
    DECLARE index_loop2 INT;
    DECLARE id_racao_update INT;
    DECLARE quantidade_ingrediente_batida DECIMAL(10, 2);
    DECLARE quantidade_ingrediente DECIMAL(10, 2);
    DECLARE quantidade_total DECIMAL(10, 2);
    DECLARE novo_estoque DECIMAL(10, 2);
    DECLARE estoque_agora DECIMAL(10, 2);
    DECLARE cursor_ingredientes CURSOR FOR
        SELECT id_ingrediente
        FROM ingrediente_racao
        WHERE id_racao = (SELECT id_racao FROM producao_racao WHERE id = id_producao);
    
    SELECT id_racao INTO id_racao_update FROM producao_racao WHERE id = id_producao;

    -- Contar os ingredientes da ração
    SELECT COUNT(*) INTO ingredientes_racao FROM ingrediente_racao WHERE id_racao = id_racao_update;

    SELECT batida INTO quantidade_total FROM racoes WHERE id = id_racao_update;

    SET index_loop = 1;

    OPEN cursor_ingredientes;

    WHILE index_loop <= ingredientes_racao DO

        FETCH NEXT FROM cursor_ingredientes INTO id_ingrediente_update;
        
        SELECT quantidade INTO quantidade_ingrediente FROM ingrediente_racao WHERE id_racao = id_racao_update AND id_ingrediente = id_ingrediente_update LIMIT index_loop;

        SET quantidade_ingrediente_batida = (quantidade_ingrediente / quantidade_total) * quantidade_produzida;
		
        SELECT estoque_atual INTO estoque_agora FROM ingredientes where id = id_ingrediente_update;
        SET novo_estoque = (estoque_agora - quantidade_ingrediente_batida);
        UPDATE ingredientes SET estoque_atual = novo_estoque WHERE id = id_ingrediente_update;
        
        SET index_loop = index_loop + 1;
    END WHILE;
END; //

DELIMITER ;
