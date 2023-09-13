const express = require('express');
const racaoController = require('../controllers/racao-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');

const router = express.Router();

router.get('/historico-compras', login.verifyToken, roles.adminRole, racaoController.historicoCompras);

router.get('/historico-producao', login.verifyToken, racaoController.historicoProducao);

router.get('/', login.verifyToken, racaoController.getAllRacoes);

router.get('/:id', login.verifyToken, racaoController.getRacaoById);

router.post('/create', login.verifyToken, racaoController.createRacao);

router.patch('/update-ingredientes', login.verifyToken, racaoController.updateIngredienteInRacao);

router.delete('/delete-ingrediente', login.verifyToken, racaoController.deleteIngredienteFromRacao);

router.post('/comprar', login.verifyToken, roles.adminRole, racaoController.comprarRacao);

router.post('/produzir', login.verifyToken, racaoController.produzirRacao);

router.patch('/update/:id', login.verifyToken, racaoController.updateRacao);

router.delete('/delete/:id', login.verifyToken, racaoController.deleteRacao)

module.exports = router;
