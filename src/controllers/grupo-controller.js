const mysql = require('../connection');

module.exports = {

    getAllGrupos: async (request, response) => {
        try {
            const query = 'SESLECT * FROM grupos';
            
            const [result] = await mysql.execute(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    getGrupoById: async (request, response) => {
        try {
            const query = 'SELECT * FROM grupos WHERE id = ?';

            const result = await mysql.execute(query, [request.params.id]);
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

            const [result] = await mysql.execute(query, [nome]);
            return response.status(201).json({ message: 'Grupo cadastrado com sucesso', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    updateGrupo: async (request, response) => {
        try {
            const { nome } = request.body;
            const query = 'UPDATE grupos SET nome = ? WHERE id = ?';

            await mysql.execute(query, [nome, request.params.id]);
            return response.status(200).json({ message: 'Grupo atualizado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    deleteGrupo: async (request, response) => {
        try {
            const query = 'DELETE FROM grupos WHERE id = ?';

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Grupo deletado com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

}