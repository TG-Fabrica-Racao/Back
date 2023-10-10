const express = require('express');
const faseGranjaController = require('../controllers/fase-granja-controller');
const login = require('../middlewares/login-middleware');
const { celebrate, Joi, errors, Segments } = require('celebrate');

const router = express.Router();

router.get('/', login.verifyToken, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        id: Joi.number().integer().allow('').optional(),
        nome: Joi.string().max(100).allow('').optional(),
    })
}), faseGranjaController.getFaseGranja);

router.post('/create', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
    })
}), faseGranjaController.createFaseGranja);

router.patch('/update/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
    })
}), faseGranjaController.updateFaseGranja);

router.delete('/delete/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required(),
    })
}), faseGranjaController.deleteFaseGranja);

router.use(errors());

module.exports = router;
