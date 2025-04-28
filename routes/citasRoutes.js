const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/',authMiddleware, citasController.createCita);
router.get('/',authMiddleware, citasController.getCitas);
router.put('/:id', citasController.updateCita);
router.delete('/:id', citasController.deleteCita);

module.exports = router;
