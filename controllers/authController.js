// controllers/authController.js
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/dbConfig');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { email, contrasenia } = req.body;
    if (!email || !contrasenia) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos.' });
    }

    // 1) Buscar en tabla 'usuarios' por correo
    const pool = await poolPromise;
    const result = await pool.request()
      .input('correo', sql.VarChar, email)
      .query(`
        SELECT id, correo, contrasenia_hash, rol
        FROM usuarios
        WHERE correo = @correo
      `);

    const usuario = result.recordset[0];
    if (!usuario) {
      // No existe ese correo
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas.' });
    }

    // 2) Comparar la contraseña en texto plano 
    // Ahora contrasenia_hash en la base es la contraseña sin encriptar
    
    const match = await bcrypt.compare(contrasenia, usuario.contrasenia_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas.' });
    }

    // 3) Firmar el JWT con payload { id, rol, correo }
    const payload = {
      id: usuario.id,
      rol: usuario.rol,
      correo: usuario.correo
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    // 4) Construir objeto 'profile' con datos básicos según rol
    let profile = { id: usuario.id, correo: usuario.correo, rol: usuario.rol };

    if (usuario.rol === 'PACIENTE') {
      const perfilRes = await pool.request()
        .input('usuario_id', sql.Int, usuario.id)
        .query(`
          SELECT nombre, apellido
          FROM pacientes
          WHERE usuario_id = @usuario_id
        `);
      if (perfilRes.recordset.length > 0) {
        profile.nombre = perfilRes.recordset[0].nombre;
        profile.apellido = perfilRes.recordset[0].apellido;
      }
    } else if (usuario.rol === 'MEDICO') {
      const perfilRes = await pool.request()
        .input('usuario_id', sql.Int, usuario.id)
        .query(`
          SELECT nombre, apellido, especialidad_id
          FROM medicos
          WHERE usuario_id = @usuario_id
        `);
      if (perfilRes.recordset.length > 0) {
        profile.nombre = perfilRes.recordset[0].nombre;
        profile.apellido = perfilRes.recordset[0].apellido;
        profile.especialidad_id = perfilRes.recordset[0].especialidad_id;
      }
    } else if (usuario.rol === 'ADMIN') {
      const perfilRes = await pool.request()
        .input('usuario_id', sql.Int, usuario.id)
        .query(`
          SELECT nombre, apellido
          FROM administradores
          WHERE usuario_id = @usuario_id
        `);
      if (perfilRes.recordset.length > 0) {
        profile.nombre = perfilRes.recordset[0].nombre;
        profile.apellido = perfilRes.recordset[0].apellido;
      }
    }

    return res.json({ success: true, token, profile });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ success: false, error: 'Error interno en el servidor.' });
  }
};
