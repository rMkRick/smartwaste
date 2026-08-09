const Reporte = require('../models/Report');
const Ruta = require('../models/Ruta');
const Recoleccion = require('../models/Recoleccion');
const Notificacion = require('../models/Notificacion');
const db = require('../config/db');

// Gestión de rutas con estado de asignación actual (hoy)
exports.rutasGestion = async (req, res) => {
    try {
        const [rutas] = await db.execute(`
            SELECT r.id, r.nombre, r.descripcion, r.waypoints,
                   z.nombre AS zona_nombre,
                   ar.id          AS asignacion_id,
                   ar.estado      AS asignacion_estado,
                   ar.fecha_asignacion,
                   ar.hora_inicio,
                   ar.hora_fin,
                   c.id           AS camion_id,
                   c.placa,
                   c.modelo,
                   c.capacidad_kg,
                   c.estado       AS camion_estado,
                   op.id          AS operador_id,
                   op.nombres     AS operador_nombres,
                   op.apellidos   AS operador_apellidos
            FROM rutas r
            LEFT JOIN zonas z ON r.zona_id = z.id
            LEFT JOIN asignacion_rutas ar
                   ON ar.ruta_id = r.id
                  AND ar.estado IN ('pendiente','en_proceso')
                  AND ar.fecha_asignacion = CURDATE()
            LEFT JOIN camiones c ON ar.camion_id = c.id
            LEFT JOIN usuarios op ON ar.operador_id = op.id
            WHERE r.estado = 'activo'
            ORDER BY r.nombre
        `);
        const parsed = rutas.map(r => ({
            ...r,
            waypoints: typeof r.waypoints === 'string' ? JSON.parse(r.waypoints) : (r.waypoints || [])
        }));
        res.json(parsed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener rutas' });
    }
};

// Asignaciones del mes (para calendario de planificación)
exports.asignacionesMes = async (req, res) => {
    try {
        const hoy = new Date();
        const anio = parseInt(req.query.anio) || hoy.getFullYear();
        const mes = parseInt(req.query.mes) || (hoy.getMonth() + 1);
        const inicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
        const fin = new Date(anio, mes, 0).toISOString().slice(0, 10); // último día del mes

        const [asignaciones] = await db.execute(`
            SELECT ruta_id, fecha_asignacion, estado
            FROM asignacion_rutas
            WHERE fecha_asignacion BETWEEN ? AND ?
              AND estado IN ('pendiente','en_proceso','completado')
        `, [inicio, fin]);

        res.json({ anio, mes, asignaciones });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener asignaciones del mes' });
    }
};

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
