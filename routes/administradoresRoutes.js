// routes/administradoresRoutes.js
const express = require('express');
const router = express.Router();
const administradoresController = require('../controllers/administradoresController');  // Verifica que esté correctamente importado
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rutas para gestionar usuarios (Pacientes y Médicos)
router.get('/usuarios', roleMiddleware('ADMIN'), administradoresController.getUsuarios);
router.post('/usuarios', roleMiddleware('ADMIN'), administradoresController.createUsuario);  // Asegúrate de que esta ruta esté bien definida
router.put('/usuarios/:id', roleMiddleware('ADMIN'), administradoresController.updateUsuario);
router.delete('/usuarios/:id', roleMiddleware('ADMIN'), administradoresController.deleteUsuario);

// Rutas para gestionar citas
router.get('/citas', roleMiddleware('ADMIN'), administradoresController.getCitas);
router.delete('/citas/:id', roleMiddleware('ADMIN'), administradoresController.deleteCita);

// Rutas para gestionar especialidades médicas
router.get('/especialidades', roleMiddleware('ADMIN'), administradoresController.getEspecialidades);
router.post('/especialidades', roleMiddleware('ADMIN'), administradoresController.createEspecialidad);
router.put('/especialidades/:id', roleMiddleware('ADMIN'), administradoresController.updateEspecialidad);
router.delete('/especialidades/:id', roleMiddleware('ADMIN'), administradoresController.deleteEspecialidad);

// Rutas para gestionar administradores
router.post('/admin', roleMiddleware('ADMIN'), administradoresController.createAdmin); // Crear un administrador
router.get('/admin', roleMiddleware('ADMIN'), administradoresController.getAdministradores); // Obtener administradores

module.exports = router;
