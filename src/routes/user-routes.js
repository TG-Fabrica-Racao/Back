const express = require('express');
const userController = require('../controllers/user-controller');
const login = require('../middlewares/login-middleware');
const roles = require('../middlewares/roles-middleware');

const router = express.Router();

router.get('/logs', login.verifyToken, roles.adminRole, userController.getLogs);

router.get('/', login.verifyToken, roles.adminRole, userController.getAllUser);

router.get('/:id', login.verifyToken, roles.adminRole, userController.getUserById);

router.post('/create', login.verifyToken, roles.adminRole, userController.createUser);

router.post('/login', userController.userLogin);

router.post('/identify', userController.identifyUser);

router.patch('/update', login.verifyToken, roles.adminRole, userController.updateUser);

router.patch('/update-password/:id', login.verifyToken, userController.updatePassword);

router.patch('/disable', login.verifyToken, roles.adminRole, userController.disableUser);

router.patch('/enable', login.verifyToken, roles.adminRole, userController.enableUser);

router.delete('/delete', login.verifyToken, roles.adminRole, userController.deleteUser);

module.exports = router;
