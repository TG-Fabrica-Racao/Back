const express = require('express');
const racaoController = require('../controllers/racao-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');
const { celebrate, Joi, errors, Segments } = require('celebrate');

const router = express.Router();

router.get('/historico-compras', login.verifyToken, roles.adminRole, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        data_inicial: Joi.date().allow('').optional(),
        data_final: Joi.date().allow('').optional(),
        nome_racao: Joi.string().max(100).allow('').optional(),
    })
}), racaoController.historicoCompras);

router.get('/historico-producao', login.verifyToken, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        data_inicial: Joi.date().allow('').optional(),
        data_final: Joi.date().allow('').optional(),
        nome_racao: Joi.string().max(100).allow('').optional(),
    })
}), racaoController.historicoProducao);

router.get('/acertos-estoque', login.verifyToken, roles.adminRole, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        data_inicial: Joi.date().allow('').optional(),
        data_final: Joi.date().allow('').optional(),
        nome_racao: Joi.string().max(100).allow('').optional()
    })
}), racaoController.historicoAcertoEstoque);

router.get('/', login.verifyToken, celebrate({
    [Segments.QUERY]: Joi.object().keys({
        id: Joi.number().integer().allow('').optional(),
        nome: Joi.string().max(100).allow('').optional(),
        categoria: Joi.string().max(100).allow('').optional(),
        fase_utilizada: Joi.string().max(100).allow('').optional(),
        tipo_racao: Joi.string().max(100).allow('').optional(),

    })
}), racaoController.getAllRacoes);

router.post('/create', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
        id_categoria: Joi.number().integer().min(1).required(),
        tipo_racao: Joi.string().valid('Produção própria', 'Comprada', 'Ambos').required(),
        fase_utilizada: Joi.number().integer().min(1).required(),
        estoque_minimo: Joi.number().integer().min(1).required(),
        ingredientes: Joi.array().items(Joi.object({
            id_ingrediente: Joi.number().integer().min(1).required(),
            quantidade: Joi.number().integer().min(1).required(),
        })),
    })
}), racaoController.createRacao);

router.post('/insert-ingredientes/:id_racao', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id_racao: Joi.number().integer().min(1).required()
    }),
    [Segments.BODY]: Joi.array().items(Joi.object().keys({
        id_ingrediente: Joi.number().integer().min(1).required(),
        quantidade: Joi.number().integer().min(1).required(),
    }))
}), racaoController.insertIngredienteInRacao);

router.patch('/update-ingredientes/:id_racao', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id_racao: Joi.number().integer().min(1).required()
    }),
    [Segments.BODY]: Joi.array().items(Joi.object().keys({
        id_ingrediente: Joi.number().integer().min(1).required(),
        quantidade: Joi.number().integer().min(1).required(),
    }))
}), racaoController.updateIngredienteInRacao);

router.delete('/delete-ingrediente', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id_racao: Joi.number().integer().min(1).required()
    }),
    [Segments.BODY]: Joi.object().keys({
        id_ingrediente: Joi.number().integer().min(1).required()
    })
  }), racaoController.deleteIngredienteFromRacao);

router.post('/comprar', login.verifyToken, roles.adminRole, celebrate({
    [Segments.BODY]: Joi.object().keys({
        id_racao: Joi.number().integer().min(1).required(),
        data_compra: Joi.date().required(),
        quantidade: Joi.number().integer().min(1).required(),
        valor_unitario: Joi.number().min(1).required(),
        numero_nota: Joi.string().min(3).max(100).required(),
        fornecedor: Joi.string().min(3).max(100).required()
    })
}), racaoController.comprarRacao);

router.post('/produzir', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        id_racao: Joi.number().integer().min(1).required(),
        quantidade: Joi.number().integer().min(1).required()
    })
}), racaoController.produzirRacao);

router.post('/acertar-estoque', login.verifyToken, celebrate({
    [Segments.BODY]: Joi.object().keys({
        id_racao: Joi.number().integer().min(1).required(),
        quantidade: Joi.number().integer().min(1).required()
    })
}), racaoController.acertarEstoque);

router.patch('/update/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    }),
    [Segments.BODY]: Joi.object().keys({
        nome: Joi.string().min(3).max(100).required(),
        id_categoria: Joi.number().integer().min(1).required(),
        tipo_racao: Joi.number().integer().min(0).required(),
        fase_utilizada: Joi.number().integer().min(1).required(),
        batida: Joi.number().integer().min(1).required()
    })
}), racaoController.updateRacao);

router.delete('/delete/:id', login.verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().min(1).required()
    })
}), racaoController.deleteRacao)

router.use(errors());

module.exports = router;
