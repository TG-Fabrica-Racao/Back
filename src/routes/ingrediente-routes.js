const express = require('express');
const ingredienteController = require('../controllers/ingrediente-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');

const router = express.Router();

router.get('/historico-compras', ingredienteController.historicoCompras);

router.get('/', ingredienteController.getAllIngredientes);

router.get('/:id', ingredienteController.getIngredienteById);

router.post('/create', ingredienteController.createIngrediente);

router.post('/comprar', ingredienteController.comprarIngrediente);

router.patch('/update/:id', ingredienteController.updateIngrediente);

router.delete('/delete/:id', ingredienteController.deleteIngrediente);

module.exports = router;