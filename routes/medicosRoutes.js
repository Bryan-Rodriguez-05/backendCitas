// routes/medicosRoutes.js
const express = require('express');
const router  = express.Router();
const medicosController = require('../controllers/medicosController');

// GET /api/medicos?especialidad_id=#
router.get('/', medicosController.getMedicosByEspecialidad);

module.exports = router;
