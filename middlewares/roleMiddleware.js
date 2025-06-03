// middlewares/roleMiddleware.js
module.exports = function roleMiddleware(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (typeof rolesPermitidos === 'string') {
      rolesPermitidos = [rolesPermitidos];
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente.' });
    }

    next();
  };
};

