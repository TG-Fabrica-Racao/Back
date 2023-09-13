const express = require('express');
const userController = require('../controllers/user-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');

const router = express.Router();

router.get('/logs', userController.getLogs);

router.get('/', userController.getAllUser);

router.get('/:id', userController.getUserById);

router.post('/create', userController.createUser);

router.post('/login', userController.userLogin);

router.post('/identify', userController.identifyUser);

router.patch('/update', userController.updateUser);

router.patch('/update-password/:id', userController.updatePassword);

router.patch('/disable', userController.disableUser);

router.patch('/enable', userController.enableUser);

router.delete('/delete', userController.deleteUser);

module.exports = router;
