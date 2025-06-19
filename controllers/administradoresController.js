// controllers/administradoresController.js
const administradoresModel = require('../models/administradoresModel');
const { sql,poolPromise } = require('../config/dbConfig'); // Asegúrate de que esta línea esté presente

exports.createAdmin = async (req, res) => {
  const { correo, contrasenia, nombre, apellido } = req.body;

  // Verificar que todos los campos estén presentes
  if (!correo || !contrasenia || !nombre || !apellido) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Llamar al modelo para crear el administrador
    const usuarioId = await administradoresModel.createAdminCompleto({
      correo,
      contrasenia,
      nombre,
      apellido
    });

    return res.status(201).json({ message: 'Administrador creado con éxito', usuario_id: usuarioId });
  } catch (err) {
    console.error('Error al crear administrador:', err.message);

    // Manejo de errores por duplicado de correo
    if (err.message.includes('Ya existe un usuario con este correo')) {
      return res.status(400).json({ error: err.message });
    }

    // Error genérico
    return res.status(500).json({ error: 'Error interno al crear el administrador' });
  }
};

exports.getAdministradores = async (req, res) => {
  try {
    // Llamar al modelo para obtener administradores
    const lista = await administradoresModel.getAdministradores();
    return res.json(lista);
  } catch (err) {
    console.error('Error al obtener administradores:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener administradores' });
  }
};

// Funciones para gestionar usuarios (pacientes y médicos)
exports.getUsuarios = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, correo, rol FROM usuarios');
    res.json(result.recordset); // Devuelve la lista de usuarios
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.createUsuario = async (req, res) => {
  const { correo, contrasenia, rol } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('correo', sql.VarChar, correo)
      .input('contrasenia', sql.VarChar, contrasenia)
      .input('rol', sql.VarChar, rol)
      .query('INSERT INTO usuarios (correo, contrasenia_hash, rol) VALUES (@correo, @contrasenia, @rol)');
    res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { correo, contrasenia, rol } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('correo', sql.VarChar, correo)
      .input('contrasenia', sql.VarChar, contrasenia)
      .input('rol', sql.VarChar, rol)
      .query('UPDATE usuarios SET correo = @correo, contrasenia_hash = @contrasenia, rol = @rol WHERE id = @id');
    res.status(200).json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

exports.deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM usuarios WHERE id = @id');
    res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

// Rutas para gestionar citas
exports.getCitas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT c.id, c.fecha_cita, c.motivo, c.tipo, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido, 
            m.nombre AS medico_nombre, m.apellido AS medico_apellido
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_usuario_id = p.usuario_id
      INNER JOIN medicos m ON c.medico_usuario_id = m.usuario_id
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
};

exports.deleteCita = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM citas WHERE id = @id');
    res.status(200).json({ message: 'Cita eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ error: 'Error al eliminar la cita' });
  }
};

// Rutas para gestionar especialidades médicas
exports.getEspecialidades = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM especialidades');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({ error: 'Error al obtener especialidades' });
  }
};

exports.createEspecialidad = async (req, res) => {
  const { nombre } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request().input('nombre', sql.VarChar, nombre).query(`
      INSERT INTO especialidades (nombre) VALUES (@nombre)
    `);
    res.status(201).json({ message: 'Especialidad creada con éxito' });
  } catch (error) {
    console.error('Error al crear especialidad:', error);
    res.status(500).json({ error: 'Error al crear especialidad' });
  }
};

exports.updateEspecialidad = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id).input('nombre', sql.VarChar, nombre).query(`
      UPDATE especialidades SET nombre = @nombre WHERE id = @id
    `);
    res.status(200).json({ message: 'Especialidad actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar especialidad:', error);
    res.status(500).json({ error: 'Error al actualizar especialidad' });
  }
};

exports.deleteEspecialidad = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id).query('DELETE FROM especialidades WHERE id = @id');
    res.status(200).json({ message: 'Especialidad eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar especialidad:', error);
    res.status(500).json({ error: 'Error al eliminar especialidad' });
  }
};
