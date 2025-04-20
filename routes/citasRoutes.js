const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

router.post('/', citasController.createCita);
router.get('/', citasController.getCitas);
router.put('/:id', citasController.updateCita);
router.delete('/:id', citasController.deleteCita);

module.exports = router;
