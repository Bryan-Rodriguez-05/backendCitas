// controllers/authController.js
const { sql, poolPromise } = require('../config/dbConfig');

exports.login = async (req, res) => {
  try {
    // Esperamos a que el pool esté listo
    const pool = await poolPromise;

    const { email, dni } = req.body;
    console.log('→ Login recibido:', req.body);

    const query = 'SELECT * FROM pacientes WHERE correo = @correo AND dni = @dni';
    const result = await pool.request()
      .input('correo', sql.VarChar, email)
      .input('dni', sql.VarChar, dni)
      .query(query);

    console.log('→ Resultado consulta login:', result.recordset);

    if (result.recordset.length > 0) {
      res.json({ success: true, patient: result.recordset[0] });
    } else {
      res.status(400).json({ error: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error al iniciar sesión:', err.stack);
    res.status(500).json({ error: 'Hubo un error en el servidor' });
  }
};
