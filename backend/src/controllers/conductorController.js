const Conductor = require('../models/Conductor');
const bcrypt = require('bcryptjs');

exports.listar = async (req, res) => {
    try { res.json(await Conductor.buscarTodos()); }
    catch { res.status(500).json({ mensaje: 'Error al obtener conductores' }); }
};

exports.obtener = async (req, res) => {
    try {
        const c = await Conductor.buscarPorId(req.params.id);
        if (!c) return res.status(404).json({ mensaje: 'Conductor no encontrado' });
        res.json(c);
    } catch { res.status(500).json({ mensaje: 'Error al obtener conductor' }); }
};

exports.crear = async (req, res) => {
    try {
        const { nombres, apellidos, dni, correo, contrasena,
                zona_id, licencia, categoria_licencia, telefono, fecha_ingreso } = req.body;
        if (!nombres || !apellidos || !correo || !licencia || !contrasena)
            return res.status(400).json({ mensaje: 'Nombre, apellidos, correo, licencia y contraseña son requeridos' });

        const hash = await bcrypt.hash(contrasena, 10);
        const ids = await Conductor.crear({
            nombres, apellidos, dni, correo, contrasena: hash,
            zona_id, licencia, categoria_licencia, telefono, fecha_ingreso
        });
        res.status(201).json({ mensaje: 'Conductor creado exitosamente', ...ids });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(400).json({ mensaje: 'El correo o DNI ya está registrado' });
        console.error(err);
        res.status(500).json({ mensaje: 'Error al crear conductor' });
    }
};

exports.actualizar = async (req, res) => {
    try {
        await Conductor.actualizar(req.params.id, req.body);
        res.json({ mensaje: 'Conductor actualizado' });
    } catch (err) {
        res.status(500).json({ mensaje: err.message || 'Error al actualizar conductor' });
    }
};

exports.eliminar = async (req, res) => {
    try {
        await Conductor.eliminar(req.params.id);
        res.json({ mensaje: 'Conductor desactivado' });
    } catch (err) {
        res.status(500).json({ mensaje: err.message || 'Error al eliminar conductor' });
    }
};

exports.cambiarEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        if (!['activo', 'inactivo'].includes(estado))
            return res.status(400).json({ mensaje: 'Estado inválido' });
        await Conductor.cambiarEstado(req.params.id, estado);
        res.json({ mensaje: estado === 'activo' ? 'Conductor activado' : 'Conductor desactivado' });
    } catch (err) {
        res.status(500).json({ mensaje: err.message || 'Error al cambiar estado del conductor' });
    }
};
