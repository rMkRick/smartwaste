const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/', reportController.createReport);
router.get('/', reportController.getReports);
router.get('/usuario/:usuarioId', reportController.getUserReports);

module.exports = router;
