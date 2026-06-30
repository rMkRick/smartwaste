const Ruta = require('../models/Ruta');

// CU12: gestionarRutas
exports.listar = async (req, res) => {
    try { res.json(await Ruta.buscarTodas()); }
    catch { res.status(500).json({ mensaje: 'Error al obtener rutas' }); }
};

exports.crear = async (req, res) => {
    try {
        const { nombre, zona_id, descripcion } = req.body;
        if (!nombre || !zona_id) return res.status(400).json({ mensaje: 'Nombre y zona son requeridos' });
        const id = await Ruta.crear({ nombre, zona_id, descripcion });
        res.status(201).json({ mensaje: 'Ruta creada', id });
    } catch { res.status(500).json({ mensaje: 'Error al crear ruta' }); }
};

exports.actualizar = async (req, res) => {
    try {
        await Ruta.actualizar(req.params.id, req.body);
        res.json({ mensaje: 'Ruta actualizada' });
    } catch { res.status(500).json({ mensaje: 'Error al actualizar ruta' }); }
};

exports.eliminar = async (req, res) => {
    try {
        await Ruta.eliminar(req.params.id);
        res.json({ mensaje: 'Ruta desactivada' });
    } catch { res.status(500).json({ mensaje: 'Error al eliminar ruta' }); }
};

// CU13: visualizarRutaAsignada
exports.miRuta = async (req, res) => {
    try {
        const asignaciones = await Ruta.buscarAsignacionPorOperador(req.usuario.id);
        res.json(asignaciones);
    } catch { res.status(500).json({ mensaje: 'Error al obtener ruta asignada' }); }
};

// CU12: asignar ruta a operador (administrador)
exports.asignar = async (req, res) => {
    try {
        const { camion_id, ruta_id, operador_id, fecha_asignacion } = req.body;
        if (!camion_id || !ruta_id || !operador_id || !fecha_asignacion)
            return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
        const id = await Ruta.crearAsignacion({ camion_id, ruta_id, operador_id, fecha_asignacion });
        res.status(201).json({ mensaje: 'Ruta asignada exitosamente', id });
    } catch { res.status(500).json({ mensaje: 'Error al asignar ruta' }); }
};
