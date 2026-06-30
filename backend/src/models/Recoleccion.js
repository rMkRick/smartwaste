const db = require('../config/db');

const Recoleccion = {
    crear: async ({ asignacion_id, operador_id, zona_id, tipo_residuo_id, cantidad_kg, observaciones }) => {
        const [r] = await db.execute(
            `INSERT INTO recolecciones (asignacion_id, operador_id, zona_id, tipo_residuo_id, cantidad_kg, observaciones)
             VALUES (?,?,?,?,?,?)`,
            [asignacion_id, operador_id, zona_id, tipo_residuo_id, cantidad_kg, observaciones]
        );
        return r.insertId;
    },
    marcarCompletado: async (id, operador_id) => {
        const [r] = await db.execute(
            `UPDATE recolecciones SET estado='completado', fecha_completado=NOW()
             WHERE id = ? AND operador_id = ? AND estado = 'en_proceso'`,
            [id, operador_id]
        );
        return r.affectedRows;
    },
    buscarPorOperador: async (operador_id) => {
        const [rows] = await db.execute(`
            SELECT rc.*, z.nombre AS zona_nombre, tr.nombre AS tipo_residuo
            FROM recolecciones rc
            LEFT JOIN zonas z           ON rc.zona_id         = z.id
            LEFT JOIN tipos_residuos tr ON rc.tipo_residuo_id = tr.id
            WHERE rc.operador_id = ?
            ORDER BY rc.fecha_inicio DESC
        `, [operador_id]);
        return rows;
    },
    estadisticasPorZona: async () => {
        const [rows] = await db.execute(`
            SELECT z.nombre AS zona, tr.nombre AS tipo_residuo,
                   COUNT(rc.id) AS total_recolecciones,
                   SUM(rc.cantidad_kg) AS total_kg
            FROM recolecciones rc
            JOIN zonas z           ON rc.zona_id         = z.id
            JOIN tipos_residuos tr ON rc.tipo_residuo_id = tr.id
            WHERE rc.estado = 'completado'
            GROUP BY z.id, tr.id
            ORDER BY z.nombre, tr.nombre
        `);
        return rows;
    }
};

module.exports = Recoleccion;
