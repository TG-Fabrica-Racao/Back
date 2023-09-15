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
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    status_usuario BOOLEAN NOT NULL, -- 0 = Inativo, 1 = Ativo
    cargo ENUM ('Administrador', 'Funcionário') NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS ingredientes (
	id INT AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    id_grupo INT NOT NULL,
    estoque_minimo FLOAT NOT NULL,
    estoque_atual DECIMAL(10, 2),
    PRIMARY KEY (id),
    FOREIGN KEY (id_grupo) REFERENCES grupos (id)
);

CREATE TABLE IF NOT EXISTS racoes (
	id INT AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    id_categoria INT NOT NULL,
    tipo_racao BOOLEAN NOT NULL, -- 0 = Produção própria, 1 = Comprada
    fase_utilizada INT NOT NULL,
    batida INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_categoria) REFERENCES categorias (id),
    FOREIGN KEY (fase_utilizada) REFERENCES fases_granja (id)
);

CREATE TABLE IF NOT EXISTS ingrediente_racao (
    id_ingrediente INT NOT NULL,
    id_racao INT NOT NULL,
    quantidade INT NOT NULL,
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes (id),
    FOREIGN KEY (id_racao) REFERENCES racoes (id)
);

CREATE TABLE IF NOT EXISTS compras_ingrediente (
	id INT AUTO_INCREMENT,
    data_compra DATE NOT NULL,
    id_ingrediente INT NOT NULL,
    quantidade_bruta FLOAT NOT NULL,
    pre_limpeza FLOAT NOT NULL,
    quantidade_liquida FLOAT NOT NULL,
    valor_unitario FLOAT NOT NULL,
    valor_total FLOAT NOT NULL,
    numero_nota VARCHAR(50) NOT NULL,
    fornecedor VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes (id)
);

CREATE TABLE IF NOT EXISTS compras_racao (
	id INT AUTO_INCREMENT,
    data_compra DATE NOT NULL,
    id_racao INT NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario FLOAT NOT NULL,
    valor_total FLOAT NOT NULL,
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
    quantidade FLOAT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_racao) REFERENCES racoes (id),
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
INSERT INTO acoes (nome) VALUES ('Adicionar ingrediente na fórmula da ração');
INSERT INTO acoes (nome) VALUES ('Atualizar ingrediente na fórmula da ração');
INSERT INTO acoes (nome) VALUES ('Deletar ingrediente na fórmula da ração');
INSERT INTO acoes (nome) VALUES ('Comprar ração');
INSERT INTO acoes (nome) VALUES ('Produzir ração');
INSERT INTO acoes (nome) VALUES ('Deletar ração');


CREATE TABLE IF NOT EXISTS registros (
    id BIGINT AUTO_INCREMENT,
    data_registro DATE NOT NULL,
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
    DECLARE quantidade_ingrediente_batida DECIMAL;
    DECLARE quantidade_ingrediente INT;
    DECLARE quantidade_total INT;
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

        UPDATE ingredientes SET estoque_atual = estoque_atual - quantidade_ingrediente_batida WHERE id_racao_update = id_ingrediente_update;
        
        SET index_loop = index_loop + 1;
    END WHILE;
END; //

DELIMITER ;
