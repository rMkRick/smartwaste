const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');
const { verificarToken, soloRoles } = require('../middleware/auth');

router.get('/',            verificarToken, rutaController.listar);                          // CU12
router.get('/mi-ruta',     verificarToken, soloRoles(2), rutaController.miRuta);           // CU13
router.post('/',           verificarToken, soloRoles(3), rutaController.crear);             // CU12
router.put('/:id',         verificarToken, soloRoles(3), rutaController.actualizar);        // CU12
router.delete('/:id',      verificarToken, soloRoles(3), rutaController.eliminar);          // CU12
router.post('/asignar',    verificarToken, soloRoles(3), rutaController.asignar);           // CU12

module.exports = router;
