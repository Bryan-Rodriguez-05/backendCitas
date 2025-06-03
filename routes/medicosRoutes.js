// routes/medicosRoutes.js
const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /api/medicos/registro  (solo ADMIN)
router.post('/registro', roleMiddleware('ADMIN'), medicosController.createMedico);

// GET /api/medicos          (roles: PACIENTE, MEDICO, ADMIN)
router.get('/', roleMiddleware(['PACIENTE','MEDICO','ADMIN']), medicosController.getMedicos);

// GET /api/medicos/:id      (roles: MEDICO, ADMIN)
router.get('/:id', roleMiddleware(['MEDICO','ADMIN']), medicosController.getMedico);

// PUT /api/medicos/:id      (solo ADMIN)
router.put('/:id', roleMiddleware('ADMIN'), medicosController.updateMedico);

// DELETE /api/medicos/:id   (solo ADMIN)
router.delete('/:id', roleMiddleware('ADMIN'), medicosController.deleteMedico);

// GET /api/medicos/:id/citas  (solo MEDICO, la ruta interna usa req.user.id)
router.get('/:id/citas', roleMiddleware('MEDICO'), medicosController.getCitasParaMedico);

module.exports = router;

