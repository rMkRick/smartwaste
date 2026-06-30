const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// CU1, CU2, CU3, CU4
app.use('/api/auth',           require('./routes/authRoutes'));
// CU5
app.use('/api/reportes',       require('./routes/reportRoutes'));
// CU6
app.use('/api/horarios',       require('./routes/horarioRoutes'));
// CU7, CU11, CU16
app.use('/api/camiones',       require('./routes/camionRoutes'));
// CU8, CU9
app.use('/api/notificaciones', require('./routes/notificacionRoutes'));
// CU10
app.use('/api/zonas',          require('./routes/zonaRoutes'));
// CU12, CU13
app.use('/api/rutas',          require('./routes/rutaRoutes'));
// CU14, CU15
app.use('/api/recolecciones',  require('./routes/recoleccionRoutes'));
// CU17, CU18, CU19, CU20, CU21, CU22
app.use('/api/supervisor',     require('./routes/supervisorRoutes'));

app.get('/', (req, res) => res.json({ mensaje: 'SmartWaste API - Cusco', version: '2.0' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
