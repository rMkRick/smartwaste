const express = require('express');
const router = express.Router();
const recoleccionController = require('../controllers/recoleccionController');
const { verificarToken, soloRoles } = require('../middleware/auth');

router.get('/',              verificarToken, soloRoles(2), recoleccionController.misRecolecciones);
router.post('/',             verificarToken, soloRoles(2), recoleccionController.registrar);        // CU14
router.put('/:id/completar', verificarToken, soloRoles(2), recoleccionController.completar);       // CU15

module.exports = router;
