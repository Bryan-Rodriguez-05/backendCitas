const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('./config/dbConfig');

async function actualizarContraseñas() {
  try {
    const pool = await poolPromise;
    const usuarios = await pool.request().query('SELECT id, contrasenia_hash FROM usuarios');
    
    for (const usuario of usuarios.recordset) {
      const hashedPassword = await bcrypt.hash(usuario.contrasenia_hash, 10);
      
      // Actualiza la contraseña hasheada en la base de datos
      await pool.request()
        .input('id', sql.Int, usuario.id)
        .input('contrasenia_hash', sql.VarChar, hashedPassword)
        .query(`
          UPDATE usuarios
          SET contrasenia_hash = @contrasenia_hash
          WHERE id = @id
        `);
      
      console.log(`Contraseña para usuario ${usuario.id} actualizada.`);
    }

    console.log('Actualización de contraseñas completada.');
  } catch (err) {
    console.error('Error actualizando contraseñas:', err);
  }
}

// Ejecuta el script
actualizarContraseñas();
