const db = require('../config/db');

const Horario = {
    buscarPorZona: async (zona_id) => {
        const [rows] = await db.execute(`
            SELECT h.*, r.nombre AS ruta_nombre, tr.nombre AS tipo_residuo, tr.color
            FROM horarios h
            JOIN rutas r          ON h.ruta_id         = r.id
            JOIN tipos_residuos tr ON h.tipo_residuo_id = tr.id
            WHERE r.zona_id = ? AND r.estado = 'activo'
            ORDER BY FIELD(h.dia_semana,'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), h.hora_inicio
        `, [zona_id]);
        return rows;
    },
    buscarTodos: async () => {
        const [rows] = await db.execute(`
            SELECT h.*, r.nombre AS ruta_nombre, z.nombre AS zona_nombre,
                   tr.nombre AS tipo_residuo, tr.color
            FROM horarios h
            JOIN rutas r           ON h.ruta_id         = r.id
            JOIN zonas z           ON r.zona_id          = z.id
            JOIN tipos_residuos tr ON h.tipo_residuo_id  = tr.id
            ORDER BY FIELD(h.dia_semana,'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), h.hora_inicio
        `);
        return rows;
    }
};

module.exports = Horario;
