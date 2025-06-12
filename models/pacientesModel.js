// models/pacientesModel.js
const { sql, poolPromise } = require('../config/dbConfig');
const usuariosModel = require('./usuariosModel');
const redisClient = require('../config/redisClient');
module.exports = {
  /**
   * Crea un paciente completo:
   *   1) Inserta en 'usuarios' con rol = 'PACIENTE'
   *   2) Inserta en 'pacientes' (perfil)
   * Recibe un objeto:
   *   { correo, contrasenia, nombre, apellido, fecha_nacimiento, direccion, telefono, dni }
   * Devuelve usuario_id (entero).
   */
  createPacienteCompleto: async (datos) => {
    const {
      correo,
      contrasenia,
      nombre,
      apellido,
      fecha_nacimiento,
      direccion,
      telefono,
      dni
    } = datos;

    // 1) Verificar duplicidad de correo
    const usuarioExistente = await usuariosModel.getUsuarioPorCorreo(correo);
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con este correo.');
    }

    // 2) Hashear contraseña
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasenia, salt);

    // 3) Insertar en 'usuarios'
    const usuarioId = await usuariosModel.createUsuario(correo, hash, 'PACIENTE');

    // 4) Insertar perfil en 'pacientes'
    const pool = await poolPromise;
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
    // Invalidate cache
    await redisClient.del('pacientes:all');

    return usuarioId;
  },

  /**
   * Devuelve un arreglo con todos los pacientes (sólo ADMIN lo invoca).
   * Cada fila incluye usuario_id, correo, nombre, apellido, ...
   */
  getPacientes: async () => {
     const cacheKey = 'pacientes:all';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

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
    const pacientes = result.recordset;

    await redisClient.setEx(cacheKey, 300, JSON.stringify(pacientes));
    return pacientes;
  },

  /**
   * Devuelve objeto paciente por usuario_id, o undefined si no existe.
   */
  getPacientePorUsuarioId: async (usuario_id) => {
    const cacheKey = `paciente:${usuario_id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
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
    const paciente = result.recordset[0] || null;

    if (paciente) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(paciente));
    }
    return paciente;
  },

  /**
   * Actualiza los datos de perfil de un paciente (no correo ni contraseña).
   * datos = { nombre, apellido, fecha_nacimiento, direccion, telefono, dni }
   */
  updatePacientePerfil: async (usuario_id, datos) => {
    const {
      nombre,
      apellido,
      fecha_nacimiento,
      direccion,
      telefono,
      dni
    } = datos;
    const pool = await poolPromise;
    await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
      .input('direccion', sql.VarChar, direccion || null)
      .input('telefono', sql.VarChar, telefono || null)
      .input('dni', sql.VarChar, dni || null)
      .query(`
        UPDATE pacientes
        SET
          nombre          = @nombre,
          apellido        = @apellido,
          fecha_nacimiento = @fecha_nacimiento,
          direccion       = @direccion,
          telefono        = @telefono,
          dni             = @dni
        WHERE usuario_id = @usuario_id
      `);
      // Invalidate cache
    await redisClient.del('pacientes:all');
    await redisClient.del(`paciente:${usuario_id}`);
  },

  /**
   * Elimina un paciente por usuario_id.
   * Como la FK de pacientes → usuarios es ON DELETE CASCADE,
   * al borrar de 'usuarios' se borrará paciente y sus citas.
   */
  deletePaciente: async (usuario_id) => {
    const pool = await poolPromise;
    await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .query(`
        DELETE FROM usuarios
        WHERE id = @usuario_id
      `);
      // Invalidate cache
    await redisClient.del('pacientes:all');
    await redisClient.del(`paciente:${usuario_id}`);
  }
};
