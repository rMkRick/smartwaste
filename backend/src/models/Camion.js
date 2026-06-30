const db = require('../config/db');

const Camion = {
    buscarTodos: async () => {
        const [rows] = await db.execute('SELECT * FROM camiones ORDER BY placa');
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
    }
};

module.exports = Camion;
