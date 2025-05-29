// controllers/citasController.js

// 1) Importa la fábrica y la capa de persistencia
// controllers/citasController.js
const CitaFactory = require('../models/domain/citaFactory');
const citasModel = require('../models/citasModel');
const EmailObserver = require('../models/observers/emailObserver');
const pacientesModel = require('../models/pacientesModel');
const Subject = require('../models//domain/subject'); // Cambia esta línea si estás usando observer.js

const subject = new Subject();
const emailObserver = new EmailObserver();
subject.addObserver(emailObserver);

exports.createCita = async (req, res) => {
  const { tipo, paciente_id, medico_id, especialidad_id, fecha_cita, motivo } = req.body;

  if (!tipo || !paciente_id || !medico_id || !especialidad_id || !fecha_cita || !motivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const formattedFecha = new Date(req.body.fecha_cita).toISOString(); 
    const inserted = await citasModel.createCita(tipo, paciente_id, medico_id, especialidad_id, formattedFecha, motivo);

    // Obtener el correo del paciente
    const paciente = await pacientesModel.getPacienteById(paciente_id);
    
    if (!paciente || !paciente.correo) {
      return res.status(400).json({ error: 'Correo del paciente no encontrado' });
    }

    const correoPaciente = paciente.correo;

    console.log('Correo del paciente:', correoPaciente);  // Verifica el correo

    // Construye el objeto de dominio usando la fábrica y asigna el correo
    const citaDominio = CitaFactory.create(tipo, {
      id: inserted.id,
      pacienteId: inserted.paciente_id,
      medicoId: inserted.medico_id,
      especialidadId: inserted.especialidad_id,
      fechaCita: inserted.fecha_cita,
      motivo: inserted.motivo,
      paciente_email: correoPaciente  // Asigna el correo del paciente
    });

    // Notificar a los observadores
    citaDominio.notifyObservers(citaDominio); 

    res.status(201).json({
      message: 'Cita agendada exitosamente',
      cita: {
        id: citaDominio.id,
        pacienteId: citaDominio.pacienteId,
        medicoId: citaDominio.medicoId,
        especialidadId: citaDominio.especialidadId,
        fechaCita: citaDominio.fechaCita,
        motivo: citaDominio.motivo,
        urgencia: citaDominio.urgency,
        detalles: citaDominio.getDetails(),
        tipo: citaDominio.urgency === 'Alta' ? 'Urgente' : 'General'
      }
    });
    
  } catch (err) {
    console.error('Error al agendar cita:', err);
    res.status(500).json({ error: 'Hubo un error al agendar la cita' });
  }
};



exports.getCitas = async (req, res) => {
  const paciente_id = req.query.paciente_id;
  try {
    const filas = await citasModel.getCitas(paciente_id);
    res.json(filas);
  } catch (err) {
    console.error('Error al obtener las citas:', err);
    res.status(500).json({ error: 'Hubo un error al obtener las citas' });
  }
};

exports.updateCita = async (req, res) => {
  const { id } = req.params;
  const { fecha_cita, motivo } = req.body;
  if (!fecha_cita || !motivo) {
    return res.status(400).json({ error: 'Fecha y motivo son obligatorios' });
  }
  try {
    const rows = await citasModel.updateCitaSoloFechaMotivo(parseInt(id, 10), fecha_cita, motivo);
    if (rows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ message: 'Cita actualizada exitosamente' });
  } catch (err) {
    console.error('Error al actualizar cita:', err);
    res.status(500).json({ error: 'Hubo un error al actualizar la cita' });
  }
};

exports.deleteCita = async (req, res) => {
  const { id } = req.params;
  try {
    await citasModel.deleteCita(id);
    res.json({ message: 'Cita eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar cita:', err);
    res.status(500).json({ error: 'Hubo un error al eliminar la cita' });
  }
};
