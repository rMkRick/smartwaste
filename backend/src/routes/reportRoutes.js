const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verificarToken } = require('../middleware/auth');

router.post('/',                       verificarToken, reportController.createReport);    // CU5
router.get('/',                        verificarToken, reportController.getReports);
router.get('/mis-reportes',            verificarToken, reportController.getUserReports);  // CU5 historial
router.get('/usuario/:usuarioId',      verificarToken, reportController.getUserReports);

module.exports = router;
