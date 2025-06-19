// server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const authRoutes            = require('./routes/authRoutes');
const pacientesRoutes       = require('./routes/pacientesRoutes');
const medicosRoutes         = require('./routes/medicosRoutes');
const administradoresRoutes = require('./routes/administradoresRoutes');  // Asegúrate de que esta importación esté correctamente configurada
const especialidadesRoutes  = require('./routes/especialidadesRoutes');
const citasRoutes           = require('./routes/citasRoutes');
const authMiddleware        = require('./middlewares/authMiddleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ──────────────────────────────────────────────────────────────────────
// 1) RUTA PÚBLICA:  POST /api/login   (login NO requiere token)
// ──────────────────────────────────────────────────────────────────────
app.use('/api/login', authRoutes);

// ──────────────────────────────────────────────────────────────────────
// 2) RUTA PÚBLICA:  POST /api/pacientes/registro   (registro de paciente NO requiere token)
// ──────────────────────────────────────────────────────────────────────
app.use('/api/pacientes/registro', pacientesRoutes);

// ──────────────────────────────────────────────────────────────────────
// 3) A PARTIR DE AQUÍ, TODAS LAS RUTAS REQUIEREN JWT (authMiddleware)
// ──────────────────────────────────────────────────────────────────────
app.use(authMiddleware); // Rutas protegidas a partir de este punto

// ──────────────────────────────────────────────────────────────────────
// 4) RUTAS PROTEGIDAS (ya activado authMiddleware)
// ──────────────────────────────────────────────────────────────────────
app.use('/api/pacientes',       pacientesRoutes);
app.use('/api/medicos',         medicosRoutes);
app.use('/api/administradores', administradoresRoutes);  // Ruta para administradores
app.use('/api/especialidades',  especialidadesRoutes);
app.use('/api/citas',           citasRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
