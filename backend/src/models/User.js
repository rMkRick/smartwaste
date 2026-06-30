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
    buscarPorId: async (id) => {
        const [rows] = await db.execute(
            'SELECT id,nombres,apellidos,dni,correo,rol_id,zona_id,foto_perfil,estado,fecha_creacion FROM usuarios WHERE id = ?',
            [id]
        );
        return rows[0];
    },
    buscarPorProveedor: async (proveedor_social, proveedor_id) => {
        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE proveedor_social = ? AND proveedor_id = ?',
            [proveedor_social, proveedor_id]
        );
        return rows[0];
    },
    crear: async ({ nombres, apellidos, dni, correo, contrasena, rol_id, zona_id }) => {
        const [r] = await db.execute(
            'INSERT INTO usuarios (nombres, apellidos, dni, correo, contrasena, rol_id, zona_id) VALUES (?,?,?,?,?,?,?)',
            [nombres, apellidos, dni, correo, contrasena, rol_id || 1, zona_id]
        );
        return r.insertId;
    },
    crearSocial: async ({ nombres, apellidos, correo, foto_perfil, proveedor_social, proveedor_id, zona_id }) => {
        const [r] = await db.execute(
            `INSERT INTO usuarios (nombres, apellidos, correo, foto_perfil, proveedor_social, proveedor_id, rol_id, zona_id)
             VALUES (?,?,?,?,?,?,1,?)`,
            [nombres, apellidos, correo, foto_perfil, proveedor_social, proveedor_id, zona_id || null]
        );
        return r.insertId;
    },
    actualizar: async (id, { nombres, apellidos, zona_id, foto_perfil }) => {
        await db.execute(
            'UPDATE usuarios SET nombres=?, apellidos=?, zona_id=?, foto_perfil=? WHERE id=?',
            [nombres, apellidos, zona_id, foto_perfil, id]
        );
    },
    actualizarContrasena: async (id, contrasena) => {
        await db.execute('UPDATE usuarios SET contrasena=? WHERE id=?', [contrasena, id]);
    }
};

module.exports = Usuario;
