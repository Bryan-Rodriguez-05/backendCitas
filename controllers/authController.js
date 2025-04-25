const jwt = require('jsonwebtoken');
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

    // Verificamos si el paciente existe
    if (result.recordset.length > 0) {
      const patient = result.recordset[0];

      // Aquí generamos el JWT con la información del paciente (puedes incluir más datos si lo deseas)
      const token = jwt.sign(
        { id: patient.id, nombre: patient.nombre, apellido: patient.apellido, correo: patient.correo },
        'secreto', // Cambia 'secreto' por una clave secreta más segura
        { expiresIn: '1h' } // El token expirará en 1 hora
      );

      // Devolvemos el token al cliente
      res.json({ success: true, token: token, patient: patient });
    } else {
      res.status(400).json({ error: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error al iniciar sesión:', err.stack);
    res.status(500).json({ error: 'Hubo un error en el servidor' });
  }
};
