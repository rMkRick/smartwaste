const db = require('../config/db');

const Reporte = {
    crear: async (datosReporte) => {
        const { usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion, numero_ticket } = datosReporte;
        const [result] = await db.execute(
            'INSERT INTO reportes (usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion, numero_ticket) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, foto_url, latitud, longitud, tipo_residuo_id, descripcion, numero_ticket]
        );
        return result.insertId;
    },
    buscarTodos: async () => {
        const [rows] = await db.execute(`
            SELECT r.*, tr.nombre as tipo_residuo, u.nombres, u.apellidos 
            FROM reportes r
            JOIN tipos_residuos tr ON r.tipo_residuo_id = tr.id
            JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.fecha_creacion DESC
        `);
        return rows;
    },
    buscarPorUsuarioId: async (usuarioId) => {
        const [rows] = await db.execute('SELECT * FROM reportes WHERE usuario_id = ? ORDER BY fecha_creacion DESC', [usuarioId]);
        return rows;
    }
};

module.exports = Reporte;
