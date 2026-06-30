const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

router.post('/register',          authController.register);       // CU3
router.post('/login',             authController.login);          // CU1
router.post('/login-social',      authController.loginSocial);    // CU2
router.get('/perfil',             verificarToken, authController.perfil);
router.put('/perfil',             verificarToken, authController.modificarPerfil);    // CU4
router.put('/cambiar-contrasena', verificarToken, authController.cambiarContrasena);  // CU4

module.exports = router;
