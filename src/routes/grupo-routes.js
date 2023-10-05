const express = require('express');
const grupoController = require('../controllers/grupo-controller');
const login = require('../middlewares/login-middleware');
const { celebrate, Joi, errors, Segments } = require('celebrate');

const router = express.Router();

router.get('/', login.verifyToken, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        id: Joi.number().integer().allow('').optional(),
        nome: Joi.string().max(100).allow('').optional(),
    })
}), grupoController.getAllGrupos);

router.post('/create', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
    })
}), grupoController.createGrupo);

router.patch('/update/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
    })
}), grupoController.updateGrupo);

router.delete('/delete/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required(),
    })
}), grupoController.deleteGrupo);

router.use(errors());

module.exports = router;
