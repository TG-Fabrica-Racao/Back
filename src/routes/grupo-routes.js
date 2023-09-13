const express = require('express');
const grupoController = require('../controllers/grupo-controller');
const login = require('../middlewares/login-middleware');

const router = express.Router();

router.get('/', login.verifyToken, grupoController.getAllGrupos);

router.post('/create', login.verifyToken, grupoController.createGrupo);

router.patch('/update/:id', login.verifyToken, grupoController.updateGrupo);

router.delete('/delete/:id', login.verifyToken, grupoController.deleteGrupo);

module.exports = router;
