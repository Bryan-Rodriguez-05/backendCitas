const express = require('express');
const cors = require('cors');
const dbConfig = require('./config/dbConfig');
const citasRoutes = require('./routes/citasRoutes');
const especialidadesRoutes = require('./routes/especialidadesRoutes');
const pacientesRoutes = require('./routes/pacientesRoutes');
const authRoutes = require('./routes/authRoutes');
const medicosRoutes = require('./routes/medicosRoutes');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());



// Rutas

app.use('/api', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/medicos', medicosRoutes);
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
