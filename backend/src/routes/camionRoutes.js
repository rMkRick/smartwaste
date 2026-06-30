const express = require('express');
const router = express.Router();
const camionController = require('../controllers/camionController');
const { verificarToken, soloRoles } = require('../middleware/auth');

router.get('/',              verificarToken, camionController.listar);                        // CU11
router.get('/:id',           verificarToken, camionController.obtener);
router.get('/:id/ubicacion', verificarToken, camionController.ubicacion);                     // CU7
router.post('/',             verificarToken, soloRoles(3), camionController.crear);           // CU11
router.put('/:id',           verificarToken, soloRoles(3), camionController.actualizar);      // CU11
router.put('/:id/gps',       verificarToken, soloRoles(2), camionController.activarGPS);     // CU16
router.delete('/:id',        verificarToken, soloRoles(3), camionController.eliminar);        // CU11

module.exports = router;
