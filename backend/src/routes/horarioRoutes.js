const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');
const { verificarToken } = require('../middleware/auth');

router.get('/',                    verificarToken, horarioController.todos);        // CU6
router.get('/zona/:zona_id',       verificarToken, horarioController.porZona);      // CU6

module.exports = router;
