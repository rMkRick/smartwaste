const db = require('../config/db');

const Usuario = {
    buscarPorCorreo: async (correo) => {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        return rows[0];
    },
    
    buscarPorDNI: async (dni) => {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE dni = ?', [dni]);
        return rows[0];
    },

    crear: async (datosUsuario) => {
        const { nombres, apellidos, dni, correo, contrasena, rol_id, zona_id } = datosUsuario;
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombres, apellidos, dni, correo, contrasena, rol_id, zona_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombres, apellidos, dni, correo, contrasena, rol_id, zona_id]
        );
        return result.insertId;
    }
};

module.exports = Usuario;
