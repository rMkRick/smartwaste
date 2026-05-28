const Usuario = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── Validaciones en servidor ──────────────────────────────────────────────────
const validarDatos = ({ nombres, apellidos, dni, correo, contrasena, zona_id }) => {
    const errores = [];

    if (!nombres || nombres.trim().length < 2)
        errores.push('El nombre debe tener al menos 2 caracteres');

    if (!apellidos || apellidos.trim().length < 2)
        errores.push('El apellido debe tener al menos 2 caracteres');

    if (!dni || !/^\d{8}$/.test(dni))
        errores.push('El DNI debe tener exactamente 8 dígitos numéricos');

    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
        errores.push('El correo electrónico no es válido');

    if (!contrasena || contrasena.length < 8)
        errores.push('La contraseña debe tener al menos 8 caracteres');

    if (!zona_id || isNaN(zona_id))
        errores.push('Debes seleccionar una zona de residencia');

    return errores;
};

exports.register = async (req, res) => {
    try {
        const { nombres, apellidos, dni, correo, contrasena, rol_id, zona_id } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.buscarPorCorreo(correo);
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // Cifrar contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaCifrada = await bcrypt.hash(contrasena, salt);

        // Crear usuario
        const usuarioId = await Usuario.crear({
            nombres,
            apellidos,
            dni,
            correo,
            contrasena: contrasenaCifrada,
            rol_id: rol_id || 1, // Por defecto 'ciudadano'
            zona_id
        });

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuarioId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

exports.login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        // Buscar usuario
        const usuario = await Usuario.buscarPorCorreo(correo);
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        // Validar contraseña
        const esMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esMatch) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol_id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombres,
                rol: usuario.rol_id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};
