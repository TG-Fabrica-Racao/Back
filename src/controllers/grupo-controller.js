const mysql = require('../connection');

module.exports = {

    getAllGrupos: async (request, response) => {
        try {
            const { id, nome } = request.query;
            let query = 'SELECT * FROM grupos';
    
            const params = [];
    
            if (id) {
                query += ' WHERE id = ?';
                params.push(id);
            } else if (nome) {
                query += ' WHERE nome LIKE ?';
                params.push(`%${nome}%`);
            }
    
            const [result] = await mysql.execute(query, params);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },    

    createGrupo: async (request, response) => {
        try {
            const { nome } = request.body;
            const query = 'INSERT INTO grupos (nome) VALUES (?)';

            if (!nome) {
                return response.status(400).json({ message: 'Informe o nome do grupo' });
            }

            const [result] = await mysql.execute(query, [nome]);
            return response.status(201).json({ message: 'Grupo cadastrado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    updateGrupo: async (request, response) => {
        try {
            const { nome } = request.body;
            const query = 'UPDATE grupos SET nome = ? WHERE id = ?';

            if (!request.params.id) {
                return response.status(400).json({ message: 'Requisição inválida. Forneça o id do grupo' });
            }

            await mysql.execute(query, [nome, request.params.id]);
            return response.status(200).json({ message: 'Grupo atualizada com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    deleteGrupo: async (request, response) => {
        try {
            const query = 'DELETE FROM grupos WHERE id = ?';

            if (!request.params.id) {
                return response.status(400).json({ message: 'Requisição inválida. Forneça o id do grupo' });
            }

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Grupo deletado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

}
