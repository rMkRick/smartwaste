const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const { verificarToken, soloRoles } = require('../middleware/auth');

const soloSupervisor = [verificarToken, soloRoles(4)];

router.get('/reportes',                soloSupervisor, supervisorController.consultarReportes);     // CU17
router.get('/cumplimiento-rutas',      soloSupervisor, supervisorController.cumplimientoRutas);     // CU18
router.get('/reporte-ambiental',       soloSupervisor, supervisorController.reporteAmbiental);      // CU19
router.get('/participacion-ciudadana', soloSupervisor, supervisorController.participacionCiudadana);// CU20
router.get('/incidencias',             soloSupervisor, supervisorController.listarIncidencias);      // CU21
router.get('/incidencias/:id',         soloSupervisor, supervisorController.verIncidencia);          // CU21
router.put('/incidencias/:id/responder', soloSupervisor, supervisorController.responderReporte);    // CU22

module.exports = router;
