// routes/especialidadesRoutes.js
const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/especialidades    (roles: PACIENTE, MEDICO, ADMIN)
router.get(
  '/',
  roleMiddleware(['PACIENTE','MEDICO','ADMIN']),
  especialidadesController.getEspecialidades
);

// POST /api/especialidades   (solo ADMIN)
router.post(
  '/',
  roleMiddleware('ADMIN'),
  especialidadesController.createEspecialidad
);

// PUT /api/especialidades/:id  (solo ADMIN)
router.put(
  '/:id',
  roleMiddleware('ADMIN'),
  especialidadesController.updateEspecialidad
);

// DELETE /api/especialidades/:id  (solo ADMIN)
router.delete(
  '/:id',
  roleMiddleware('ADMIN'),
  especialidadesController.deleteEspecialidad
);

module.exports = router;
