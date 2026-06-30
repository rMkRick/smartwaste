const Reporte = require('../models/Report');

// CU5: registrarReporteResiduos
exports.createReport = async (req, res) => {
    try {
        const { usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion } = req.body;
        const numero_ticket = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4,'0')}`;

        const reporteId = await Reporte.crear({
            usuario_id: usuario_id || req.usuario?.id,
            foto_url, latitud, longitud,
            tipo_residuo_id, descripcion, numero_ticket
        });

        res.status(201).json({ mensaje: 'Reporte enviado exitosamente', reporteId, estado: 'enviado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al registrar el reporte' });
    }
};

exports.getReports = async (req, res) => {
    try { res.json(await Reporte.buscarTodos()); }
    catch { res.status(500).json({ mensaje: 'Error al obtener los reportes' }); }
};

exports.getUserReports = async (req, res) => {
    try {
        const id = req.params.usuarioId || req.usuario?.id;
        res.json(await Reporte.buscarPorUsuario(id));
    } catch { res.status(500).json({ mensaje: 'Error al obtener reportes del usuario' }); }
};
