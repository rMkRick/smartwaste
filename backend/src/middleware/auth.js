const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: 'Token requerido' });
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }
};

const soloRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({ mensaje: 'No tienes permiso para esta acción' });
    }
    next();
};

module.exports = { verificarToken, soloRoles };
