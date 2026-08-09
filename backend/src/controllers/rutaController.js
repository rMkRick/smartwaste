const Ruta = require('../models/Ruta');

// Franjas horarias válidas para asignar una ruta (3 horas de turno). El Centro
// Histórico solo recoge de noche (para no afectar el turismo); el resto es diurno.
const SLOTS_NORMALES = [
    ['09:00', '12:00'],
    ['10:00', '13:00'],
    ['14:00', '17:00'],
    ['15:00', '18:00'],
];
const SLOT_CENTRO_HISTORICO = ['20:00', '23:00'];

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

// Actualizar waypoints de una ruta (supervisor o admin)
exports.actualizarWaypoints = async (req, res) => {
    try {
        const { waypoints } = req.body;
        if (!Array.isArray(waypoints))
            return res.status(400).json({ mensaje: 'waypoints debe ser un arreglo' });
        await Ruta.actualizarWaypoints(req.params.id, waypoints);
        res.json({ mensaje: 'Waypoints actualizados' });
    } catch { res.status(500).json({ mensaje: 'Error al actualizar waypoints' }); }
};

// CU12: asignar ruta a camión (admin o supervisor); operador_id es opcional
exports.asignar = async (req, res) => {
    try {
        const { camion_id, ruta_id, operador_id, fecha_asignacion, hora_inicio, hora_fin } = req.body;
        if (!camion_id || !ruta_id || !fecha_asignacion)
            return res.status(400).json({ mensaje: 'Camión, ruta y fecha son requeridos' });

        if (hora_inicio || hora_fin) {
            const zonaNombre = await Ruta.obtenerZonaNombre(ruta_id);
            const slotsValidos = zonaNombre === 'Centro Histórico' ? [SLOT_CENTRO_HISTORICO] : SLOTS_NORMALES;
            const esValido = slotsValidos.some(([ini, fin]) => ini === hora_inicio && fin === hora_fin);
            if (!esValido) return res.status(400).json({ mensaje: 'El horario seleccionado no es válido para esta ruta' });
        }

        const id = await Ruta.crearAsignacion({
            camion_id, ruta_id, operador_id: operador_id || null, fecha_asignacion,
            hora_inicio: hora_inicio || null, hora_fin: hora_fin || null,
        });
        res.status(201).json({ mensaje: 'Ruta asignada exitosamente', id });
    } catch { res.status(500).json({ mensaje: 'Error al asignar ruta' }); }
};
