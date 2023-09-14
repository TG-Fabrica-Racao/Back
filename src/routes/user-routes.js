const express = require('express');
const userController = require('../controllers/user-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');
const { celebrate, Joi, errors, Segments } = require('celebrate');

const router = express.Router();

router.get('/logs', login.verifyToken, roles.adminRole, userController.getLogs);

router.get('/', login.verifyToken, roles.adminRole, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        id: Joi.number().integer().min(1),
        nome: Joi.string().min(3).max(100),
        email: Joi.string().email().min(3).max(100),
        telefone: Joi.string().min(3).max(20),
        cargo: Joi.string().min(3).max(100),
    })
}), userController.getAllUser);

router.post('/create', login.verifyToken, roles.adminRole, celebrate({
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().min(3).max(100).required(),
        telefone: Joi.string().min(3).max(20).required(),
        cargo: Joi.string().valid('Administrador', 'Funcionário').required(),
    })
}), userController.createUser);

router.post('/login', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().min(3).max(100).required(),
        senha: Joi.string().min(3).max(100).required()
    })
}), userController.userLogin);

router.post('/identify', celebrate({
    [Segments.HEADERS]: Joi.object({
        authorization: Joi.string().required()
    })
}), userController.identifyUser);

router.patch('/update/:id', login.verifyToken, roles.adminRole, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().min(3).max(100).required(),
        telefone: Joi.string().min(3).max(20).required(),
        status: Joi.boolean().required(),
        cargo: Joi.string().valid('Administrador', 'Funcionário').required(),
    })
}), userController.updateUser);

router.patch('/update-password/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    }),
    [Segments.BODY]: Joi.object().keys({
        senha_atual: Joi.string().min(3).max(100).required(),
        senha_nova: Joi.string().min(3).max(100).required()
    })
}), userController.updatePassword);

router.patch('/disable/:id', login.verifyToken, roles.adminRole, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    })
}), userController.disableUser);

router.patch('/enable/:id', login.verifyToken, roles.adminRole, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    })
}), userController.enableUser);

router.delete('/delete/:id', login.verifyToken, roles.adminRole, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    })
}), userController.deleteUser);

router.use(errors());

module.exports = router;
