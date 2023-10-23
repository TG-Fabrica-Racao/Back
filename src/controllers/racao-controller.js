const mysql = require('../connection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {

    getAllRacoes: async (request, response) => {
        try {
            const { id, nome, categoria, fase_utilizada, tipo_racao } = request.query;
            
            const params = [];

            let where = "WHERE 1=1";
    
            if (id) {
                where += " AND racoes.id = ?";
                params.push(id);
            }
    
            if (nome) {
                where += " AND racoes.nome LIKE ?";
                params.push(`%${nome}%`);
            }
    
            if (categoria) {
                where += " AND categorias.nome LIKE ?";
                params.push(`%${categoria}%`);
            }
    
            if (fase_utilizada) {
                where += " AND fases_granja.nome LIKE ?";
                params.push(`%${fase_utilizada}%`);
            }
    
            if (tipo_racao) {
                where += " AND racoes.tipo_racao LIKE ?";
                params.push(`%${tipo_racao}%`);
            }
    
            const query = `
                    SELECT
                        racoes.id,
                        racoes.nome,
                        categorias.id AS id_categoria,
                        categorias.nome AS categoria,
                        racoes.tipo_racao,
                        fases_granja.nome AS fase_utilizada,
                        racoes.batida,
                        racoes.estoque_minimo,
                        racoes.estoque_atual,
                        JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'nome', i.nome, 'quantidade', ir.quantidade)) AS ingredientes
                FROM racoes
                INNER JOIN categorias ON racoes.id_categoria = categorias.id
                INNER JOIN fases_granja ON racoes.fase_utilizada = fases_granja.id
                LEFT JOIN ingrediente_racao ir ON racoes.id = ir.id_racao
                LEFT JOIN ingredientes i ON ir.id_ingrediente = i.id
                ${where}
                GROUP BY racoes.id, racoes.nome, categorias.id, categorias.nome, racoes.tipo_racao, fases_granja.nome, racoes.batida, racoes.estoque_minimo, racoes.estoque_atual;
                `;
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },   
    
    getRacoesCompradas: async (request, response) => {
        try {
            const { id, nome, categoria, fase_utilizada } = request.query;
            
            const params = [];

            let where = "WHERE 1=1 AND racoes.tipo_racao = 'Comprada'";
    
            if (id) {
                where += " AND racoes.id = ?";
                params.push(id);
            }
    
            if (nome) {
                where += " AND racoes.nome LIKE ?";
                params.push(`%${nome}%`);
            }
    
            if (categoria) {
                where += " AND categorias.nome LIKE ?";
                params.push(`%${categoria}%`);
            }
    
            if (fase_utilizada) {
                where += " AND fases_granja.nome LIKE ?";
                params.push(`%${fase_utilizada}%`);
            }
    
            const query = `
                    SELECT
                        racoes.id,
                        racoes.nome,
                        categorias.id AS id_categoria,
                        categorias.nome AS categoria,
                        racoes.tipo_racao,
                        fases_granja.nome AS fase_utilizada,
                        racoes.batida,
                        racoes.estoque_minimo,
                        racoes.estoque_atual
                FROM racoes
                INNER JOIN categorias ON racoes.id_categoria = categorias.id
                INNER JOIN fases_granja ON racoes.fase_utilizada = fases_granja.id
                ${where}
                GROUP BY racoes.id, racoes.nome, categorias.id, categorias.nome, racoes.tipo_racao, fases_granja.nome, racoes.batida, racoes.estoque_minimo, racoes.estoque_atual;
                `;
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);

        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    historicoCompras: async (request, response) => {
        try {
            const { data_inicial, data_final, nome_racao } = request.query;
    
            let query = `
                SELECT
                    compras_racao.id,
                    compras_racao.data_compra,
                    racoes.nome AS racao,
                    compras_racao.quantidade,
                    compras_racao.valor_unitario,
                    compras_racao.valor_total,
                    compras_racao.numero_nota,
                    compras_racao.fornecedor
                FROM compras_racao
                INNER JOIN racoes ON compras_racao.id_racao = racoes.id
            `;
    
            const params = [];
    
            if (data_inicial && data_final) {
                query += ' WHERE compras_racao.data_compra BETWEEN ? AND ?';
                params.push(data_inicial, data_final);
            } else if (data_inicial) {
                query += ' WHERE compras_racao.data_compra >= ?';
                params.push(data_inicial);
            } else if (data_final) {
                query += ' WHERE compras_racao.data_compra <= ?';
                params.push(data_final);
            }
    
            if (nome_racao) {
                if (params.length > 0) {
                    query += ' AND ';
                } else {
                    query += ' WHERE ';
                }
                query += 'racoes.nome LIKE ?';
                params.push(`%${nome_racao}%`);
            }
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },           

    historicoProducao: async (request, response) => {
        try {
            const { data_inicial, data_final, nome_racao } = request.query;
    
            let query = `
                SELECT
                    producao_racao.id,
                    racoes.nome AS racao,
                    CONVERT_TZ(producao_racao.data_producao, 'UTC', 'America/Sao_Paulo') AS data,
                    usuarios.nome AS usuario,
                    producao_racao.quantidade
                FROM producao_racao
                INNER JOIN racoes ON producao_racao.id_racao = racoes.id
                INNER JOIN usuarios ON producao_racao.id_usuario = usuarios.id
            `;
    
            const params = [];
    
            if (data_inicial && data_final) {
                query += ' WHERE CONVERT_TZ(producao_racao.data_producao, "UTC", "America/Sao_Paulo") BETWEEN ? AND ?';
                params.push(data_inicial, data_final);
            } else if (data_inicial) {
                query += ' WHERE CONVERT_TZ(producao_racao.data_producao, "UTC", "America/Sao_Paulo") >= ?';
                params.push(data_inicial);
            } else if (data_final) {
                query += ' WHERE CONVERT_TZ(producao_racao.data_producao, "UTC", "America/Sao_Paulo") <= ?';
                params.push(data_final);
            }
    
            if (nome_racao) {
                if (params.length > 0) {
                    query += ' AND ';
                } else {
                    query += ' WHERE ';
                }
                query += 'racoes.nome LIKE ?';
                params.push(`%${nome_racao}%`);
            }
    
            const [result] = await mysql.query(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    
    
    historicoAcertoEstoque: async (request, response) => {
        try {
            const { data_inicial, data_final, nome_racao } = request.query;
    
            let query = `
                SELECT
                    acerto_estoque.id,
                    racoes.nome AS racao,
                    CONVERT_TZ(acerto_estoque.data_acerto, 'UTC', 'America/Sao_Paulo') AS data_acerto,
                    usuarios.nome AS usuario,
                    acerto_estoque.quantidade
                FROM acerto_estoque
                INNER JOIN racoes ON acerto_estoque.id_racao = racoes.id
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
    
            if (nome_racao) {
                if (params.length > 0) {
                    query += ' AND ';
                } else {
                    query += ' WHERE ';
                }
                query += 'racoes.nome LIKE ?';
                params.push(`%${nome_racao}%`);
            }
    
            const [result] = await mysql.query(query, params);
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
            
            const { nome, id_categoria, tipo_racao, fase_utilizada, estoque_minimo, ingredientes } = request.body;
    
            const [racao] = await mysql.execute('SELECT * FROM racoes WHERE nome = ?', [nome]);

            if (racao.length > 0) {
                return response.status(400).json({ message: 'Ração já cadastrada' });
            }

            let batida = 0; // Inicializa a batida como zero
    
            if (Array.isArray(ingredientes) && ingredientes.length > 0) {
                // Calcula a batida com base nas quantidades de ingredientes
                for (const ingrediente of ingredientes) {
                    batida += ingrediente.quantidade;
                }
            }
    
            if (tipo_racao === "Comprada") {
                const racao_query =
                    `INSERT INTO racoes
                        (nome, id_categoria, tipo_racao, fase_utilizada, estoque_minimo)
                    VALUES
                        (?, ?, ?, ?, ?)`;
        
                await mysql.query(racao_query, [nome, id_categoria, tipo_racao, fase_utilizada, estoque_minimo]);
            } else {
                const racao_query =
                    `INSERT INTO racoes
                        (nome, id_categoria, tipo_racao, fase_utilizada, batida, estoque_minimo)
                    VALUES
                        (?, ?, ?, ?, ?, ?)`;
        
                const [result] = await mysql.query(racao_query, [nome, id_categoria, tipo_racao, fase_utilizada, batida, estoque_minimo]);
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
            }
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 6, `A ração ${nome} foi cadastrada`]);        
            return response.status(201).json({ message: 'Ração cadastrada com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    
    
    updateRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);
    
            const { nome, id_categoria, tipo_racao, fase_utilizada, estoque_minimo } = request.body;
            
            // Verifique se o tipo de ração foi alterado para "Comprada"
            if (tipo_racao === "Comprada") {
                // Se sim, apague a batida e os ingredientes relacionados à ração
                await mysql.query('DELETE FROM ingrediente_racao WHERE id_racao = ?', [request.params.id]);
                await mysql.query('UPDATE racoes SET batida = NULL WHERE id = ?', [request.params.id]);
            }
    
            const query =
                `UPDATE racoes
                    SET nome = ?, id_categoria = ?, tipo_racao = ?, fase_utilizada = ?, estoque_minimo = ?
                WHERE id = ?`;
    
            await mysql.query(query, [nome, id_categoria, tipo_racao, fase_utilizada, estoque_minimo, request.params.id]);
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 7, `A ração ${nome} foi atualizada`]);        
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
            
            const { id_racao } = request.params; 
            const ingredientes = request.body;
    
            const idRacaoSet = new Set(ingredientes.map(ingrediente => ingrediente.id_racao));
            if (idRacaoSet.size !== 1) {
                return response.status(400).json({ message: 'Todos os ingredientes devem pertencer à mesma ração.' });
            }
        
            const soma_quantidades = ingredientes.reduce((total, ingrediente) => total + ingrediente.quantidade, 0);
    
            // Obtém a batida atual da ração no banco de dados
            const [batida_racao] = await mysql.execute('SELECT * FROM racoes WHERE id = ?', [id_racao]);
    
            if (!batida_racao || !batida_racao[0]) {
                return response.status(400).json({ message: 'Ração não encontrada' });
            }
    
            const values = [];
    
            for (const ingrediente of ingredientes) {
                const { id_ingrediente, quantidade } = ingrediente;
    
                // Verifica se o ingrediente já está cadastrado na ração
                const [existingIngredient] = await mysql.execute('SELECT * FROM ingrediente_racao WHERE id_racao = ? AND id_ingrediente = ?', [id_racao, id_ingrediente]);
    
                if (existingIngredient && existingIngredient[0]) {
                    return response.status(400).json({ message: `Ingrediente com ID ${id_ingrediente} já cadastrado na ração.` });
                }
    
                // Verifica se o ingrediente existe no banco de dados
                const [ingredientExists] = await mysql.execute('SELECT id FROM ingredientes WHERE id = ?', [id_ingrediente]);
    
                if (!ingredientExists || !ingredientExists[0]) {
                    return response.status(400).json({ message: `Ingrediente com ID ${id_ingrediente} não encontrado` });
                }
    
                const query =
                    `INSERT INTO ingrediente_racao
                        (id_racao, id_ingrediente, quantidade)
                    VALUES
                        (?, ?, ?)`;
    
                const [result] = await mysql.query(query, [id_racao, id_ingrediente, quantidade]);
                values.push(result.values);
            }
    
            // Calcula a nova batida da ração com base nas quantidades dos ingredientes como um número de ponto flutuante
            const nova_batida = parseFloat(batida_racao[0].batida) + soma_quantidades;
    
            // Atualiza a batida da ração no banco de dados com a nova batida calculada
            await mysql.execute('UPDATE racoes SET batida = ? WHERE id = ?', [nova_batida, id_racao]);
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 8, `Ingrediente(s) adicionados na fórmula da ração ${batida_racao[0].nome}`]);
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
            
            const { id_racao } = request.params;
            const ingredientes = request.body;
    
            if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
                return response.status(400).json({ message: 'Requisição inválida. Forneça uma matriz de ingredientes para atualizar.' });
            }
            
            // Calcular a soma das quantidades dos ingredientes a serem atualizados
            const soma_quantidades = ingredientes.reduce((total, ingrediente) => {
                if (ingrediente.quantidade === null || ingrediente.quantidade === undefined) {
                    throw new Error('A quantidade não pode ser nula ou indefinida.');
                }
                return total + ingrediente.quantidade;
            }, 0);
    
            // Verificar se a ração existe
            const [raoExists] = await mysql.execute('SELECT * FROM racoes WHERE id = ?', [id_racao]);
            if (!raoExists || raoExists.length === 0) {
                return response.status(400).json({ message: 'Ração não encontrada.' });
            }
    
            for (const ingrediente of ingredientes) {
                const { id_ingrediente, quantidade } = ingrediente;

                // Verificar se o ingrediente existe
                const [ingredientExists] = await mysql.execute('SELECT * FROM ingredientes WHERE id = ?', [id_ingrediente]);
                if (!ingredientExists || ingredientExists.length === 0) {
                    return response.status(400).json({ message: `Ingrediente com ID ${id_ingrediente} não encontrado.` });
                }
    
                // Verificar se o ingrediente está cadastrado na ração
                const [ingredientInRacao] = await mysql.execute('SELECT * FROM ingrediente_racao WHERE id_racao = ? AND id_ingrediente = ?', [id_racao, id_ingrediente]);
                if (!ingredientInRacao || ingredientInRacao.length === 0) {
                    return response.status(400).json({ message: `Ingrediente com ID ${id_ingrediente} não cadastrado na ração.` });
                }
    
                const query = `
                    UPDATE ingrediente_racao
                    SET quantidade = ?
                    WHERE id_racao = ? AND id_ingrediente = ?;
                `;
    
                await mysql.query(query, [quantidade, id_racao, id_ingrediente]);
            }
    
            // Recalcule a batida da ração após a atualização dos ingredientes
            const [nova_batida] = await mysql.execute('SELECT SUM(quantidade) AS batida FROM ingrediente_racao WHERE id_racao = ?', [id_racao]);
    
            await mysql.execute('UPDATE racoes SET batida = ? WHERE id = ?', [nova_batida[0].batida, id_racao]);
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 9, `Fórmula da ração ${raoExists[0].nome} atualizada`]);
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
    
            const id_racao = request.params.id_racao; // Access the id_racao from request.params
            const { id_ingrediente } = request.body;
    
            // Verificar se a ração existe
            const [raoExists] = await mysql.execute('SELECT id FROM racoes WHERE id = ?', [id_racao]);
            if (!raoExists || raoExists.length === 0) {
                return response.status(400).json({ message: 'Ração não encontrada.' });
            }
    
            // Verificar se o ingrediente existe
            const [ingredientExists] = await mysql.execute('SELECT * FROM ingredientes WHERE id = ?', [id_ingrediente]);
            if (!ingredientExists || ingredientExists.length === 0) {
                return response.status(400).json({ message: `Ingrediente com ID ${id_ingrediente} não encontrado.` });
            }
    
            // Verificar se o ingrediente está cadastrado na fórmula da ração
            const [quantidadeIngrediente] = await mysql.execute('SELECT quantidade FROM ingrediente_racao WHERE id_racao = ? AND id_ingrediente = ?', [id_racao, id_ingrediente]);
            if (!quantidadeIngrediente || quantidadeIngrediente.length === 0) {
                return response.status(400).json({ message: `Ingrediente com ID ${id_ingrediente} não cadastrado na ração.` });
            }
    
            const quantidadeRemovida = quantidadeIngrediente[0].quantidade;
    
            const query =
                `DELETE FROM ingrediente_racao
                WHERE id_racao = ? AND id_ingrediente = ?`;
    
            await mysql.query(query, [id_racao, id_ingrediente]);
    
            // Consultar a batida atual da ração
            const [batida_racao] = await mysql.execute('SELECT * FROM racoes WHERE id = ?', [id_racao]);
    
            // Calcular a nova batida da ração com base na remoção do ingrediente
            const nova_batida = parseFloat((batida_racao[0].batida - quantidadeRemovida).toFixed(2));
    
            // Atualizar a batida da ração no banco de dados com a nova batida calculada
            await mysql.execute('UPDATE racoes SET batida = ? WHERE id = ?', [nova_batida, id_racao]);
    
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 10, `Ingrediente ${ingredientExists[0].nome} deletado da fórmula da ração ${batida_racao[0].nome}`]);
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
    
            const {
                id_racao,
                quantidade,
                valor_unitario,
                numero_nota,
                fornecedor
            } = request.body;
    
            const [racao] = await mysql.execute('SELECT * FROM racoes WHERE id = ?', [id_racao]);
    
            if (!racao) {
                return response.status(404).json({ message: 'Ração não encontrada' });
            }
    
            if (racao[0].tipo_racao === 'Produção própria') {
                return response.status(400).json({ message: 'Essa ração é apenas produzida, portanto não pode ser comprada' });
            }
    
            const query = `
                INSERT INTO compras_racao
                    (data_compra, id_racao, quantidade, valor_unitario, valor_total, numero_nota, fornecedor)
                VALUES
                    (NOW(), ?, ?, ?, ?, ?, ?)`;
    
            const valor_total = parseFloat(quantidade) * parseFloat(valor_unitario);
            const novo_estoque = (parseFloat(racao[0].estoque_atual) + parseFloat(quantidade)).toFixed(2);
    
            const [result] = await mysql.execute(query, [id_racao, quantidade, valor_unitario, valor_total, numero_nota, fornecedor]);
            await mysql.execute('UPDATE racoes SET estoque_atual = ? WHERE id = ?', [parseFloat(novo_estoque), id_racao]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 11, `Compra de ${quantidade}kg  da ração ${racao[0].nome}`]);
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
    
            const id_usuario = decodedToken.id;
    
            const { id_racao, quantidade } = request.body;
    
            const [racao] = await mysql.execute('SELECT * FROM racoes WHERE id = ?', [id_racao]);
    
            if (!racao) {
                return response.status(404).json({ message: 'Ração não encontrada' });
            }
    
            if (racao[0].tipo_racao === 'Comprada') {
                return response.status(400).json({ message: 'Essa ração é apenas comprada, portanto não pode ser produzida' });
            }
    
            if (quantidade < racao[0].batida) {
                return response.status(400).json({ message: 'A quantidade de ração a ser produzida deve ser maior ou igual à batida da ração' });
            }
    
            const query = `
                INSERT INTO producao_racao
                    (id_racao, data_producao, id_usuario, quantidade)
                VALUES
                    (?, NOW(), ?, ?)
            `;
    
            const novo_estoque = parseFloat(racao[0].estoque_atual) + parseFloat(quantidade);
    
            const [result] = await mysql.execute(query, [id_racao, id_usuario, quantidade]);
            await mysql.execute('UPDATE racoes SET estoque_atual = ? WHERE id = ?', [novo_estoque, id_racao]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [id_usuario, 12, `Produção de ${quantidade}kg da ração ${racao[0].nome}`]);
            return response.status(201).json({ message: 'Produção de ração realizada com sucesso', id: result.insertId });
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

            const { id_racao, quantidade } = request.body;

            const [racao] = await mysql.execute('SELECT * FROM racoes WHERE id = ?', [id_racao]);

            if (!racao) {
                return response.status(404).json({ message: 'Ração não encontrada' });
            }

            if (racao[0].estoque_atual < quantidade) {
                return response.status(400).json({ message: 'Estoque insuficiente' });
            }

            const query = `
                INSERT INTO acerto_estoque
                    (id_racao, data_acerto, id_usuario, quantidade)
                VALUES
                    (?, NOW(), ?, ?)
            `;

            const [result] = await mysql.execute(query, [id_racao, id_usuario, quantidade]);
            await mysql.execute('UPDATE racoes SET estoque_atual = (estoque_atual - ?) WHERE id = ?', [quantidade, id_racao]);
            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 13, `Acerto de estoque de ${quantidade}kg da ração ${racao[0].nome}`]);
            return response.status(201).json({ message: 'Acerto de estoque realizado com sucesso!', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    deleteRacao: async (request, response) => {
        try {
            const token = request.header('Authorization');
            const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY);

            const [racao] = await mysql.execute('SELECT * FROM racoes WHERE id = ?', [request.params.id]);

            const [racao_compra] = await mysql.execute('SELECT * FROM compras_racao WHERE id_racao = ?', [request.params.id]);

            if (!racao || racao.length === 0) {
                return response.status(404).json({ message: 'Ração não encontrada' });
            }

            if (racao_compra && racao_compra.length > 0) {
                return response.status(400).json({ message: 'Não é possível excluir uma ração que está relacionada a uma compra' });
            }

            const query = 
                `DELETE FROM racoes
                WHERE id = ?`;

            const [result] = await mysql.execute(query, [request.params.id]);

            await mysql.execute('INSERT INTO registros (data_registro, id_usuario, id_acao, descricao) VALUES (NOW(), ?, ?, ?)', [decodedToken.id, 14, `A ração ${racao[0].nome} foi deletada`]);        
            return response.status(200).json({ message: 'Ingrediente deletado com sucesso!' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    // Métodos utilizados nos gráficos

    // Obter as rações mais compradas
    getRacoesMaisCompradas: async (request, response) => {
        try {
            const query = 
            `
            SELECT racoes.nome AS racao, SUM(compras_racao.quantidade) AS quantidade
            FROM racoes
            JOIN compras_racao ON racoes.id = compras_racao.id_racao
            WHERE racoes.tipo_racao = 'Comprada'
            AND compras_racao.data_compra >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            GROUP BY racoes.id
            ORDER BY quantidade DESC;
            `;

            const [result] = await mysql.execute(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    // Obter as rações mais produzidas
    getRacoesMaisProduzidas: async (request, response) => {
        try {
            const query = 
            `
            SELECT racoes.nome AS racao, SUM(producao_racao.quantidade) AS quantidade
            FROM racoes
            JOIN producao_racao ON racoes.id = producao_racao.id_racao
            WHERE racoes.tipo_racao = 'Produção própria'
            AND producao_racao.data_producao >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            GROUP BY racoes.id
            ORDER BY quantidade DESC;
            `;

            const [result] = await mysql.execute(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }        
    },
    
};
