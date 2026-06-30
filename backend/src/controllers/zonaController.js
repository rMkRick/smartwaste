const Zona = require('../models/Zona');

// CU10: gestionarZonasRecoleccion
exports.listar = async (req, res) => {
    try { res.json(await Zona.buscarTodas()); }
    catch { res.status(500).json({ mensaje: 'Error al obtener zonas' }); }
};

exports.obtener = async (req, res) => {
    try {
        const zona = await Zona.buscarPorId(req.params.id);
        if (!zona) return res.status(404).json({ mensaje: 'Zona no encontrada' });
        res.json(zona);
    } catch { res.status(500).json({ mensaje: 'Error al obtener zona' }); }
};

exports.crear = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) return res.status(400).json({ mensaje: 'El nombre es requerido' });
        const id = await Zona.crear({ nombre, descripcion });
        res.status(201).json({ mensaje: 'Zona creada', id });
    } catch { res.status(500).json({ mensaje: 'Error al crear zona' }); }
};

exports.actualizar = async (req, res) => {
    try {
        await Zona.actualizar(req.params.id, req.body);
        res.json({ mensaje: 'Zona actualizada' });
    } catch { res.status(500).json({ mensaje: 'Error al actualizar zona' }); }
};

exports.eliminar = async (req, res) => {
    try {
        await Zona.eliminar(req.params.id);
        res.json({ mensaje: 'Zona desactivada' });
    } catch { res.status(500).json({ mensaje: 'Error al eliminar zona' }); }
};
