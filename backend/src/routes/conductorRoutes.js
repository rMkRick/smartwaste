const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/conductorController');
const { verificarToken, soloRoles } = require('../middleware/auth');

const soloAdmin = [verificarToken, soloRoles(3)];

router.get('/',    verificarToken,  ctrl.listar);    // admin + supervisor pueden listar
router.get('/:id', verificarToken,  ctrl.obtener);
router.post('/',   soloAdmin,       ctrl.crear);
router.put('/:id', soloAdmin,       ctrl.actualizar);
router.put('/:id/estado', verificarToken, soloRoles(3, 4), ctrl.cambiarEstado); // admin + supervisor
router.delete('/:id', soloAdmin,    ctrl.eliminar);

module.exports = router;
