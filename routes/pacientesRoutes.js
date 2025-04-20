const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');

// Obtener todos los pacientes
router.get('/', pacientesController.getPacientes);

// Crear un nuevo paciente
router.post('/', pacientesController.createPaciente);

// Modificar un paciente existente
router.put('/:id', pacientesController.updatePaciente);

// Eliminar un paciente
router.delete('/:id', pacientesController.deletePaciente);

module.exports = router;
