// routes/pacientesRoutes.js
const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Registro público (no necesita JWT)
router.post('/registro', pacientesController.createPaciente);

// Resto de rutas: SOLO ADMIN
router.get('/', roleMiddleware('ADMIN'), pacientesController.getPacientes);
router.get('/:id', roleMiddleware('ADMIN'), pacientesController.getPaciente);
router.put('/:id', roleMiddleware('ADMIN'), pacientesController.updatePaciente);
router.delete('/:id', roleMiddleware('ADMIN'), pacientesController.deletePaciente);

module.exports = router;
