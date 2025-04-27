// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];            // "Bearer TOKEN"
  const token      = authHeader && authHeader.split(' ')[1]; // extrae el TOKEN
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = payload;    // aquí tendremos { id, correo, iat, exp }
    next();
  });
};
