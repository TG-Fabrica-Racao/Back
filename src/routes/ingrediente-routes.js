const express = require('express');
const ingredienteController = require('../controllers/ingrediente-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');
const { celebrate, Joi, errors, Segments } = require('celebrate');

const router = express.Router();

router.get('/historico-compras', login.verifyToken, roles.adminRole, ingredienteController.historicoCompras);

router.get('/', login.verifyToken, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        id: Joi.number().integer().min(1),
        nome: Joi.string().min(3).max(100),
        nome_grupo: Joi.string().min(3).max(100)
    })
}), ingredienteController.getAllIngredientes);

router.post('/create', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
        id_grupo: Joi.number().integer().min(1).required(),
        estoque_minimo: Joi.number().integer().min(1).required(),
    })
}), ingredienteController.createIngrediente);

router.post('/comprar', login.verifyToken, roles.adminRole, celebrate({
    [Segments.BODY]: Joi.object().keys({
        data_compra: Joi.date().required(),
        id_ingrediente: Joi.number().integer().min(1).required(),
        quantidade_bruta: Joi.number().integer().min(1).required(),
        pre_limpeza: Joi.number().integer().min(1).required(),
        valor_unitario: Joi.number().integer().min(1).required(),
        numero_nota: Joi.string().min(3).max(100).required(),
        fornecedor: Joi.string().min(3).max(100).required()
    })
}), ingredienteController.comprarIngrediente);

router.patch('/update/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    }),
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
        id_grupo: Joi.number().integer().min(1).required(),
        estoque_minimo: Joi.number().integer().min(1).required()
    })
}), ingredienteController.updateIngrediente);

router.delete('/delete/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    })
}), ingredienteController.deleteIngrediente);

router.use(errors());

module.exports = router;
