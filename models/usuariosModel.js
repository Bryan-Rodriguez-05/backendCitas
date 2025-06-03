// models/usuariosModel.js
const { sql, poolPromise } = require('../config/dbConfig');

module.exports = {
  /**
   * Inserta un nuevo usuario en la tabla 'usuarios' con correo, hash de contraseña y rol.
   * Devuelve el nuevo usuario_id.
   */
  createUsuario: async (correo, contrasenia_hash, rol) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('correo', sql.VarChar, correo)
      .input('contrasenia_hash', sql.VarChar, contrasenia_hash)
      .input('rol', sql.VarChar, rol)
      .query(`
        INSERT INTO usuarios (correo, contrasenia_hash, rol)s
        VALUES (@correo, @contrasenia_hash, @rol);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    return result.recordset[0].id;
  },

  /**
   * Devuelve { id, correo, contrasenia_hash, rol } si existe el correo; sino undefined.
   */
  getUsuarioPorCorreo: async (correo) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query(`
        SELECT id, correo, contrasenia_hash, rol
        FROM usuarios
        WHERE correo = @correo
      `);
    return result.recordset[0];
  },

  /**
   * Actualiza el hash de la contraseña (contrasenia_hash) de un usuario.
   */
  updateContrasenia: async (usuario_id, nuevoHash) => {
    const pool = await poolPromise;
    await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .input('contrasenia_hash', sql.VarChar, nuevoHash)
      .query(`
        UPDATE usuarios
        SET contrasenia_hash = @contrasenia_hash,
            fecha_actualizado = GETDATE()
        WHERE id = @usuario_id
      `);
  },

  /**
   * Actualiza el correo de un usuario. (Verificar duplicidad antes en el controlador).
   */
  updateCorreo: async (usuario_id, nuevoCorreo) => {
    const pool = await poolPromise;
    await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .input('correo', sql.VarChar, nuevoCorreo)
      .query(`
        UPDATE usuarios
        SET correo = @correo,
            fecha_actualizado = GETDATE()
        WHERE id = @usuario_id
      `);
  }
};
