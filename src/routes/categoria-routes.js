const express = require('express');
const categoriaController = require('../controllers/categoria-controller');
const login = require('../middlewares/login-middleware');

const router = express.Router();

router.get('/', login.verifyToken, categoriaController.getAllCategorias);

router.post('/create', login.verifyToken, categoriaController.createCategoria);

router.patch('/update/:id', login.verifyToken, categoriaController.updateCategoria);

router.delete('/delete/:id', login.verifyToken, categoriaController.deleteCategoria);

module.exports = router;
