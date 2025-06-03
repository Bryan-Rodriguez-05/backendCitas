// controllers/citasController.js
const citasModel = require('../models/citasModel');
const medicosModel = require('../models/medicosModel');

exports.createCita = async (req, res) => {
  // Rol 'PACIENTE'
  const pacienteUsuarioId = req.user.id;           // extraído del JWT
  const { medico_usuario_id, fecha_cita, motivo, tipo } = req.body;

  if (!medico_usuario_id || !fecha_cita || !motivo || !tipo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar que el médico existe
    const medicoPerfil = await medicosModel.getMedicoPorUsuarioId(medico_usuario_id);
    if (!medicoPerfil) {
      return res.status(400).json({ error: 'Médico no encontrado.' });
    }

    // Crear cita
    const nuevaCitaId = await citasModel.createCita(
      pacienteUsuarioId,
      medico_usuario_id,
      new Date(fecha_cita),
      motivo,
      tipo
    );

    return res.status(201).json({
      message: 'Cita agendada exitosamente',
      cita_id: nuevaCitaId
    });
  } catch (err) {
    console.error('Error al agendar cita:', err);
    return res.status(500).json({ error: 'Hubo un error al agendar la cita' });
  }
};

exports.getCitas = async (req, res) => {
  const { rol, id: usuarioId } = req.user;
  const pacienteParam = parseInt(req.query.paciente_usuario_id || '0', 10);

  try {
    let filas = [];

    if (rol === 'PACIENTE') {
      filas = await citasModel.getCitasPorPaciente(usuarioId);
    } else if (rol === 'MEDICO') {
      filas = await medicosModel.getCitasPorMedico(usuarioId);
    } else if (rol === 'ADMIN') {
      if (pacienteParam) {
        filas = await citasModel.getCitasPorPaciente(pacienteParam);
      } else {
        filas = await citasModel.getAllCitas();
      }
    } else {
      return res.status(403).json({ error: 'Rol no permitido para esta operación.' });
    }

    return res.json(filas);
  } catch (err) {
    console.error('Error al obtener las citas:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener las citas' });
  }
};

exports.getCitaById = async (req, res) => {
  const citaId = parseInt(req.params.id, 10);
  const { rol, id: usuarioId } = req.user;

  try {
    const cita = await citasModel.getCitaPorId(citaId);
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (rol === 'PACIENTE' && cita.paciente_usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No autorizado para ver esta cita' });
    }
    if (rol === 'MEDICO' && cita.medico_usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No autorizado para ver esta cita' });
    }

    return res.json(cita);
  } catch (err) {
    console.error('Error al obtener cita por ID:', err);
    return res.status(500).json({ error: 'Hubo un error al obtener la cita' });
  }
};

exports.updateCita = async (req, res) => {
  const citaId = parseInt(req.params.id, 10);
  const { fecha_cita, motivo, tipo } = req.body;
  const { rol, id: usuarioId } = req.user;

  if (!fecha_cita || !motivo || !tipo) {
    return res.status(400).json({ error: 'Fecha, motivo y tipo son obligatorios.' });
  }

  try {
    const cita = await citasModel.getCitaPorId(citaId);
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (rol === 'PACIENTE' && cita.paciente_usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
    }
    if (rol === 'MEDICO') {
      return res.status(403).json({ error: 'Los médicos no pueden editar citas aquí' });
    }

    const filasAfectadas = await citasModel.updateCita(
      citaId,
      new Date(fecha_cita),
      motivo,
      tipo
    );
    if (filasAfectadas === 0) {
      return res.status(500).json({ error: 'No se pudo actualizar la cita' });
    }

    return res.json({ message: 'Cita actualizada exitosamente' });
  } catch (err) {
    console.error('Error al actualizar cita:', err);
    return res.status(500).json({ error: 'Hubo un error al actualizar la cita' });
  }
};

exports.deleteCita = async (req, res) => {
  const citaId = parseInt(req.params.id, 10);
  const { rol, id: usuarioId } = req.user;

  try {
    const cita = await citasModel.getCitaPorId(citaId);
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (rol === 'PACIENTE' && cita.paciente_usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta cita' });
    }
    if (rol === 'MEDICO') {
      return res.status(403).json({ error: 'Los médicos no pueden eliminar citas' });
    }

    await citasModel.deleteCita(citaId);
    return res.json({ message: 'Cita eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar cita:', err);
    return res.status(500).json({ error: 'Hubo un error al eliminar la cita' });
  }
};
