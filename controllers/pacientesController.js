// controllers/pacientesController.js

const pacientesModel = require('../models/pacientesModel');

exports.getPacientes = async (req, res) => {
  try {
    const pacientes = await pacientesModel.getPacientes();
    res.json(pacientes);
  } catch (err) {
    console.error('Error al obtener pacientes:', err.stack);
    res.status(500).json({ error: 'Hubo un error al obtener los pacientes' });
  }
};

exports.createPaciente = async (req, res) => {
  const { nombre, apellido, dni, fecha_nacimiento, direccion, telefono, correo,contrasenia } = req.body;

  if (!nombre || !apellido || !dni || !correo || !contrasenia) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const inserted = await pacientesModel.createPaciente(
      nombre,
      apellido,
      dni,
      fecha_nacimiento,
      direccion,
      telefono,
      correo,
      contrasenia
    );
    res.status(201).json({
      message: 'Paciente registrado exitosamente',
      pacienteId: inserted.id
    });
  } catch (err) {
    console.error('Error al registrar paciente:', err.stack);
    res.status(500).json({ error: 'Hubo un error al registrar al paciente' });
  }
};

exports.updatePaciente = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, fecha_nacimiento, direccion, telefono, correo,contrasenia } = req.body;

  if (!nombre || !apellido || !dni || !correo || !contrasenia) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    await pacientesModel.updatePaciente(
      id,
      nombre,
      apellido,
      dni,
      fecha_nacimiento,
      direccion,
      telefono,
      correo,
      contrasenia
    );
    res.status(200).json({ message: 'Paciente modificado exitosamente' });
  } catch (err) {
    console.error('Error al modificar paciente:', err.stack);
    res.status(500).json({ error: 'Hubo un error al modificar al paciente' });
  }
};

exports.deletePaciente = async (req, res) => {
  const { id } = req.params;

  try {
    await pacientesModel.deletePaciente(id);
    res.status(200).json({ message: 'Paciente eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar paciente:', err.stack);
    res.status(500).json({ error: 'Hubo un error al eliminar al paciente' });
  }
};
