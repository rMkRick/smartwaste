const db = require('../config/db');

const Zona = {
    buscarTodas: async () => {
        const [rows] = await db.execute('SELECT * FROM zonas WHERE estado = "activo" ORDER BY nombre');
        return rows;
    },
    buscarPorId: async (id) => {
        const [rows] = await db.execute('SELECT * FROM zonas WHERE id = ?', [id]);
        return rows[0];
    },
    crear: async ({ nombre, descripcion }) => {
        const [r] = await db.execute('INSERT INTO zonas (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
        return r.insertId;
    },
    actualizar: async (id, { nombre, descripcion, estado }) => {
        await db.execute('UPDATE zonas SET nombre=?, descripcion=?, estado=? WHERE id=?', [nombre, descripcion, estado, id]);
    },
    eliminar: async (id) => {
        await db.execute('UPDATE zonas SET estado="inactivo" WHERE id=?', [id]);
    }
};

module.exports = Zona;
