const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    verifyToken: (request, response, next) => {
        try {
            const authHeader = request.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
    
            if (token == null) {
                return response.status(401).json({ message: 'Token de autenticação ausente.' });
            }
    
            jwt.verify(token, process.env.JWT_KEY, (error, user) => {
                if (error) {
                    return response.status(403).json({ message: 'Token inválido.' });
                }
                request.user = user;
                next();
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
};
