const db = require('../config/db');

const Reporte = {
    crear: async ({ usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion, numero_ticket }) => {
        const [r] = await db.execute(
            `INSERT INTO reportes (usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion, numero_ticket)
             VALUES (?,?,?,?,?,?,?)`,
            [usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion, numero_ticket]
        );
        return r.insertId;
    },
    buscarTodos: async () => {
        const [rows] = await db.execute(`
            SELECT r.id, r.numero_ticket, r.descripcion, r.estado,
                   r.latitud, r.longitud, r.foto_url,
                   r.respuesta_supervisor, r.fecha_respuesta,
                   r.fecha_creacion, r.fecha_actualizacion,
                   tr.nombre AS tipo_residuo, tr.color,
                   u.nombres, u.apellidos, u.correo
            FROM reportes r
            JOIN tipos_residuos tr ON r.tipo_residuo_id = tr.id
            JOIN usuarios u        ON r.usuario_id      = u.id
            ORDER BY r.fecha_creacion DESC
        `);
        return rows;
    },
    buscarPorId: async (id) => {
        const [rows] = await db.execute(`
            SELECT r.*, tr.nombre AS tipo_residuo, u.nombres, u.apellidos
            FROM reportes r
            JOIN tipos_residuos tr ON r.tipo_residuo_id = tr.id
            JOIN usuarios u        ON r.usuario_id      = u.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    },
    buscarPorUsuario: async (usuario_id) => {
        const [rows] = await db.execute(`
            SELECT r.*, tr.nombre AS tipo_residuo, tr.color
            FROM reportes r
            JOIN tipos_residuos tr ON r.tipo_residuo_id = tr.id
            WHERE r.usuario_id = ?
            ORDER BY r.fecha_creacion DESC
        `, [usuario_id]);
        return rows;
    },
    responder: async (id, { supervisor_id, respuesta_supervisor, estado }) => {
        const [r] = await db.execute(
            `UPDATE reportes
             SET supervisor_id=?, respuesta_supervisor=?, estado=?, fecha_respuesta=NOW()
             WHERE id=?`,
            [supervisor_id, respuesta_supervisor, estado || 'en_proceso', id]
        );
        return r.affectedRows;
    },
    marcarLeido: async (id) => {
        await db.execute(
            `UPDATE reportes SET estado='leido' WHERE id=? AND estado='enviado'`,
            [id]
        );
    },
    participacionCiudadana: async () => {
        const [rows] = await db.execute(`
            SELECT z.nombre AS zona,
                   COUNT(r.id)                                    AS total_reportes,
                   SUM(r.estado = 'completado')                   AS completados,
                   SUM(r.estado IN ('enviado','leido','en_proceso')) AS pendientes
            FROM reportes r
            JOIN usuarios u ON r.usuario_id = u.id
            JOIN zonas z    ON u.zona_id    = z.id
            GROUP BY z.id
            ORDER BY total_reportes DESC
        `);
        return rows;
    }
};

module.exports = Reporte;
