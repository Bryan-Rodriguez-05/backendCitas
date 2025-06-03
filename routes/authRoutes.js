// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/', authController.login);  // POST /api/login

module.exports = router;

