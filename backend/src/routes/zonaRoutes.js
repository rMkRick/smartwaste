const express = require('express');
const router = express.Router();
const zonaController = require('../controllers/zonaController');
const { verificarToken, soloRoles } = require('../middleware/auth');

router.get('/',       verificarToken, zonaController.listar);                              // todos
router.get('/:id',    verificarToken, zonaController.obtener);
router.post('/',      verificarToken, soloRoles(3), zonaController.crear);                 // CU10
router.put('/:id',    verificarToken, soloRoles(3), zonaController.actualizar);            // CU10
router.delete('/:id', verificarToken, soloRoles(3), zonaController.eliminar);              // CU10

module.exports = router;
