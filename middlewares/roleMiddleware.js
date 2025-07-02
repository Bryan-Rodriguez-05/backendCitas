// middlewares/roleMiddleware.js
const jwt = require('jsonwebtoken');
const { secret } = require('../config/dbConfig');  // Asegúrate de tener el secret correctamente configurado

module.exports = function roleMiddleware(rolesPermitidos = []) {
  return (req, res, next) => {
    // 1. Obtener el token del encabezado 'Authorization'
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener token del header

    // 2. Verificar si el token está presente
    if (!token) {
      return res.status(403).json({ error: 'Token no proporcionado' });
    }

    // 3. Verificar la validez del token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }

      // 4. Asegurarse de que el rol del usuario esté presente en el token
      if (!decoded.rol) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      // 5. Validar si el rol del usuario está permitido
      if (typeof rolesPermitidos === 'string') {
        rolesPermitidos = [rolesPermitidos];
      }

      if (!rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).json({ error: 'Acceso denegado: rol insuficiente.' });
      }

      // 6. Guardar la información del usuario en la solicitud (req.user)
      req.user = decoded;

      // 7. Continuar con la siguiente función en la cadena
      next();
    });
  };
};
