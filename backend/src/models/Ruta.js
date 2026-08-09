const db = require('../config/db');

const Ruta = {
    buscarTodas: async () => {
        const [rows] = await db.execute(`
            SELECT r.id, r.nombre, r.descripcion, r.estado, r.waypoints,
                   z.nombre AS zona_nombre, z.id AS zona_id
            FROM rutas r LEFT JOIN zonas z ON r.zona_id = z.id
            WHERE r.estado = 'activo' ORDER BY r.nombre
        `);
        return rows.map(r => ({
            ...r,
            waypoints: typeof r.waypoints === 'string' ? JSON.parse(r.waypoints) : (r.waypoints || [])
        }));
    },
    buscarPorId: async (id) => {
        const [rows] = await db.execute('SELECT * FROM rutas WHERE id = ?', [id]);
        return rows[0];
    },
    crear: async ({ nombre, zona_id, descripcion }) => {
        const [r] = await db.execute(
            'INSERT INTO rutas (nombre, zona_id, descripcion) VALUES (?, ?, ?)',
            [nombre, zona_id, descripcion]
        );
        return r.insertId;
    },
    actualizar: async (id, { nombre, zona_id, descripcion, estado, waypoints }) => {
        await db.execute(
            'UPDATE rutas SET nombre=?, zona_id=?, descripcion=?, estado=?, waypoints=? WHERE id=?',
            [nombre, zona_id, descripcion, estado,
             waypoints !== undefined ? JSON.stringify(waypoints) : null, id]
        );
    },
    actualizarWaypoints: async (id, waypoints) => {
        await db.execute(
            'UPDATE rutas SET waypoints=? WHERE id=?',
            [JSON.stringify(waypoints), id]
        );
    },
    eliminar: async (id) => {
        await db.execute('UPDATE rutas SET estado="inactivo" WHERE id=?', [id]);
    },
    obtenerZonaNombre: async (ruta_id) => {
        const [rows] = await db.execute(
            'SELECT z.nombre AS zona_nombre FROM rutas r JOIN zonas z ON r.zona_id = z.id WHERE r.id = ?',
            [ruta_id]
        );
        return rows[0]?.zona_nombre || null;
    },
    buscarAsignacionPorOperador: async (operador_id) => {
        const [rows] = await db.execute(`
            SELECT ar.*, r.nombre AS ruta_nombre, r.descripcion AS ruta_descripcion, r.waypoints,
                   z.nombre AS zona_nombre, c.placa, c.modelo,
                   c.latitud_actual, c.longitud_actual, c.gps_activo
            FROM asignacion_rutas ar
            JOIN rutas r ON ar.ruta_id = r.id
            JOIN zonas z ON r.zona_id = z.id
            JOIN camiones c ON ar.camion_id = c.id
            WHERE ar.operador_id = ? AND ar.estado IN ('pendiente','en_proceso')
            ORDER BY ar.fecha_asignacion DESC
        `, [operador_id]);
        return rows.map(r => ({
            ...r,
            waypoints: typeof r.waypoints === 'string' ? JSON.parse(r.waypoints) : (r.waypoints || [])
        }));
    },
    crearAsignacion: async ({ camion_id, ruta_id, operador_id, fecha_asignacion, hora_inicio, hora_fin }) => {
        // Reasignar reemplaza cualquier asignación pendiente/en curso previa de esta
        // ruta en la misma fecha, en vez de acumular filas duplicadas.
        await db.execute(
            "UPDATE asignacion_rutas SET estado='cancelado' WHERE ruta_id=? AND fecha_asignacion=? AND estado IN ('pendiente','en_proceso')",
            [ruta_id, fecha_asignacion]
        );

        const [r] = await db.execute(
            'INSERT INTO asignacion_rutas (camion_id, ruta_id, operador_id, fecha_asignacion, hora_inicio, hora_fin) VALUES (?,?,?,?,?,?)',
            [camion_id, ruta_id, operador_id, fecha_asignacion, hora_inicio || null, hora_fin || null]
        );
        return r.insertId;
    },
    cumplimientoRutas: async () => {
        const [rows] = await db.execute(`
            SELECT ar.id, r.nombre AS ruta, z.nombre AS zona,
                   u.nombres AS operador, c.placa,
                   ar.fecha_asignacion, ar.estado,
                   rc.cantidad_kg, rc.fecha_completado
            FROM asignacion_rutas ar
            JOIN rutas r    ON ar.ruta_id     = r.id
            JOIN zonas z    ON r.zona_id      = z.id
            JOIN usuarios u ON ar.operador_id = u.id
            JOIN camiones c ON ar.camion_id   = c.id
            LEFT JOIN recolecciones rc ON rc.asignacion_id = ar.id
            ORDER BY ar.fecha_asignacion DESC
            LIMIT 100
        `);
        return rows;
    }
};

module.exports = Ruta;
