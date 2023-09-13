const mysql = require('../connection');

module.exports = {

    getAllCategorias: async (request, response) => {
        try {
            const query = 'SESLECT * FROM categorias';
            
            const [result] = await mysql.execute(query);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    getCategoriaById: async (request, response) => {
        try {
            const query = 'SELECT * FROM categorias WHERE id = ?';

            const result = await mysql.execute(query, [request.params.id]);
            return response.status(200).json(result);
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    createCategoria: async (request, response) => {
        try {
            const { nome } = request.body;
            const query = 'INSERT INTO categorias (nome) VALUES (?)';

            const [result] = await mysql.execute(query, [nome]);
            return response.status(201).json({ message: 'Categoria cadastrada com sucesso', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    updateCategoria: async (request, response) => {
        try {
            const { nome } = request.body;
            const query = 'UPDATE categorias SET nome = ? WHERE id = ?';

            await mysql.execute(query, [nome, request.params.id]);
            return response.status(200).json({ message: 'Categoria atualizada com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    deleteCategoria: async (request, response) => {
        try {
            const query = 'DELETE FROM categorias WHERE id = ?';

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Categoria deletada com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

}