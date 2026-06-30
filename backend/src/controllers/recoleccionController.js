const Recoleccion = require('../models/Recoleccion');
const Notificacion = require('../models/Notificacion');
const Reporte = require('../models/Report');
const db = require('../config/db');

// CU14: registrarRecoleccion
exports.registrar = async (req, res) => {
    try {
        const { asignacion_id, zona_id, tipo_residuo_id, cantidad_kg, observaciones } = req.body;
        const id = await Recoleccion.crear({
            asignacion_id, operador_id: req.usuario.id,
            zona_id, tipo_residuo_id, cantidad_kg, observaciones
        });

        // Actualizar estado de asignacion a en_proceso
        if (asignacion_id) {
            await db.execute(
                `UPDATE asignacion_rutas SET estado='en_proceso' WHERE id=? AND estado='pendiente'`,
                [asignacion_id]
            );
        }

        res.status(201).json({ mensaje: 'Recolección registrada', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al registrar recolección' });
    }
};

// CU15: marcarRecoleccionCompletada
exports.completar = async (req, res) => {
    try {
        const afectados = await Recoleccion.marcarCompletado(req.params.id, req.usuario.id);
        if (!afectados) return res.status(404).json({ mensaje: 'Recolección no encontrada o ya completada' });

        // Buscar reportes pendientes de la zona de esta recolección y marcarlos completados
        const [recoleccion] = await db.execute(
            'SELECT zona_id, asignacion_id FROM recolecciones WHERE id=?', [req.params.id]
        );
        if (recoleccion[0]?.asignacion_id) {
            await db.execute(
                `UPDATE asignacion_rutas SET estado='completado' WHERE id=?`,
                [recoleccion[0].asignacion_id]
            );
        }

        // Buscar ciudadanos de esa zona con reportes enviados y notificarlos
        if (recoleccion[0]?.zona_id) {
            const [reportesPendientes] = await db.execute(
                `SELECT r.id, r.usuario_id, r.numero_ticket
                 FROM reportes r
                 JOIN usuarios u ON r.usuario_id = u.id
                 WHERE u.zona_id = ? AND r.estado IN ('enviado','leido','en_proceso')`,
                [recoleccion[0].zona_id]
            );
            for (const rep of reportesPendientes) {
                await db.execute(
                    `UPDATE reportes SET estado='completado' WHERE id=?`, [rep.id]
                );
                await Notificacion.crear({
                    usuario_id: rep.usuario_id,
                    titulo: 'Recolección completada',
                    mensaje: `Tu reporte ${rep.numero_ticket} ha sido atendido. La recolección en tu zona fue completada.`,
                    tipo: 'informativo',
                    referencia_id: rep.id,
                    referencia_tipo: 'reporte'
                });
            }
        }

        res.json({ mensaje: 'Recolección completada exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al completar recolección' });
    }
};

// Historial del operador
exports.misRecolecciones = async (req, res) => {
    try { res.json(await Recoleccion.buscarPorOperador(req.usuario.id)); }
    catch { res.status(500).json({ mensaje: 'Error al obtener recolecciones' }); }
};
