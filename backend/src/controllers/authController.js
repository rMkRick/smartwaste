const Usuario = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generarToken = (usuario) =>
    jwt.sign({ id: usuario.id, rol: usuario.rol_id }, process.env.JWT_SECRET, { expiresIn: '8h' });

const validarDatos = ({ nombres, apellidos, dni, correo, contrasena, zona_id }) => {
    const e = [];
    if (!nombres || nombres.trim().length < 2)      e.push('Nombre debe tener al menos 2 caracteres');
    if (!apellidos || apellidos.trim().length < 2)   e.push('Apellido debe tener al menos 2 caracteres');
    if (!dni || !/^\d{8}$/.test(dni))                e.push('DNI debe tener 8 dígitos');
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.push('Correo inválido');
    if (!contrasena || contrasena.length < 8)        e.push('Contraseña debe tener al menos 8 caracteres');
    if (!zona_id || isNaN(zona_id))                  e.push('Debes seleccionar una zona');
    return e;
};

// CU3: registroUsuario
exports.register = async (req, res) => {
    try {
        const { nombres, apellidos, dni, correo, contrasena, rol_id, zona_id } = req.body;
        const errores = validarDatos({ nombres, apellidos, dni, correo, contrasena, zona_id });
        if (errores.length) return res.status(400).json({ errores });

        if (await Usuario.buscarPorCorreo(correo))
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        if (await Usuario.buscarPorDNI(dni))
            return res.status(400).json({ mensaje: 'El DNI ya está registrado' });

        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(contrasena, salt);
        const usuarioId = await Usuario.crear({ nombres, apellidos, dni, correo, contrasena: contrasenaHash, rol_id, zona_id });
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuarioId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// CU1: iniciarSesion
exports.login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        const usuario = await Usuario.buscarPorCorreo(correo);
        if (!usuario || !usuario.contrasena)
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esValida) return res.status(400).json({ mensaje: 'Credenciales inválidas' });

        res.json({
            token: generarToken(usuario),
            usuario: { id: usuario.id, nombre: usuario.nombres, rol: usuario.rol_id }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// CU2: loginSocial (Google / Facebook — el frontend envía el perfil ya verificado)
exports.loginSocial = async (req, res) => {
    try {
        const { nombres, apellidos, correo, foto_perfil, proveedor_social, proveedor_id } = req.body;
        if (!proveedor_social || !proveedor_id || !correo)
            return res.status(400).json({ mensaje: 'Datos de proveedor incompletos' });

        let usuario = await Usuario.buscarPorProveedor(proveedor_social, proveedor_id)
                   || await Usuario.buscarPorCorreo(correo);

        if (!usuario) {
            const id = await Usuario.crearSocial({ nombres, apellidos, correo, foto_perfil, proveedor_social, proveedor_id });
            usuario = await Usuario.buscarPorId(id);
        }

        res.json({
            token: generarToken(usuario),
            usuario: { id: usuario.id, nombre: usuario.nombres, rol: usuario.rol_id }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// CU4: modificarDatos
exports.modificarPerfil = async (req, res) => {
    try {
        const { nombres, apellidos, zona_id, foto_perfil } = req.body;
        await Usuario.actualizar(req.usuario.id, { nombres, apellidos, zona_id, foto_perfil });
        const actualizado = await Usuario.buscarPorId(req.usuario.id);
        res.json({ mensaje: 'Perfil actualizado', usuario: actualizado });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al actualizar perfil' });
    }
};

// CU4: cambiar contraseña
exports.cambiarContrasena = async (req, res) => {
    try {
        const { contrasena_actual, contrasena_nueva } = req.body;
        const usuario = await Usuario.buscarPorCorreo(
            (await Usuario.buscarPorId(req.usuario.id)).correo
        );
        if (!usuario.contrasena || !(await bcrypt.compare(contrasena_actual, usuario.contrasena)))
            return res.status(400).json({ mensaje: 'Contraseña actual incorrecta' });
        if (!contrasena_nueva || contrasena_nueva.length < 8)
            return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 8 caracteres' });

        const hash = await bcrypt.hash(contrasena_nueva, await bcrypt.genSalt(10));
        await Usuario.actualizarContrasena(req.usuario.id, hash);
        res.json({ mensaje: 'Contraseña actualizada exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
    }
};

exports.perfil = async (req, res) => {
    try {
        const usuario = await Usuario.buscarPorId(req.usuario.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener perfil' });
    }
};
