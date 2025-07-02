// controllers/citasController.js
const citasModel = require('../models/citasModel');
const medicosModel = require('../models/medicosModel');
const { sql, poolPromise } = require('../config/dbConfig');
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
    return res.status(500).json({ error: err.message });
  }
};

exports.getCitas = async (req, res) => {
  try {
    const { rol, id: usuarioId } = req.user;
    const pool = await poolPromise;
    let result;

    console.log("UsuarioId:", usuarioId);
    if (rol === 'PACIENTE') {
      result = await pool.request()
        .input('paciente_usuario_id', sql.Int, usuarioId)
        .query(`
          SELECT * FROM citas
          WHERE paciente_usuario_id = @paciente_usuario_id
        `);
    } else if (rol === 'MEDICO') {
      result = await pool.request()
        .input('medico_usuario_id', sql.Int, usuarioId)
        .query(`
          SELECT * FROM citas
          WHERE medico_usuario_id = @medico_usuario_id
        `);
    } else { // ADMIN
      result = await pool.request()
        .query(`SELECT * FROM citas`);
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener citas:', err);
    return res.status(500).json({ error: 'Error al obtener citas' });
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
