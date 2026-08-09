const db = require('../config/db');

const Conductor = {
    buscarTodos: async () => {
        const [rows] = await db.execute(`
            SELECT c.id, c.licencia, c.categoria_licencia, c.telefono,
                   c.fecha_ingreso, c.estado AS conductor_estado,
                   u.id AS usuario_id, u.nombres, u.apellidos, u.dni,
                   u.correo, u.foto_perfil, u.estado AS usuario_estado,
                   z.nombre AS zona_nombre,
                   ar.id AS asignacion_id,
                   r.nombre AS ruta_actual,
                   cam.placa AS camion_actual
            FROM conductores c
            JOIN usuarios u ON c.usuario_id = u.id
            LEFT JOIN zonas z ON u.zona_id = z.id
            LEFT JOIN asignacion_rutas ar
                   ON ar.operador_id = u.id
                  AND ar.estado IN ('pendiente','en_proceso')
                  AND ar.fecha_asignacion = CURDATE()
                  AND (ar.hora_fin IS NULL OR TIMESTAMP(ar.fecha_asignacion, ar.hora_fin) > NOW())
            LEFT JOIN rutas r ON ar.ruta_id = r.id
            LEFT JOIN camiones cam ON ar.camion_id = cam.id
            ORDER BY (c.estado = 'activo') DESC, u.apellidos
        `);
        return rows;
    },

    buscarPorId: async (id) => {
        const [rows] = await db.execute(`
            SELECT c.*, u.nombres, u.apellidos, u.dni, u.correo,
                   u.foto_perfil, u.estado AS usuario_estado, u.zona_id
            FROM conductores c JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.id = ?
        `, [id]);
        return rows[0];
    },

    crear: async ({ nombres, apellidos, dni, correo, contrasena, zona_id,
                    licencia, categoria_licencia, telefono, fecha_ingreso }) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            const [u] = await conn.execute(
                `INSERT INTO usuarios (nombres, apellidos, dni, correo, contrasena, rol_id, zona_id)
                 VALUES (?,?,?,?,?,2,?)`,
                [nombres, apellidos, dni, correo, contrasena, zona_id || null]
            );
            const usuario_id = u.insertId;
            const [c] = await conn.execute(
                `INSERT INTO conductores (usuario_id, licencia, categoria_licencia, telefono, fecha_ingreso)
                 VALUES (?,?,?,?,?)`,
                [usuario_id, licencia, categoria_licencia || 'BIIIC', telefono || null, fecha_ingreso || null]
            );
            await conn.commit();
            return { usuario_id, conductor_id: c.insertId };
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    actualizar: async (id, { nombres, apellidos, telefono, licencia,
                              categoria_licencia, fecha_ingreso, estado }) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            const [[c]] = await conn.execute('SELECT usuario_id FROM conductores WHERE id=?', [id]);
            if (!c) throw new Error('Conductor no encontrado');
            await conn.execute(
                'UPDATE usuarios SET nombres=?, apellidos=? WHERE id=?',
                [nombres, apellidos, c.usuario_id]
            );
            await conn.execute(
                `UPDATE conductores SET licencia=?, categoria_licencia=?,
                 telefono=?, fecha_ingreso=?, estado=? WHERE id=?`,
                [licencia, categoria_licencia, telefono, fecha_ingreso, estado, id]
            );
            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    eliminar: async (id) => {
        const [[c]] = await db.execute('SELECT usuario_id FROM conductores WHERE id=?', [id]);
        if (!c) throw new Error('Conductor no encontrado');
        await db.execute("UPDATE conductores SET estado='inactivo' WHERE id=?", [id]);
        await db.execute("UPDATE usuarios SET estado='inactivo' WHERE id=?", [c.usuario_id]);
    },

    cambiarEstado: async (id, estado) => {
        const [[c]] = await db.execute('SELECT usuario_id FROM conductores WHERE id=?', [id]);
        if (!c) throw new Error('Conductor no encontrado');
        await db.execute('UPDATE conductores SET estado=? WHERE id=?', [estado, id]);
        await db.execute('UPDATE usuarios SET estado=? WHERE id=?', [estado, c.usuario_id]);
    },
};

module.exports = Conductor;
