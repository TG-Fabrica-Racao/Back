const express = require('express');
const racaoController = require('../controllers/racao-controller');

const router = express.Router();

router.get('/historico-compras', racaoController.historicoCompras);

router.get('/historico-producao', racaoController.historicoProducao);

router.get('/', racaoController.getAllRacoes);

router.get('/:id', racaoController.getRacaoById);

router.post('/create', racaoController.createRacao);

router.post('/inserir-ingredientes', racaoController.insertIngredienteInRacao);

router.patch('/update-ingredientes', racaoController.updateIngredienteInRacao);

router.post('/comprar', racaoController.comprarRacao);

router.post('/produzir', racaoController.produzirRacao);

router.patch('/update/:id', racaoController.updateRacao);

router.delete('/delete-ingrediente', racaoController.deleteIngredienteFromRacao);

module.exports = router;
