// controllers/medicosController.js
const medicoModel = require('../models/medicoModel');

exports.getMedicosByEspecialidad = async (req, res) => {
  try {
    const { especialidad_id } = req.query;
    if (!especialidad_id) {
      return res.status(400).json({ error: 'El ID de la especialidad es obligatorio' });
    }
    const medicos = await medicoModel.getMedicosByEspecialidad(especialidad_id);
    res.json(medicos);
  } catch (err) {
    console.error('Error al obtener los médicos:', err.stack);
    res.status(500).json({ error: 'Hubo un error al obtener los médicos' });
  }
};
