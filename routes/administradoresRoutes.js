// routes/administradoresRoutes.js
const express = require('express');
const router = express.Router();
const administradoresController = require('../controllers/administradoresController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Todas las rutas aquí son accesibles sólo por ADMIN
router.post('/', roleMiddleware('ADMIN'), administradoresController.createAdmin);
router.get('/', roleMiddleware('ADMIN'), administradoresController.getAdministradores);

// (Opcional: PUT /:id, DELETE /:id si lo necesitas, también con roleMiddleware('ADMIN'))

module.exports = router;

