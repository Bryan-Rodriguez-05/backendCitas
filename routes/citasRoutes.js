// routes/citasRoutes.js
const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// PACIENTE crea nueva cita
// POST /api/citas
router.post(
  '/',
  roleMiddleware('PACIENTE'),
  citasController.createCita
);

// PACIENTE ve sus citas
// GET /api/citas/mis-citas
router.get(
  '/mis-citas',
  roleMiddleware('PACIENTE'),
  citasController.getCitas
);

// MEDICO ve sus citas
// GET /api/citas/medico/mis-citas
router.get(
  '/medico/mis-citas',
  roleMiddleware('MEDICO'),
  citasController.getCitas
);

// ADMIN ve todas o filtra por paciente (usa ?paciente_usuario_id=)
// GET /api/citas
router.get(
  '/',
  roleMiddleware('ADMIN'),
  citasController.getCitas
);

// GET /api/citas/:id   (roles: ADMIN, PACIENTE, MEDICO)
router.get(
  '/:id',
  roleMiddleware(['ADMIN','PACIENTE','MEDICO']),
  citasController.getCitaById
);

// PUT /api/citas/:id   (roles: ADMIN, PACIENTE(dueño))
router.put(
  '/:id',
  roleMiddleware(['ADMIN','PACIENTE']),
  citasController.updateCita
);

// DELETE /api/citas/:id   (roles: ADMIN, PACIENTE(dueño))
router.delete(
  '/:id',
  roleMiddleware(['ADMIN','PACIENTE']),
  citasController.deleteCita
);

module.exports = router;
