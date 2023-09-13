const mysql = require('../connection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {

    getAllRacoes: async (request, response) => {
        try {
            const { nome, categoria, fase_utilizada } = request.query;
    
            let where = '1=1';
    
            if (nome) {
                where += ` AND racoes.nome LIKE '%${nome}%'`;
            }
    
            if (categoria) {
                where += ` AND categorias.nome LIKE '%${categoria}%'`;
            }
    
            if (fase_utilizada) {
                where += ` AND fases_granja.nome LIKE '%${fase_utilizada}%'`;
            }
    
            const query = `
                SELECT
                    racoes.id,
                    racoes.nome,
                    categorias.nome AS categoria,
                    racoes.tipo_racao,
                    fases_granja.nome AS fase_utilizada,
                    racoes.batida,
                    IFNULL(
                        GROUP_CONCAT(
                            CONCAT(ingredientes.id, ': ', ingredientes.nome, ' (', ingrediente_racao.quantidade, ')')
                            SEPARATOR ', '
                        ),
                        NULL
                    ) AS ingredientes
                FROM racoes
                LEFT JOIN ingrediente_racao ON racoes.id = ingrediente_racao.id_racao
                LEFT JOIN ingredientes ON ingrediente_racao.id_ingrediente = ingredientes.id
                INNER JOIN categorias ON racoes.id_categoria = categorias.id
                INNER JOIN fases_granja ON racoes.fase_utilizada = fases_granja.id
                WHERE ${where}
                GROUP BY racoes.id, racoes.nome, categorias.nome, racoes.tipo_racao, fases_granja.nome, racoes.batida;
            `;
    
            const [result] = await mysql.query(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    
    
    getRacaoById: async (request, response) => {
        try {
            const query = `
            SELECT
                racoes.id,
                racoes.nome,
                categorias.nome AS categoria,
                racoes.tipo_racao,
                fases_granja.nome AS fase_utilizada,
                racoes.batida
            FROM racoes
            INNER JOIN categorias ON racoes.id_categoria = categorias.id
            INNER JOIN fases_granja ON racoes.fase_utilizada = fases_granja.id
            WHERE racoes.id = ?
            `;
            
            const [result] = await mysql.query(query, [request.params.id]);
            return response.status(200).json(result[0]);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    historicoCompras: async (request, response) => {
        try {
            const query = 
                `SELECT
                    compras_racao.id,
                    compras_racao.data_compra,
                    racoes.nome AS racao,
                    compras_racao.quantidade,
                    compras_racao.valor_unitario,
                    compras_racao.valor_total,
                    compras_racao.numero_nota,
                    compras_racao.fornecedor
                FROM compras_racao
                INNER JOIN racoes ON compras_racao.id_racao = racoes.id;`;

            const [result] = await mysql.query(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    historicoProducao: async (request, response) => {
        try {
            const query =   
                `SELECT
                    racoes.nome AS racao,
                    producao_racao.data_producao AS data,
                    usuarios.nome AS usuario,
                    producao_racao.quantidade
                FROM producao_racao
                INNER JOIN racoes ON producao_racao.id_racao = racoes.id
                INNER JOIN usuarios ON producao_racao.id_usuario = usuarios.id;`

            const [result] = await mysql.query(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    createRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);
            
            const { nome, id_categoria, tipo_racao, fase_utilizada, batida, ingredientes } = request.body;
    
            const soma_quantidades = ingredientes.reduce((total, ingrediente) => total + ingrediente.quantidade, 0);
    
            if (soma_quantidades !== batida) {
                return response.status(400).json({ message: 'A soma das quantidades dos ingredientes não coincide com a batida da ração.' });
            }
    
            const racao_query =
                `INSERT INTO racoes
                    (nome, id_categoria, tipo_racao, fase_utilizada, batida)
                VALUES
                    (?, ?, ?, ?, ?)`;
    
            const [result] = await mysql.query(racao_query, [nome, id_categoria, tipo_racao, fase_utilizada, batida]);
            const racao_id = result.insertId;
    
            if (Array.isArray(ingredientes) && ingredientes.length > 0) {
                const insert_ingrediente =
                    `INSERT INTO ingrediente_racao
                        (id_racao, id_ingrediente, quantidade)
                    VALUES
                        (?, ?, ?)`;
    
                for (const ingrediente of ingredientes) {
                    const { id_ingrediente, quantidade } = ingrediente;
                    await mysql.query(insert_ingrediente, [racao_id, id_ingrediente, quantidade]);
                }
            }
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 5, `O usuário ${decodedToken.nome} cadastrou a ração ${nome}`]);        
            return response.status(201).json({ message: 'Ração cadastrada com sucesso!', id: racao_id });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    updateRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const { nome, id_categoria, tipo_racao, fase_utilizada, batida } = request.body;

            const query =
                `UPDATE racoes
                    SET nome = ?, id_categoria = ?, tipo_racao = ?, fase_utilizada = ?, batida = ?
                WHERE id = ?`;

            await mysql.query(query, [nome, id_categoria, tipo_racao, fase_utilizada, batida, request.params.id]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 6, `O usuário ${decodedToken.nome} atualizaou a ração ${nome}`]);        
            return response.status(200).json({ message: 'Ração atualizada com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    insertIngredienteInRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);
    
            const ingredientes = request.body;
    
            if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
                return response.status(400).json({ message: 'Requisição inválida. Forneça uma matriz de ingredientes para inserir.' });
            }
    
            const idRacaoSet = new Set(ingredientes.map(ingrediente => ingrediente.id_racao));
            if (idRacaoSet.size !== 1) {
                return response.status(400).json({ message: 'Todos os ingredientes devem pertencer à mesma ração.' });
            }
    
            const id_racao = ingredientes[0].id_racao;
    
            const soma_quantidades = ingredientes.reduce((total, ingrediente) => total + ingrediente.quantidade, 0);
    
            const [batida_racao] = await mysql.execute('SELECT batida FROM racoes WHERE id = ?', [id_racao]);
    
            if (!batida_racao || soma_quantidades !== batida_racao[0].batida) {
                return response.status(400).json({ message: 'A soma das quantidades dos ingredientes não coincide com a batida da ração.' });
            }
    
            const values = [];
    
            for (const ingrediente of ingredientes) {
                const { id_ingrediente, quantidade } = ingrediente;
    
                const query =
                    `INSERT INTO ingrediente_racao
                        (id_racao, id_ingrediente, quantidade)
                    VALUES
                        (?, ?, ?)`;
    
                const [result] = await mysql.query(query, [id_racao, id_ingrediente, quantidade]);
                values.push(result.values);
            }
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 7, `O usuário ${decodedToken.nome} adicionou ingrediente(s) na fórmula da ração ${id_racao}`]);
    
            return response.status(201).json({ message: 'Ingredientes inseridos na ração com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },      

    updateIngredienteInRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);
    
            const ingredientes = request.body;
    
            if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
                return response.status(400).json({ message: 'Requisição inválida. Forneça uma matriz de ingredientes para atualizar.' });
            }
    
            // Verificar se todos os ingredientes têm o mesmo id_racao
            const idRacaoSet = new Set(ingredientes.map(ingrediente => ingrediente.id_racao));
            if (idRacaoSet.size !== 1) {
                return response.status(400).json({ message: 'Todos os ingredientes devem pertencer à mesma ração.' });
            }
    
            const id_racao = ingredientes[0].id_racao;
    
            // Calcular a soma das quantidades dos ingredientes a serem atualizados
            const soma_quantidades = ingredientes.reduce((total, ingrediente) => {
                if (ingrediente.quantidade === null || ingrediente.quantidade === undefined) {
                    throw new Error('A quantidade não pode ser nula ou indefinida.');
                }
                return total + ingrediente.quantidade;
            }, 0);
    
            // Consultar a batida da ração
            const [batida_racao] = await mysql.execute('SELECT batida FROM racoes WHERE id = ?', [id_racao]);
    
            if (!batida_racao || soma_quantidades !== batida_racao[0].batida) {
                return response.status(400).json({ message: 'A soma das quantidades dos ingredientes não coincide com a batida da ração.' });
            }
    
            for (const ingrediente of ingredientes) {
                const { id_ingrediente, quantidade } = ingrediente;
    
                const query = `
                    UPDATE ingrediente_racao
                    SET quantidade = ?
                    WHERE id_racao = ? AND id_ingrediente = ?;
                `;
    
                await mysql.query(query, [quantidade, id_racao, id_ingrediente]);
            }
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 8, `O usuário ${decodedToken.nome} alterou a fórmula da ração ${id_racao}`]);
            return response.status(200).json({ message: 'Ingredientes atualizados na ração com sucesso!' });
        } catch (error) {
            console.error(error);
            if (error.message === 'A quantidade não pode ser nula ou indefinida.') {
                return response.status(400).json({ message: error.message });
            }
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },     

    deleteIngredienteFromRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const { id_racao, id_ingrediente } = request.body;
    
            if (!id_racao || !id_ingrediente) {
                return response.status(400).json({ message: 'Requisição inválida. Forneça o id da ração e o id do ingrediente para remover.' });
            }
    
            const query =
                `DELETE FROM ingrediente_racao
                WHERE id_racao = ? AND id_ingrediente = ?`;
    
            await mysql.query(query, [id_racao, id_ingrediente]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 9, `O usuário ${decodedToken.nome} deletou o ingrediente ${id_ingrediente} da fórmula da ração ${id_racao}`]);         
            return response.status(200).json({ message: 'Ingrediente removido da ração com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    

    comprarRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const { data_compra, id_racao, quantidade, valor_unitario, numero_nota, fornecedor } = request.body;

            const query =
                `INSERT INTO compras_racao
                    (data_compra, id_racao, quantidade, valor_unitario, valor_total, numero_nota, fornecedor)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?)`;

            const valor_total = quantidade * valor_unitario;

            const [result] = await mysql.query(query, [data_compra, id_racao, quantidade, valor_unitario, valor_total, numero_nota, fornecedor]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 10, `O usuário ${decodedToken.nome} comprou a ração ${id_racao}`]);         
            return response.status(201).json({ message: 'Compra de ração realizada com sucesso!', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    produzirRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const { id_racao, quantidade } = request.body;

            const id_usuario = decodedToken.id_usuario;
    
            const query = `
                INSERT INTO  producao_racao
                    (id_racao, data_producao, id_usuario, quantidade)
                VALUES
                    (?, ?, ?, ?)`;

            const [result] = await mysql.query(query, [id_racao, new Date(), id_usuario, quantidade]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 11, `O usuário ${decodedToken.nome} produziu ${quantidade}kg da ração ${id_racao}`]);         
            return response.status(201).json({ message: 'Produção de ração realizada com sucesso!', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    deleteRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const query = 
                `DELETE FROM racoes
                WHERE id = ?`;

            await mysql.execute(query, [request.params.id]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id_usuario, 12, `O usuário ${decodedToken.nome} deletou a ração ${request.params.id}`]);        
            return response.status(200).json({ message: 'Ingrediente deletado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
    
};
