// controllers/especialidadesController.js
const especialidadesModel = require('../models/especialidadesModel');

exports.getEspecialidades = async (req, res) => {
  try {
    const lista = await especialidadesModel.getEspecialidades();
    return res.json(lista);
  } catch (err) {
    console.error('Error al obtener especialidades:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener las especialidades' });
  }
};

exports.createEspecialidad = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    const nuevoId = await especialidadesModel.createEspecialidad(nombre);
    return res.status(201).json({ message: 'Especialidad creada', id: nuevoId });
  } catch (err) {
    console.error('Error al crear especialidad:', err);
    return res.status(500).json({ error: 'Error al crear especialidad' });
  }
};

exports.updateEspecialidad = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    await especialidadesModel.updateEspecialidad(id, nombre);
    return res.json({ message: 'Especialidad actualizada' });
  } catch (err) {
    console.error('Error al actualizar especialidad:', err);
    return res.status(500).json({ error: 'Error al actualizar especialidad' });
  }
};

exports.deleteEspecialidad = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await especialidadesModel.deleteEspecialidad(id);
    return res.json({ message: 'Especialidad eliminada' });
  } catch (err) {
    console.error('Error al eliminar especialidad:', err);
    return res.status(500).json({ error: 'Error al eliminar especialidad' });
  }
};
