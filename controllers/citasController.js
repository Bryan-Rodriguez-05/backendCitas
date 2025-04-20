// controllers/citasController.js

const citasModel = require('../models/citasModel');

exports.createCita = async (req, res) => {
  const { paciente_id, medico_id, fecha_cita, motivo } = req.body;

  if (!paciente_id || !medico_id || !fecha_cita || !motivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const inserted = await citasModel.createCita(paciente_id, medico_id, fecha_cita, motivo);
    res.status(201).json({
      message: 'Cita agendada exitosamente',
      citaId: inserted.id
    });
  } catch (err) {
    console.error('Error al agendar cita:', err.stack);
    res.status(500).json({ error: 'Hubo un error al agendar la cita' });
  }
};

exports.getCitas = async (req, res) => {
  const paciente_id = req.query.paciente_id;

  try {
    const citas = await citasModel.getCitas(paciente_id);
    res.json(citas);
  } catch (err) {
    console.error('Error al obtener las citas:', err.stack);
    res.status(500).json({ error: 'Hubo un error al obtener las citas' });
  }
};

exports.updateCita = async (req, res) => {
    const { id } = req.params;
    const { paciente_id, medico_id, fecha_cita, motivo } = req.body;
  
    if (!paciente_id || !medico_id || !fecha_cita || !motivo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
  
    try {
      const rows = await citasModel.updateCita(
        parseInt(id, 10),
        parseInt(paciente_id, 10),
        parseInt(medico_id, 10),
        fecha_cita,
        motivo
      );
      if (rows === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      res.json({ message: 'Cita actualizada exitosamente' });
    } catch (err) {
      console.error('Error al actualizar cita:', err.stack);
      res.status(500).json({ error: 'Hubo un error al actualizar la cita' });
    }
  };

exports.deleteCita = async (req, res) => {
  const { id } = req.params;

  try {
    await citasModel.deleteCita(id);
    res.status(200).json({ message: 'Cita eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar cita:', err.stack);
    res.status(500).json({ error: 'Hubo un error al eliminar la cita' });
  }
};
