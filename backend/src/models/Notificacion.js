const db = require('../config/db');

const Notificacion = {
    buscarPorUsuario: async (usuario_id) => {
        const [rows] = await db.execute(
            'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_creacion DESC LIMIT 50',
            [usuario_id]
        );
        return rows;
    },
    noLeidas: async (usuario_id) => {
        const [rows] = await db.execute(
            'SELECT * FROM notificaciones WHERE usuario_id = ? AND leido = FALSE ORDER BY fecha_creacion DESC',
            [usuario_id]
        );
        return rows;
    },
    crear: async ({ usuario_id, titulo, mensaje, tipo, referencia_id, referencia_tipo }) => {
        const [r] = await db.execute(
            'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id, referencia_tipo) VALUES (?,?,?,?,?,?)',
            [usuario_id, titulo, mensaje, tipo || 'informativo', referencia_id || null, referencia_tipo || null]
        );
        return r.insertId;
    },
    marcarLeida: async (id, usuario_id) => {
        await db.execute(
            'UPDATE notificaciones SET leido = TRUE WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );
    },
    marcarTodasLeidas: async (usuario_id) => {
        await db.execute(
            'UPDATE notificaciones SET leido = TRUE WHERE usuario_id = ?',
            [usuario_id]
        );
    }
};

module.exports = Notificacion;
