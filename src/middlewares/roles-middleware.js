const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    adminRole: (request, response, next) => {
        try {
            const token = request.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, process.env.JWT_KEY);
            const role = decodedToken.cargo;
    
            if (role == 'Administrador') {
                next();   
            } else {
                return response.status(401).json({ message: 'Você não tem permissão para realizar esta ação!' });
            }
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
};
