const express = require('express');
const ingredienteController = require('../controllers/ingrediente-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');

const router = express.Router();

router.get('/historico-compras', login.verifyToken, roles.adminRole, ingredienteController.historicoCompras);

router.get('/', login.verifyToken, ingredienteController.getAllIngredientes);

router.post('/create', login.verifyToken, ingredienteController.createIngrediente);

router.post('/comprar', login.verifyToken, roles.adminRole, ingredienteController.comprarIngrediente);

router.patch('/update/:id', login.verifyToken, ingredienteController.updateIngrediente);

router.delete('/delete/:id', login.verifyToken, ingredienteController.deleteIngrediente);

module.exports = router;
