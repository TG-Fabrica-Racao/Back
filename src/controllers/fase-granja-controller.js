const mysql = require('../connection');

module.exports = {

    getFaseGranja: async (request, response) => {
        try {
            const { id, nome } = request.query;
            let query = 'SELECT * FROM fases_granja';
    
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

    createFaseGranja: async (request, response) => {
        try {
            const { nome } = request.body;
            const query = 'INSERT INTO fases_granja (nome) VALUES (?)';

            const [faseGranja] = await mysql.execute('SELECT * FROM fases_granja WHERE nome = ?', [nome]);
            
            if (faseGranja.length > 0) {
                return response.status(400).json({ message: 'Fase já cadastrada' });
            }

            const [result] = await mysql.execute(query, [nome]);
            return response.status(201).json({ message: 'Fase cadastrada com sucesso', id: result.insertId });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    updateFaseGranja: async (request, response) => {
        try {
            const { nome } = request.body;
            const query = 'UPDATE fases_granja SET nome = ? WHERE id = ?';

            const [faseGranja] = await mysql.execute('SELECT * FROM fases_granja WHERE id = ?', [request.params.id]);

            if (!faseGranja) {
                return response.status(400).json({ message: 'Fase não encontrada' });
            }

            await mysql.execute(query, [nome, request.params.id]);
            return response.status(200).json({ message: 'Fase atualizada com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    deleteFaseGranja: async (request, response) => {
        try {
            const query = 'DELETE FROM fases_granja WHERE id = ?';

            const [faseGranja] = await mysql.execute('SELECT * FROM fases_granja WHERE id = ?', [request.params.id]);

            if (!faseGranja) {
                return response.status(400).json({ message: 'Fase não encontrada' });
            }

            await mysql.execute(query, [request.params.id]);
            return response.status(200).json({ message: 'Fase deletada com sucesso' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

}