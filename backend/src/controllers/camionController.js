const Camion = require('../models/Camion');

// CU11: gestionarCamiones
exports.listar = async (req, res) => {
    try { res.json(await Camion.buscarTodos()); }
    catch { res.status(500).json({ mensaje: 'Error al obtener camiones' }); }
};

exports.obtener = async (req, res) => {
    try {
        const camion = await Camion.buscarPorId(req.params.id);
        if (!camion) return res.status(404).json({ mensaje: 'Camión no encontrado' });
        res.json(camion);
    } catch { res.status(500).json({ mensaje: 'Error al obtener camión' }); }
};

exports.crear = async (req, res) => {
    try {
        const { placa, modelo, capacidad_kg } = req.body;
        if (!placa) return res.status(400).json({ mensaje: 'La placa es requerida' });
        const id = await Camion.crear({ placa, modelo, capacidad_kg });
        res.status(201).json({ mensaje: 'Camión registrado', id });
    } catch { res.status(500).json({ mensaje: 'Error al crear camión' }); }
};

exports.actualizar = async (req, res) => {
    try {
        await Camion.actualizar(req.params.id, req.body);
        res.json({ mensaje: 'Camión actualizado' });
    } catch { res.status(500).json({ mensaje: 'Error al actualizar camión' }); }
};

exports.eliminar = async (req, res) => {
    try {
        await Camion.eliminar(req.params.id);
        res.json({ mensaje: 'Camión puesto en mantenimiento' });
    } catch { res.status(500).json({ mensaje: 'Error al eliminar camión' }); }
};

// CU7: consultarUbicacionCamion
exports.ubicacion = async (req, res) => {
    try {
        const camion = await Camion.buscarPorId(req.params.id);
        if (!camion) return res.status(404).json({ mensaje: 'Camión no encontrado' });
        res.json({
            id: camion.id,
            placa: camion.placa,
            latitud: camion.latitud_actual,
            longitud: camion.longitud_actual,
            gps_activo: camion.gps_activo,
            estado: camion.estado,
            ultima_actualizacion: camion.ultima_actualizacion
        });
    } catch { res.status(500).json({ mensaje: 'Error al obtener ubicación' }); }
};

// CU16: activarGPS
exports.activarGPS = async (req, res) => {
    try {
        const { latitud, longitud, gps_activo } = req.body;
        await Camion.actualizarGPS(req.params.id, { latitud, longitud, gps_activo });
        res.json({ mensaje: gps_activo ? 'GPS activado' : 'GPS desactivado' });
    } catch { res.status(500).json({ mensaje: 'Error al actualizar GPS' }); }
};
