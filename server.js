require('dotenv').config(); 
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const cors = require('cors');
const dbConfig = require('./config/dbConfig');
const citasRoutes = require('./routes/citasRoutes');
const especialidadesRoutes = require('./routes/especialidadesRoutes');
const pacientesRoutes = require('./routes/pacientesRoutes');
const authRoutes = require('./routes/authRoutes');
const medicosRoutes = require('./routes/medicosRoutes');
const authMiddleware = require('./middlewares/authMiddleware')
const app = express();
const port = 5000;
const jwt     = require('jsonwebtoken');
// Cargar el archivo de configuración de Swagger
const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));


app.use(cors());
app.use(express.json());



// Rutas

// Rutas públicas
app.use('/api/login', authRoutes);
app.use('/api/pacientes', pacientesRoutes); // si quieres permitir registro público

// **A partir de aquí todas requieren JWT**
app.use('/api/citas', authMiddleware, citasRoutes);
app.use('/api/especialidades', authMiddleware, especialidadesRoutes);
app.use('/api/medicos', authMiddleware, medicosRoutes);



app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
