// controllers/administradoresController.js
const administradoresModel = require('../models/administradoresModel');

exports.createAdmin = async (req, res) => {
  try {
    const { correo, contrasenia, nombre, apellido } = req.body;
    if (!correo || !contrasenia || !nombre || !apellido) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const usuarioId = await administradoresModel.createAdminCompleto({
      correo,
      contrasenia,
      nombre,
      apellido
    });

    return res.status(201).json({ message: 'Administrador creado', usuario_id: usuarioId });
  } catch (err) {
    console.error('Error al crear administrador:', err.message);
    if (err.message.includes('Ya existe un usuario')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Error interno' });
  }
};

exports.getAdministradores = async (req, res) => {
  try {
    const lista = await administradoresModel.getAdministradores();
    return res.json(lista);
  } catch (err) {
    console.error('Error al obtener administradores:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener administradores' });
  }
};
