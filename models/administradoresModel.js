// models/administradoresModel.js
const { sql, poolPromise } = require('../config/dbConfig');
const usuariosModel = require('./usuariosModel');

module.exports = {
  /**
   * Crea un administrador completo (sólo ADMIN invoca):
   *   1) Inserta en 'usuarios' con rol='ADMIN'
   *   2) Inserta en 'administradores' con { usuario_id, nombre, apellido }
   * Devuelve usuario_id.
   */
  createAdminCompleto: async (datos) => {
    const { correo, contrasenia, nombre, apellido } = datos;

    // 1) Verificar duplicidad de correo
    const existe = await usuariosModel.getUsuarioPorCorreo(correo);
    if (existe) {
      throw new Error('Ya existe un usuario con este correo.');
    }

    // 2) Hashear contraseña y crear usuario en 'usuarios' con rol = 'ADMIN'
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasenia, salt);
    const usuarioId = await usuariosModel.createUsuario(correo, hash, 'ADMIN');

    // 3) Insertar perfil en 'administradores'
    const pool = await poolPromise;
    await pool.request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .query(`
        INSERT INTO administradores (usuario_id, nombre, apellido)
        VALUES (@usuario_id, @nombre, @apellido)
      `);

    return usuarioId;
  },

  /**
   * (Opcional) Devuelve todos los administradores (sólo ADMIN puede invocar).
   */
  getAdministradores: async () => {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT
          u.id          AS usuario_id,
          u.correo,
          a.nombre,
          a.apellido
        FROM usuarios u
        INNER JOIN administradores a ON u.id = a.usuario_id
        WHERE u.rol = 'ADMIN'
        ORDER BY a.apellido, a.nombre
      `);
    return result.recordset;
  }
};
