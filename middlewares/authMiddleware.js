const jwt = require('jsonwebtoken');

// Middleware para verificar si el usuario está autenticado
const authMiddleware = (req, res, next) => {
  // Obtén el token de los encabezados de la solicitud
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' }); // Si no hay token, no está autenticado
  }

  try {
    // Verificamos si el token es válido
    const decoded = jwt.verify(token, 'secreto'); // 'secreto' debe ser la misma clave usada para firmar el JWT
    req.user = decoded; // Agregamos los datos del usuario decodificados a la solicitud
    next(); // Llamamos al siguiente middleware o controlador
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token no válido o expirado' });
  }
};

module.exports = authMiddleware;
