const express = require('express');
const ingredienteController = require('../controllers/ingrediente-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');
const { celebrate, Joi, errors, Segments } = require('celebrate');

const router = express.Router();

router.get('/historico-compras', login.verifyToken, roles.adminRole, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        nome_ingrediente: Joi.string().max(100).allow('').optional(),
        data_inicial: Joi.date().allow('').optional(),
        data_final: Joi.date().allow('').optional()
    })
}), ingredienteController.historicoCompras);

router.get('/acertos-estoque', login.verifyToken, roles.adminRole, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        nome_ingrediente: Joi.string().max(100).allow('').optional(),
        data_inicial: Joi.date().allow('').optional(),
        data_final: Joi.date().allow('').optional(),
    })
}), ingredienteController.historicoAcertoEstoque);

router.get('/', login.verifyToken, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        id: Joi.number().integer().allow('').optional(),
        nome: Joi.string().max(100).allow('').optional(),
        grupo: Joi.string().max(100).allow('').optional()
    })
}), ingredienteController.getAllIngredientes);

router.post('/create', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
        id_grupo: Joi.number().integer().min(1).required(),
        estoque_minimo: Joi.number().integer().min(1).required(),
    })
}), ingredienteController.createIngrediente);

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

router.post('/comprar', login.verifyToken, roles.adminRole, celebrate({
    [Segments.BODY]: Joi.object().keys({
        data_compra: Joi.date().required(),
        id_ingrediente: Joi.number().integer().min(1).required(),
        quantidade_bruta: Joi.number().integer().min(1).required(),
        pre_limpeza: Joi.number().integer().required(),
        valor_unitario: Joi.number().min(1).required(),
        numero_nota: Joi.string().min(3).max(100).required(),
        fornecedor: Joi.string().min(3).max(100).required()
    })
}), ingredienteController.comprarIngrediente);

router.post('/acertar-estoque', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        id_ingrediente: Joi.number().integer().min(1).required(),
        quantidade: Joi.number().integer().min(1).required()
    })
}), ingredienteController.acertarEstoque);

router.delete('/delete/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    })
}), ingredienteController.deleteIngrediente);

// Rotas utilizadas nos gráficos
router.get('/mais-comprados', ingredienteController.getIngredientesMaisComprados);

router.use(errors());

module.exports = router;
