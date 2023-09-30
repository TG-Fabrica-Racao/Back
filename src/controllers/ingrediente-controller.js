const mysql = require('../connection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {

    getAllIngredientes: async (request, response) => {
        try {
            const { nome, nome_grupo, id } = request.query;
    
            let query =
                `SELECT 
                    ingredientes.id,
                    ingredientes.nome,
                    grupos.nome AS grupo,
                    ingredientes.estoque_minimo,
                    ingredientes.estoque_atual
                FROM ingredientes
                INNER JOIN grupos ON ingredientes.id_grupo = grupos.id`;
    
            const params = [];
    
            if (nome || nome_grupo || id) {
                query += ' WHERE';
    
                if (id) {
                    query += ' ingredientes.id = ?';
                    params.push(id);
                }
    
                if (nome && (nome_grupo || id)) {
                    query += ' AND';
                }
    
                if (nome) {
                    query += ' ingredientes.nome LIKE ?';
                    params.push(`%${nome}%`);
                }
    
                if (nome_grupo && (nome || id)) {
                    query += ' AND';
                }
    
                if (nome_grupo) {
                    query += ' grupos.nome LIKE ?';
                    params.push(`%${nome_grupo}%`);
                }
            }
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    

    historicoCompras: async (request, response) => {
        try {
            const { data_inicial, data_final, nome_ingrediente } = request.query;
    
            let query = `
                SELECT
                    compras_ingrediente.id,
                    CONVERT_TZ(compras_ingrediente.data_compra, 'UTC', 'America/Sao_Paulo') AS data_compra_brasilia,
                    ingredientes.nome AS ingrediente,
                    compras_ingrediente.quantidade_bruta,
                    compras_ingrediente.pre_limpeza,
                    compras_ingrediente.quantidade_liquida,
                    compras_ingrediente.valor_unitario,
                    compras_ingrediente.valor_total,
                    compras_ingrediente.numero_nota,
                    compras_ingrediente.fornecedor
                FROM compras_ingrediente
                INNER JOIN ingredientes ON compras_ingrediente.id_ingrediente = ingredientes.id
            `;
    
            const params = [];
    
            if (data_inicial && data_final) {
                query += ' WHERE CONVERT_TZ(compras_ingrediente.data_compra, "+00:00", "America/Sao_Paulo") BETWEEN ? AND ?';
                params.push(data_inicial, data_final);
            } else if (data_inicial) {
                query += ' WHERE CONVERT_TZ(compras_ingrediente.data_compra, "+00:00", "America/Sao_Paulo") >= ?';
                params.push(data_inicial);
            } else if (data_final) {
                query += ' WHERE CONVERT_TZ(compras_ingrediente.data_compra, "+00:00", "America/Sao_Paulo") <= ?';
                params.push(data_final);
            }
    
            if (nome_ingrediente) {
                if (params.length > 0) {
                    query += ' AND ';
                } else {
                    query += ' WHERE ';
                }
                query += 'ingredientes.nome LIKE ?';
                params.push(`%${nome_ingrediente}%`);
            }
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },     
    
    historicoAcertoEstoque: async (request, response) => {
        try {
            const { data_inicial, data_final, nome_ingrediente } = request.query;
    
            let query = `
                SELECT 
                    ingredientes.nome AS racao,
                    CONVERT_TZ(acerto_estoque.data_acerto, 'UTC', 'America/Sao_Paulo') AS data_acerto_brasilia,
                    usuarios.nome AS usuario,
                    acerto_estoque.quantidade
                FROM acerto_estoque
                INNER JOIN ingredientes ON acerto_estoque.id_ingrediente = ingredientes.id
                INNER JOIN usuarios ON acerto_estoque.id_usuario = usuarios.id
            `;
    
            const params = [];
    
            if (data_inicial && data_final) {
                query += ' WHERE CONVERT_TZ(acerto_estoque.data_acerto, "UTC", "America/Sao_Paulo") BETWEEN ? AND ?';
                params.push(data_inicial, data_final);
            } else if (data_inicial) {
                query += ' WHERE CONVERT_TZ(acerto_estoque.data_acerto, "UTC", "America/Sao_Paulo") >= ?';
                params.push(data_inicial);
            } else if (data_final) {
                query += ' WHERE CONVERT_TZ(acerto_estoque.data_acerto, "UTC", "America/Sao_Paulo") <= ?';
                params.push(data_final);
            }
    
            if (nome_ingrediente) {
                if (params.length > 0) {
                    query += ' AND ';
                } else {
                    query += ' WHERE ';
                }
                query += 'ingredientes.nome LIKE ?';
                params.push(`%${nome_ingrediente}%`);
            }
    
            const [result] = await mysql.query(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    createIngrediente: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);
                
            const { nome, id_grupo, estoque_minimo } = request.body;
    
            const query = 
                `INSERT INTO ingredientes
                    (nome, id_grupo, estoque_minimo)
                VALUES
                    (?, ?, ?)`;
    
            const [result] = await mysql.execute(query, [nome, id_grupo, estoque_minimo]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 1, `O usuário ${decodedToken.nome} cadastrou o ingrediente ${nome}`]);
            return response.status(201).json({ message: 'Ingrediente cadastrado com sucesso!', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    

    updateIngrediente: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const { nome, id_grupo, estoque_minimo } = request.body;

            const query = 
                `UPDATE ingredientes
                    SET nome = ?, id_grupo = ?, estoque_minimo = ?
                WHERE id = ?`;

            await mysql.execute(query, [nome, id_grupo, estoque_minimo, request.params.id]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 2, `O usuário ${decodedToken.nome} atualizou o ingrediente ${nome}`]);
            return response.status(200).json({ message: 'Ingrediente atualizado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    comprarIngrediente: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const { id_ingrediente, 
                    quantidade_bruta, 
                    pre_limpeza, 
                    valor_unitario, 
                    numero_nota, 
                    fornecedor  } = request.body;

            const query = 
                `INSERT INTO compras_ingrediente
                    (data_compra, id_ingrediente, quantidade_bruta, pre_limpeza, quantidade_liquida, valor_unitario, valor_total, numero_nota, fornecedor)
                VALUES
                    (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const quantidade_liquida = quantidade_bruta - pre_limpeza;
            const valor_total = quantidade_bruta * valor_unitario;

            const [ingrediente] = await mysql.execute('SELECT estoque_atual FROM ingredientes WHERE id = ?', [id_ingrediente]);

            if (!ingrediente) {
                return response.status(404).json({ message: 'Ingrediente não encontrado' });
            }

            const novo_estoque = ingrediente[0].estoque_atual + quantidade_liquida;
            const [result] = await mysql.execute(query, [id_ingrediente, quantidade_bruta, pre_limpeza, quantidade_liquida, valor_unitario, valor_total, numero_nota, fornecedor]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 4, `O usuário ${decodedToken.nome} comprou ${quantidade_bruta}kg do ingrediente ${id_ingrediente}`]);
            await mysql.execute('UPDATE ingredientes SET estoque_atual = ? WHERE id = ?', [novo_estoque, id_ingrediente]);
            return response.status(201).json({ message: 'Compra de ingrediente realizada com sucesso!', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    acertarEstoque: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);
    
            const id_usuario = decodedToken.id;
    
            const { id_ingrediente, quantidade } = request.body;
    
            const [ingrediente] = await mysql.execute('SELECT * FROM ingredientes WHERE id = ?', [id_ingrediente]);
    
            if (!ingrediente) {
                return response.status(404).json({ message: 'Ingrediente não encontrado' });
            }
    
            if (ingrediente[0].estoque_atual < quantidade) {
                return response.status(400).json({ message: 'Estoque insuficiente' });
            }
    
            const query = `
                INSERT INTO acerto_estoque
                    (id_ingrediente, data_acerto, id_usuario, quantidade)
                VALUES
                    (?, NOW(), ?, ?)
            `;
    
            const [result] = await mysql.execute(query, [id_ingrediente, id_usuario, quantidade]);
            await mysql.execute('UPDATE ingredientes SET estoque_atual = (estoque_atual - ?) WHERE id = ?', [quantidade, id_ingrediente]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 12, `O usuário ${decodedToken.nome} realizou um acerto de estoque da ração ${id_ingrediente}`]);
            return response.status(201).json({ message: 'Acerto de estoque realizado com sucesso!', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
        
    deleteIngrediente: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const query = 
                `DELETE FROM ingredientes
                WHERE id = ?`;

            await mysql.execute(query, [request.params.id]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 3, `O usuário ${decodedToken.nome} deletou o ingrediente ${request.params.id}`]);        
            return response.status(200).json({ message: 'Ingrediente deletado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

};
