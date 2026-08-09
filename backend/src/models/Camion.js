const db = require('../config/db');

const Camion = {
    // "en_ruta" no se guarda de forma permanente: se calcula según si el camión
    // tiene una asignación activa cuyo horario (hora_inicio-hora_fin) cubre el
    // momento actual, para que vuelva a 'disponible' solo al terminar su turno.
    buscarTodos: async () => {
        const [rows] = await db.execute(`
            SELECT c.*,
                   CASE
                       WHEN c.estado IN ('mantenimiento','de_baja') THEN c.estado
                       WHEN EXISTS (
                           SELECT 1 FROM asignacion_rutas ar
                           WHERE ar.camion_id = c.id
                             AND ar.estado IN ('pendiente','en_proceso')
                             AND ar.fecha_asignacion = CURDATE()
                             AND (ar.hora_fin IS NULL OR TIMESTAMP(ar.fecha_asignacion, ar.hora_fin) > NOW())
                       ) THEN 'en_ruta'
                       ELSE 'disponible'
                   END AS estado
            FROM camiones c
            ORDER BY c.placa
        `);
        return rows;
    },
    buscarPorId: async (id) => {
        const [rows] = await db.execute('SELECT * FROM camiones WHERE id = ?', [id]);
        return rows[0];
    },
    crear: async ({ placa, modelo, capacidad_kg }) => {
        const [r] = await db.execute(
            'INSERT INTO camiones (placa, modelo, capacidad_kg) VALUES (?, ?, ?)',
            [placa, modelo, capacidad_kg]
        );
        return r.insertId;
    },
    actualizar: async (id, { placa, modelo, capacidad_kg, estado }) => {
        await db.execute(
            'UPDATE camiones SET placa=?, modelo=?, capacidad_kg=?, estado=? WHERE id=?',
            [placa, modelo, capacidad_kg, estado, id]
        );
    },
    actualizarGPS: async (id, { latitud, longitud, gps_activo }) => {
        await db.execute(
            'UPDATE camiones SET latitud_actual=?, longitud_actual=?, gps_activo=? WHERE id=?',
            [latitud, longitud, gps_activo, id]
        );
    },
    eliminar: async (id) => {
        await db.execute('UPDATE camiones SET estado="mantenimiento" WHERE id=?', [id]);
    },
    cambiarEstado: async (id, estado) => {
        await db.execute('UPDATE camiones SET estado=? WHERE id=?', [estado, id]);
    }
};

module.exports = Camion;
