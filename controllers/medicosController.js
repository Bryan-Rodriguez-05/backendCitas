// controllers/medicosController.js
const { sql, poolPromise } = require('../config/dbConfig');
const medicosModel = require('../models/medicosModel');
// POST /api/medicos/registro   (solo ADMIN)
exports.createMedico = async (req, res) => {
  try {
    const {
      correo,
      contrasenia,      // contraseña en texto plano
      nombre,
      apellido,
      telefono,
      especialidad_id
    } = req.body;

    if (!correo || !contrasenia || !nombre || !apellido || !especialidad_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const pool = await poolPromise;

    // 1) Verificar que no exista un usuario con ese correo
    const existRes = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query(`SELECT id FROM usuarios WHERE correo = @correo`);
    if (existRes.recordset.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con este correo.' });
    }

    // 2) Insertar en tabla 'usuarios' (contrasenia_hash = contraseña en texto plano, rol = 'MEDICO')
    const insertUser = await pool.request()
      .input('correo', sql.VarChar, correo)
      .input('contrasenia_hash', sql.VarChar, contrasenia)
      .input('rol', sql.VarChar, 'MEDICO')
      .query(`
        INSERT INTO usuarios (correo, contrasenia_hash, rol)
        VALUES (@correo, @contrasenia_hash, @rol);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    const usuarioId = insertUser.recordset[0].id;

    // 3) Insertar perfil en tabla 'medicos'
    await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('telefono', sql.VarChar, telefono || null)
      .input('especialidad_id', sql.Int, especialidad_id)
      .query(`
        INSERT INTO medicos
          (usuario_id, nombre, apellido, telefono, especialidad_id)
        VALUES
          (@usuario_id, @nombre, @apellido, @telefono, @especialidad_id)
      `);

    return res.status(201).json({
      message: 'Médico creado exitosamente',
      usuario_id: usuarioId
    });
  } catch (err) {
    console.error('Error al registrar médico:', err);
    return res.status(500).json({ error: 'Hubo un error al registrar al médico' });
  }
};

// GET /api/medicos   (roles: PACIENTE, MEDICO, ADMIN)
exports.getMedicos = async (req, res, next) => {
  try {
    // Usa el método cacheado del modelo
    const medicos = await medicosModel.getMedicos();
    return res.json(medicos);
  } catch (err) {
    console.error('Error al obtener médicos:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener los médicos' });
  }
};

// GET /api/medicos/:id   (roles: MEDICO, ADMIN)
exports.getMedico = async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .query(`
        SELECT
          u.id               AS usuario_id,
          u.correo,
          m.nombre,
          m.apellido,
          m.telefono,
          m.especialidad_id,
          e.nombre           AS especialidad
        FROM usuarios u
        INNER JOIN medicos m ON u.id = m.usuario_id
        INNER JOIN especialidades e ON m.especialidad_id = e.id
        WHERE u.id = @usuario_id AND u.rol = 'MEDICO'
      `);
    const medico = result.recordset[0];
    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }
    return res.json(medico);
  } catch (err) {
    console.error('Error al obtener médico:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener el médico' });
  }
};

// PUT /api/medicos/:id   (solo ADMIN)
exports.updateMedico = async (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);
  const {
    correo,
    contrasenia,     // si viene, se actualiza en texto plano
    nombre,
    apellido,
    telefono,
    especialidad_id
  } = req.body;

  if (!nombre || !apellido || !especialidad_id) {
    return res.status(400).json({ error: 'Nombre, apellido y especialidad son obligatorios.' });
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

    // 3) Actualizar perfil en tabla 'medicos'
    await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('telefono', sql.VarChar, telefono || null)
      .input('especialidad_id', sql.Int, especialidad_id)
      .query(`
        UPDATE medicos
        SET
          nombre          = @nombre,
          apellido        = @apellido,
          telefono        = @telefono,
          especialidad_id = @especialidad_id
        WHERE usuario_id = @usuario_id
      `);

    return res.status(200).json({ message: 'Médico modificado exitosamente' });
  } catch (err) {
    console.error('Error al modificar médico:', err);
    return res.status(500).json({ error: 'Hubo un error al modificar al médico' });
  }
};

// DELETE /api/medicos/:id   (solo ADMIN)
exports.deleteMedico = async (req, res) => {
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
    return res.status(200).json({ message: 'Médico eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar médico:', err);
    return res.status(500).json({ error: 'Hubo un error al eliminar al médico' });
  }
};

// GET /api/medicos/:id/citas   (solo rol 'MEDICO')
exports.getCitasParaMedico = async (req, res) => {
  // El ID del médico se toma de req.user.id (firmado en el JWT)
  const medicoUsuarioId = req.user.id;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('medico_usuario_id', sql.Int, medicoUsuarioId)
      .query(`
        SELECT
          c.id,
          c.fecha_cita,
          c.motivo,
          c.tipo,
          p.nombre AS paciente_nombre,
          p.apellido AS paciente_apellido,
          e.nombre AS especialidad
        FROM citas c
        INNER JOIN pacientes p ON c.paciente_usuario_id = p.usuario_id
        INNER JOIN medicos m ON c.medico_usuario_id = m.usuario_id
        INNER JOIN especialidades e ON m.especialidad_id = e.id
        WHERE c.medico_usuario_id = @medico_usuario_id
        ORDER BY c.fecha_cita DESC
      `);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener citas del médico:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener las citas del médico' });
  }
};
