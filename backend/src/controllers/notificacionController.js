const Notificacion = require('../models/Notificacion');

// CU8: gestionarNotificaciones - lista todas las del usuario
exports.listar = async (req, res) => {
    try { res.json(await Notificacion.buscarPorUsuario(req.usuario.id)); }
    catch { res.status(500).json({ mensaje: 'Error al obtener notificaciones' }); }
};

// CU9: recibirNotificaciones - solo las no leídas
exports.noLeidas = async (req, res) => {
    try { res.json(await Notificacion.noLeidas(req.usuario.id)); }
    catch { res.status(500).json({ mensaje: 'Error al obtener notificaciones' }); }
};

// CU8: marcar una como leída
exports.marcarLeida = async (req, res) => {
    try {
        await Notificacion.marcarLeida(req.params.id, req.usuario.id);
        res.json({ mensaje: 'Notificación marcada como leída' });
    } catch { res.status(500).json({ mensaje: 'Error al actualizar notificación' }); }
};

// CU8: marcar todas como leídas
exports.marcarTodasLeidas = async (req, res) => {
    try {
        await Notificacion.marcarTodasLeidas(req.usuario.id);
        res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch { res.status(500).json({ mensaje: 'Error al actualizar notificaciones' }); }
};
