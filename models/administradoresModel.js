// models/administradoresModel.js
const { sql, poolPromise } = require('../config/dbConfig');
const usuariosModel = require('./usuariosModel');
// const redisClient = require('../config/redisClient');  // Comentar esta línea para desactivar Redis
const bcrypt = require('bcrypt');

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

    // 2) Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasenia, salt);

    // 3) Obtener conexión y crear transacción
    const pool = await poolPromise;
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // 3.1) Crear usuario en 'usuarios'
      const usuarioId = await usuariosModel.createUsuario(correo, hash, 'ADMIN');

      // 3.2) Insertar perfil en 'administradores'
      await transaction.request()
        .input('usuario_id', sql.Int, usuarioId)
        .input('nombre', sql.VarChar, nombre)
        .input('apellido', sql.VarChar, apellido)
        .query(`
          INSERT INTO administradores (usuario_id, nombre, apellido)
          VALUES (@usuario_id, @nombre, @apellido)
        `);

      await transaction.commit();

      // Si no usas Redis, no es necesario invalidar el caché.
      // await redisClient.del('administradores:all');

      return usuarioId;
    } catch (err) {
      await transaction.rollback();
      throw new Error('Error al crear el administrador: ' + err.message);
    }
  },

  /**
   * Devuelve todos los administradores (sólo ADMIN puede invocar).
   */
  getAdministradores: async () => {
    // Eliminar todo el código relacionado con Redis para evitar el uso de caché.
    // const cacheKey = 'administradores:all';
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

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
    const administradores = result.recordset;

    // Si no usas Redis, no es necesario guardarlo en caché.
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(administradores));

    return administradores;
  }
};
