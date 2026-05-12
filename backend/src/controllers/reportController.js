const Reporte = require('../models/Report');

exports.createReport = async (req, res) => {
    try {
        const { usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion } = req.body;

        // Generar número de ticket único (Ej: TKT-2026-XXXX)
        const numero_ticket = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const reporteId = await Reporte.crear({
            usuario_id,
            foto_url,
            latitud,
            longitud,
            tipo_residuo_id,
            descripcion,
            numero_ticket
        });

        res.status(201).json({ 
            mensaje: 'Reporte registrado exitosamente', 
            numero_ticket,
            reporteId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el reporte' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reportes = await Reporte.buscarTodos();
        res.json(reportes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los reportes' });
    }
};

exports.getUserReports = async (req, res) => {
    try {
        const reportes = await Reporte.buscarPorUsuarioId(req.params.usuarioId);
        res.json(reportes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener reportes del usuario' });
    }
};
