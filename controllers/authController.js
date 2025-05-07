// controllers/authController.js
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/dbConfig');

exports.login = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { email, contrasenia } = req.body;

    const query = 'SELECT * FROM pacientes WHERE correo = @correo AND contrasenia = @contrasenia';
    const result = await pool.request()
      .input('correo', sql.VarChar, email)
      .input('contrasenia',   sql.VarChar, contrasenia)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(400).json({ success: false, error: 'Credenciales incorrectas' });
    }

    const patient = result.recordset[0];

    // Genera el token (usa una clave secreta _muy_ fuerte y no la expongas en el código)
    const token = jwt.sign(
      { id: patient.id, correo: patient.correo },
      process.env.JWT_SECRET,      // ahora viene de .env
      { expiresIn: '2h' }
    );

    // Devuelve paciente y token
    res.json({ success: true, patient, token });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ success: false, error: 'Hubo un error en el servidor' });
  }
  
};
