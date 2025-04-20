// controllers/especialidadesController.js
const especialidadesModel = require('../models/especialidadesModel');

exports.getEspecialidades = async (req, res) => {
  try {
    const lista = await especialidadesModel.getEspecialidades();
    res.json(lista);
  } catch (err) {
    console.error('Error al obtener especialidades:', err.stack);
    res.status(500).json({ error: 'Hubo un error al obtener las especialidades' });
  }
};
