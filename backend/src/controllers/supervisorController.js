const Reporte = require('../models/Report');
const Ruta = require('../models/Ruta');
const Recoleccion = require('../models/Recoleccion');
const Notificacion = require('../models/Notificacion');
const db = require('../config/db');

// CU17: consultarReportes
exports.consultarReportes = async (req, res) => {
    try {
        const reportes = await Reporte.buscarTodos();
        res.json(reportes);
    } catch { res.status(500).json({ mensaje: 'Error al obtener reportes' }); }
};

// CU18: verCumplimientoRutas
exports.cumplimientoRutas = async (req, res) => {
    try {
        const datos = await Ruta.cumplimientoRutas();
        const [totales] = await db.execute(`
            SELECT COUNT(*) AS total,
                   SUM(estado='completado') AS completadas,
                   SUM(estado IN ('pendiente','en_proceso')) AS en_curso,
                   SUM(estado='cancelado') AS canceladas
            FROM asignacion_rutas
        `);
        res.json({ resumen: totales[0], detalle: datos });
    } catch { res.status(500).json({ mensaje: 'Error al obtener cumplimiento de rutas' }); }
};

// CU19: generarReportesAmbientales
exports.reporteAmbiental = async (req, res) => {
    try {
        const estadisticas = await Recoleccion.estadisticasPorZona();
        const [totalesResiduos] = await db.execute(`
            SELECT tr.nombre AS tipo_residuo, tr.color,
                   COUNT(rc.id) AS recolecciones,
                   COALESCE(SUM(rc.cantidad_kg), 0) AS total_kg
            FROM tipos_residuos tr
            LEFT JOIN recolecciones rc ON rc.tipo_residuo_id = tr.id AND rc.estado='completado'
            GROUP BY tr.id
            ORDER BY total_kg DESC
        `);
        res.json({ por_zona: estadisticas, por_tipo_residuo: totalesResiduos });
    } catch { res.status(500).json({ mensaje: 'Error al generar reporte ambiental' }); }
};

// CU20: verParticipacionCiudadana
exports.participacionCiudadana = async (req, res) => {
    try {
        const participacion = await Reporte.participacionCiudadana();
        const [totalCiudadanos] = await db.execute(
            `SELECT COUNT(*) AS total FROM usuarios WHERE rol_id = 1 AND estado = 'activo'`
        );
        const [ciudadanosActivos] = await db.execute(
            `SELECT COUNT(DISTINCT usuario_id) AS activos FROM reportes`
        );
        res.json({
            total_ciudadanos: totalCiudadanos[0].total,
            ciudadanos_activos: ciudadanosActivos[0].activos,
            por_zona: participacion
        });
    } catch { res.status(500).json({ mensaje: 'Error al obtener participación ciudadana' }); }
};

// CU21: gestionarReportesIncidencias - listar
exports.listarIncidencias = async (req, res) => {
    try {
        const reportes = await Reporte.buscarTodos();
        res.json(reportes);
    } catch { res.status(500).json({ mensaje: 'Error al obtener incidencias' }); }
};

// CU21: gestionarReportesIncidencias - ver detalle y marcar como leído
exports.verIncidencia = async (req, res) => {
    try {
        const reporte = await Reporte.buscarPorId(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        await Reporte.marcarLeido(req.params.id);
        res.json(reporte);
    } catch { res.status(500).json({ mensaje: 'Error al obtener incidencia' }); }
};

// CU22: responderReporte (genera notificación al ciudadano, simula SMS)
exports.responderReporte = async (req, res) => {
    try {
        const { respuesta_supervisor, estado } = req.body;
        if (!respuesta_supervisor)
            return res.status(400).json({ mensaje: 'La respuesta es requerida' });

        const reporte = await Reporte.buscarPorId(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });

        const afectados = await Reporte.responder(req.params.id, {
            supervisor_id: req.usuario.id,
            respuesta_supervisor,
            estado: estado || 'en_proceso'
        });
        if (!afectados) return res.status(400).json({ mensaje: 'No se pudo actualizar el reporte' });

        // Notificación interna al ciudadano (simula SMS)
        await Notificacion.crear({
            usuario_id: reporte.usuario_id,
            titulo: 'Respuesta a tu reporte',
            mensaje: `Tu reporte ${reporte.numero_ticket} fue respondido: ${respuesta_supervisor}`,
            tipo: 'respuesta',
            referencia_id: reporte.id,
            referencia_tipo: 'reporte'
        });

        res.json({ mensaje: 'Reporte respondido y ciudadano notificado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al responder reporte' });
    }
};
