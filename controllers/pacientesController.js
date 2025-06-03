// controllers/pacientesController.js
const { sql, poolPromise } = require('../config/dbConfig');

// POST /api/pacientes/registro
exports.createPaciente = async (req, res) => {
  try {
    const {
      correo,
      contrasenia,       // contraseña en texto plano
      nombre,
      apellido,
      fecha_nacimiento,
      direccion,
      telefono,
      dni
    } = req.body;

    if (!correo || !contrasenia || !nombre || !apellido) {
      return res.status(400).json({ error: 'Correo, contraseña, nombre y apellido son obligatorios.' });
    }

    const pool = await poolPromise;

    // 1) Verificar que no exista un usuario con ese correo
    const existRes = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query(`SELECT id FROM usuarios WHERE correo = @correo`);
    if (existRes.recordset.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con este correo.' });
    }

    // 2) Insertar en tabla 'usuarios' (contrasenia_hash = contraseña en texto plano, rol = 'PACIENTE')
    const insertUser = await pool.request()
      .input('correo', sql.VarChar, correo)
      .input('contrasenia_hash', sql.VarChar, contrasenia)
      .input('rol', sql.VarChar, 'PACIENTE')
      .query(`
        INSERT INTO usuarios (correo, contrasenia_hash, rol)
        VALUES (@correo, @contrasenia_hash, @rol);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    const usuarioId = insertUser.recordset[0].id;

    // 3) Insertar perfil en tabla 'pacientes'
    await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
      .input('direccion', sql.VarChar, direccion || null)
      .input('telefono', sql.VarChar, telefono || null)
      .input('dni', sql.VarChar, dni || null)
      .query(`
        INSERT INTO pacientes
          (usuario_id, nombre, apellido, fecha_nacimiento, direccion, telefono, dni)
        VALUES
          (@usuario_id, @nombre, @apellido, @fecha_nacimiento, @direccion, @telefono, @dni)
      `);

    return res.status(201).json({
      message: 'Paciente registrado exitosamente',
      usuario_id: usuarioId
    });
  } catch (err) {
    console.error('Error al registrar paciente:', err);
    return res.status(500).json({ error: 'Hubo un error al registrar al paciente' });
  }
};

// GET /api/pacientes      (solo ADMIN)
exports.getPacientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT
          u.id          AS usuario_id,
          u.correo,
          p.nombre,
          p.apellido,
          p.fecha_nacimiento,
          p.direccion,
          p.telefono,
          p.dni
        FROM usuarios u
        INNER JOIN pacientes p ON u.id = p.usuario_id
        WHERE u.rol = 'PACIENTE'
        ORDER BY p.apellido, p.nombre
      `);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener pacientes:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener los pacientes' });
  }
};

// GET /api/pacientes/:id   (solo ADMIN)
exports.getPaciente = async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .query(`
        SELECT
          u.id          AS usuario_id,
          u.correo,
          p.nombre,
          p.apellido,
          p.fecha_nacimiento,
          p.direccion,
          p.telefono,
          p.dni
        FROM usuarios u
        INNER JOIN pacientes p ON u.id = p.usuario_id
        WHERE u.id = @usuario_id AND u.rol = 'PACIENTE'
      `);
    const paciente = result.recordset[0];
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    return res.json(paciente);
  } catch (err) {
    console.error('Error al obtener paciente:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener el paciente' });
  }
};

// PUT /api/pacientes/:id   (solo ADMIN)
exports.updatePaciente = async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);
  const {
    correo,
    contrasenia,    // si viene, se actualiza en texto plano
    nombre,
    apellido,
    fecha_nacimiento,
    direccion,
    telefono,
    dni
  } = req.body;

  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son obligatorios.' });
  }

  try {
    const pool = await poolPromise;

    // 1) Si envían nuevo correo, verificar duplicidad y actualizar en 'usuarios'
    if (correo) {
      const existCorreo = await pool.request()
        .input('correo', sql.VarChar, correo)
        .query(`SELECT id FROM usuarios WHERE correo = @correo`);
      const yaExiste = existCorreo.recordset[0];
      if (yaExiste && yaExiste.id !== usuarioId) {
        return res.status(400).json({ error: 'Ese correo ya está en uso.' });
      }
      await pool.request()
        .input('usuario_id', sql.Int, usuarioId)
        .input('correo', sql.VarChar, correo)
        .query(`
          UPDATE usuarios
          SET correo = @correo
          WHERE id = @usuario_id
        `);
    }

    // 2) Si envían nueva contraseña, actualizar contrasenia_hash (en texto plano)
    if (contrasenia) {
      await pool.request()
        .input('usuario_id', sql.Int, usuarioId)
        .input('contrasenia_hash', sql.VarChar, contrasenia)
        .query(`
          UPDATE usuarios
          SET contrasenia_hash = @contrasenia_hash
          WHERE id = @usuario_id
        `);
    }

    // 3) Actualizar datos de perfil en tabla 'pacientes'
    await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
      .input('direccion', sql.VarChar, direccion || null)
      .input('telefono', sql.VarChar, telefono || null)
      .input('dni', sql.VarChar, dni || null)
      .query(`
        UPDATE pacientes
        SET
          nombre           = @nombre,
          apellido         = @apellido,
          fecha_nacimiento = @fecha_nacimiento,
          direccion        = @direccion,
          telefono         = @telefono,
          dni              = @dni
        WHERE usuario_id = @usuario_id
      `);

    return res.status(200).json({ message: 'Paciente modificado exitosamente' });
  } catch (err) {
    console.error('Error al modificar paciente:', err);
    return res.status(500).json({ error: 'Hubo un error al modificar al paciente' });
  }
};

// DELETE /api/pacientes/:id   (solo ADMIN)
exports.deletePaciente = async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);
  try {
    const pool = await poolPromise;
    // Al borrar de 'usuarios' con ON DELETE CASCADE, se eliminará perfil y citas automáticamente
    await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .query(`
        DELETE FROM usuarios
        WHERE id = @usuario_id
      `);
    return res.status(200).json({ message: 'Paciente eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar paciente:', err);
    return res.status(500).json({ error: 'Hubo un error al eliminar al paciente' });
  }
};
