const Horario = require('../models/Horario');

// CU6: consultarHorarioRecoleccion
exports.porZona = async (req, res) => {
    try {
        const horarios = await Horario.buscarPorZona(req.params.zona_id);
        res.json(horarios);
    } catch { res.status(500).json({ mensaje: 'Error al obtener horarios' }); }
};

exports.todos = async (req, res) => {
    try { res.json(await Horario.buscarTodos()); }
    catch { res.status(500).json({ mensaje: 'Error al obtener horarios' }); }
};
