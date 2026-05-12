const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de SmartWaste Cusco funcionando 🚀');
});

// Configuración del puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en: http://localhost:${PORT}`);
    console.log(`📡 API de SmartWaste Cusco en ejecución...`);
});
