const mysql = require('../connection');

module.exports = {

    getAllCategorias: async (request, response) => {
        try {
            const { id, nome } = request.query;

            const query = 'SELECT * FROM categorias';
            
            const params = [];
    
            if (id) {
                query += ' WHERE id = ?';
                params.push(id);
            } else if (nome) {
                query += ' WHERE nome LIKE ?';
                params.push(`%${nome}%`);
            }

            const [result] = await mysql.execute(query);
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

            const [categoria] = await mysql.execute('SELECT * FROM categorias WHERE nome = ?', [nome]);

            if (categoria.length > 0) {
                return response.status(400).json({ message: 'Categoria já cadastrada' });
            }

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

            const [categoria] = await mysql.execute('SELECT * FROM categorias WHERE id = ?', [request.params.id]);

            if (!categoria) {
                return response.status(400).json({ message: 'Categoria não encontrada' });
            }

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

            const [categoria_racao] = await mysql.execute('SELECT * FROM racoes WHERE id_categoria = ?', [request.params.id]);

            const [categoria] = await mysql.execute('SELECT * FROM categorias WHERE id = ?', [request.params.id]);

            if (categoria_racao.length > 0) {
                return response.status(400).json({ message: 'Categoria não pode ser deletada, pois está associada a uma ração' });
            }

            if (!categoria) {
                return response.status(400).json({ message: 'Categoria não encontrada' });
            }

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Categoria deletada com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

}