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
            const { data_inicial, data_final } = request.query;
    
            let query = `
                SELECT
                    compras_ingrediente.id,
                    compras_ingrediente.data_compra,
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
    
            if (data_inicial && data_final) {
                query += `
                    WHERE compras_ingrediente.data_compra BETWEEN ? AND ?;
                `;
    
                const [result] = await mysql.execute(query, [data_inicial, data_final]);
                return response.status(200).json(result);
            } else {
                const [result] = await mysql.execute(query);
                return response.status(200).json(result);
            }
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

    comprarIngrediente: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const { data_compra, 
                    id_ingrediente, 
                    quantidade_bruta, 
                    pre_limpeza, 
                    valor_unitario, 
                    numero_nota, 
                    fornecedor  } = request.body;

            const query = 
                `INSERT INTO compras_ingrediente
                    (data_compra, id_ingrediente, quantidade_bruta, pre_limpeza, quantidade_liquida, valor_unitario, valor_total, numero_nota, fornecedor)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const quantidade_liquida = quantidade_bruta - pre_limpeza;
            const valor_total = quantidade_bruta * valor_unitario;

            const [result] = await mysql.execute(query, [data_compra, id_ingrediente, quantidade_bruta, pre_limpeza, quantidade_liquida, valor_unitario, valor_total, numero_nota, fornecedor]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 4, `O usuário ${decodedToken.nome} comprou ${quantidade_bruta}kg do ingrediente ${id_ingrediente}`]);
            await mysql.execute('UPDATE ingredientes SET estoque_atual = estoque_atual + ? WHERE id = ?', [quantidade_liquida, id_ingrediente]);
            return response.status(201).json({ message: 'Compra de ingrediente realizada com sucesso!', id: result.insertId });
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
