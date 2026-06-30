const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { verificarToken } = require('../middleware/auth');

router.get('/',              verificarToken, notificacionController.listar);           // CU8
router.get('/no-leidas',     verificarToken, notificacionController.noLeidas);         // CU9
router.put('/leer-todas',    verificarToken, notificacionController.marcarTodasLeidas);// CU8
router.put('/:id/leer',      verificarToken, notificacionController.marcarLeida);      // CU8

module.exports = router;
