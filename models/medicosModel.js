// models/medicosModel.js
const { sql, poolPromise } = require('../config/dbConfig');
const usuariosModel = require('./usuariosModel');
const redisClient = require('../config/redisClient');
module.exports = {
  /**
   * Crea un médico completo (sólo ADMIN puede invocar).
   * Recibe { correo, contrasenia, nombre, apellido, telefono, especialidad_id }.
   * Devuelve usuario_id.
   */
  createMedicoCompleto: async (datos) => {
    const {
      correo,
      contrasenia,
      nombre,
      apellido,
      telefono,
      especialidad_id
    } = datos;

    // 1) Verificar duplicidad de correo
    const existe = await usuariosModel.getUsuarioPorCorreo(correo);
    if (existe) {
      throw new Error('Ya existe un usuario con este correo.');
    }

    // 2) Hashear contraseña y crear en 'usuarios' con rol 'MEDICO'
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasenia, salt);
    const usuarioId = await usuariosModel.createUsuario(correo, hash, 'MEDICO');

    // 3) Insertar perfil en 'medicos'
    const pool = await poolPromise;
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

    // Invalidate cache
    await redisClient.del('medicos:all');

    return usuarioId;
  },

  /**
   * Devuelve un arreglo con todos los médicos (para ADMIN),
   * incluyendo su correo y el nombre de la especialidad.
   */
  getMedicos: async () => {
    const cacheKey = 'medicos:all';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const pool = await poolPromise;
    const result = await pool.request()
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
        WHERE u.rol = 'MEDICO'
        ORDER BY m.apellido, m.nombre
      `);
    const medicos = result.recordset;
        
    await redisClient.setEx(cacheKey, 300, JSON.stringify(medicos));
    console.log('Guardando en cache:', cacheKey, '- cantidad:', medicos.length);

    return medicos;
  },

  /**
   * Devuelve un objeto médico por usuario_id (o undefined si no existe).
   */
  getMedicoPorUsuarioId: async (usuario_id) => {
    const cacheKey = `medico:${usuario_id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
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
    const medico = result.recordset[0] || null;

    if (medico) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(medico));
    }
    return medico;
  },

  /**
   * Actualiza perfil de un médico (nombre, apellido, teléfono, especialidad).
   * Para cambiar correo/contraseña, usar usuariosModel.
   */
  updateMedicoPerfil: async (usuario_id, datos) => {
    const { nombre, apellido, telefono, especialidad_id } = datos;
    const pool = await poolPromise;
    await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('telefono', sql.VarChar, telefono || null)
      .input('especialidad_id', sql.Int, especialidad_id)
      .query(`
        UPDATE medicos
        SET
          nombre         = @nombre,
          apellido       = @apellido,
          telefono       = @telefono,
          especialidad_id = @especialidad_id
        WHERE usuario_id = @usuario_id
      `);
      // Invalidate cache
    await redisClient.del('medicos:all');
    await redisClient.del(`medico:${usuario_id}`);
  },

  /**
   * Elimina un médico por usuario_id.
   * Al borrar de 'usuarios' (cascade), se borra perfil y citas asociadas.
   */
  deleteMedico: async (usuario_id) => {
    const pool = await poolPromise;
    await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .query(`
        DELETE FROM usuarios
        WHERE id = @usuario_id
      `);
      // Invalidate cache
    await redisClient.del('medicos:all');
    await redisClient.del(`medico:${usuario_id}`);
  },

  /**
   * Devuelve todas las citas para un médico dado (rol 'MEDICO').
   */
  getCitasPorMedico: async (medico_usuario_id) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('medico_usuario_id', sql.Int, medico_usuario_id)
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
    return result.recordset;
  }
};
