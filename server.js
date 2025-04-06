const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = 5000;

// Middleware para permitir solicitudes desde otros orígenes (CORS)
app.use(cors());

// Middleware para manejar datos JSON en el cuerpo de las solicitudes
app.use(express.json());

const config = {
  user: 'victoriakim',
  password: 'ssAyiyCWcp5pTTB',
  server: 'grupo04.database.windows.net',  // O la IP de tu servidor
  database: 'gestiondecitas',
  options: {
    encrypt: true,   // Requiere encriptación para conexiones a Azure
    trustServerCertificate: true // En producción, se debería gestionar el certificado
  }
};

let pool; // Declaramos el pool de conexiones

// Conectar a la base de datos
sql.connect(config)
  .then((connectionPool) => {
    pool = connectionPool;
    console.log('Conectado a SQL Server');
  })
  .catch(err => {
    console.error('Error de conexión:', err);
  });

// Ruta para login
app.post('/api/login', (req, res) => {
  const { email, dni } = req.body;

  // Verificar si el paciente existe
  const query = 'SELECT * FROM pacientes WHERE correo = @correo AND dni = @dni';

  pool.request()
    .input('correo', sql.VarChar, email)
    .input('dni', sql.VarChar, dni)
    .query(query)
    .then(result => {
      if (result.recordset.length > 0) {
        res.json({ success: true, patient: result.recordset[0] }); // Retorna los datos del paciente
      } else {
        res.status(400).json({ error: 'Credenciales incorrectas' });
      }
    })
    .catch(err => {
      console.error('Error al iniciar sesión:', err);
      res.status(500).json({ error: 'Hubo un error en el servidor' });
    });
});

// Ruta para registrar un nuevo paciente
app.post('/api/pacientes', (req, res) => {
  const { nombre, apellido, dni, fecha_nacimiento, direccion, telefono, correo } = req.body;

  // Verificar si los campos obligatorios están presentes
  if (!nombre || !apellido || !dni || !correo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Consulta para insertar un nuevo paciente en la base de datos
  const query = `
  INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, direccion, telefono, correo)
  OUTPUT INSERTED.id
  VALUES (@nombre, @apellido, @dni, @fecha_nacimiento, @direccion, @telefono, @correo)
`;

pool.request()
  .input('nombre', sql.VarChar, nombre)
  .input('apellido', sql.VarChar, apellido)
  .input('dni', sql.VarChar, dni)
  .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
  .input('direccion', sql.VarChar, direccion)
  .input('telefono', sql.VarChar, telefono)
  .input('correo', sql.VarChar, correo)
  .query(query)
  .then(result => {
    res.status(201).json({ message: 'Paciente registrado exitosamente', pacienteId: result.recordset[0].id });
  })
  .catch(err => {
    console.error('Error al registrar paciente:', err);
    res.status(500).json({ error: 'Hubo un error al registrar al paciente' });
  });

});

// Ruta para modificar un paciente existente
app.put('/api/pacientes/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, fecha_nacimiento, direccion, telefono, correo } = req.body;

  // Verificar si los campos obligatorios están presentes
  if (!nombre || !apellido || !dni || !correo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Consulta para actualizar la información del paciente
  const query = `
    UPDATE pacientes 
    SET nombre = @nombre, apellido = @apellido, dni = @dni, fecha_nacimiento = @fecha_nacimiento, 
        direccion = @direccion, telefono = @telefono, correo = @correo
    WHERE id = @id
  `;

  pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.VarChar, nombre)
    .input('apellido', sql.VarChar, apellido)
    .input('dni', sql.VarChar, dni)
    .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
    .input('direccion', sql.VarChar, direccion)
    .input('telefono', sql.VarChar, telefono)
    .input('correo', sql.VarChar, correo)
    .query(query)
    .then(result => {
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }
      res.status(200).json({ message: 'Paciente modificado exitosamente' });
    })
    .catch(err => {
      console.error('Error al modificar paciente:', err);
      res.status(500).json({ error: 'Hubo un error al modificar al paciente' });
    });
});

// Ruta para obtener todos los pacientes
app.get('/api/pacientes', (req, res) => {
  const query = 'SELECT * FROM pacientes';

  pool.request().query(query)
    .then(result => {
      res.json(result.recordset);  // Enviar los pacientes al frontend
    })
    .catch(err => {
      console.error('Error al obtener pacientes:', err);
      res.status(500).json({ error: 'Hubo un error al obtener los pacientes' });
    });
});

// Ruta para eliminar un paciente
app.delete('/api/pacientes/:id', (req, res) => {
  const { id } = req.params;

  // Consulta para eliminar el paciente de la base de datos
  const query = 'DELETE FROM pacientes WHERE id = @id';

  pool.request()
    .input('id', sql.Int, id)
    .query(query)
    .then(result => {
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }
      res.status(200).json({ message: 'Paciente eliminado exitosamente' });
    })
    .catch(err => {
      console.error('Error al eliminar paciente:', err);
      res.status(500).json({ error: 'Hubo un error al eliminar al paciente' });
    });
});

// Ruta para agendar una cita
app.post('/api/citas', (req, res) => {
  const { paciente_id, fecha_cita, motivo } = req.body;

  // Verificar que los campos necesarios estén presentes
  if (!paciente_id || !fecha_cita || !motivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Insertar la nueva cita en la base de datos
  const query = `
  INSERT INTO citas (paciente_id, fecha_cita, motivo)
  OUTPUT INSERTED.id
  VALUES (@paciente_id, @fecha_cita, @motivo)
`;

pool.request()
  .input('paciente_id', sql.Int, paciente_id)
  .input('fecha_cita', sql.DateTime, fecha_cita)
  .input('motivo', sql.VarChar, motivo)
  .query(query)
  .then(result => {
    res.status(201).json({ message: 'Cita agendada exitosamente', citaId: result.recordset[0].id });
  })
  .catch(err => {
    console.error('Error al agendar cita:', err);
    res.status(500).json({ error: 'Hubo un error al agendar la cita' });
  });

});

// Ruta para obtener todas las citas
app.get('/api/citas', (req, res) => {
  const paciente_id = req.query.paciente_id;
  let query = `
    SELECT * FROM citas 
    INNER JOIN pacientes ON citas.paciente_id = pacientes.id
  `;
  
  if (paciente_id) {
    query += " WHERE pacientes.id = @paciente_id";
    pool.request()
      .input('paciente_id', sql.Int, paciente_id)
      .query(query)
      .then(result => {
        res.json(result.recordset);
      })
      .catch(err => {
        console.error('Error al obtener las citas:', err);
        res.status(500).json({ error: 'Hubo un error al obtener las citas' });
      });
  } else {
    pool.request().query(query)
      .then(result => {
        res.json(result.recordset);
      })
      .catch(err => {
        console.error('Error al obtener las citas:', err);
        res.status(500).json({ error: 'Hubo un error al obtener las citas' });
      });
  }
});

app.put('/api/citas/:id', (req, res) => {
  const { id } = req.params;
  const { paciente_id, fecha_cita, motivo } = req.body;

  if (!paciente_id || !fecha_cita || !motivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const query = `
    UPDATE citas 
    SET paciente_id = @paciente_id, fecha_cita = @fecha_cita, motivo = @motivo
    WHERE id = @id
  `;

  pool.request()
    .input('id', sql.Int, id)
    .input('paciente_id', sql.Int, paciente_id)
    .input('fecha_cita', sql.DateTime, fecha_cita)
    .input('motivo', sql.VarChar, motivo)
    .query(query)
    .then(result => {
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      res.status(200).json({ message: 'Cita actualizada exitosamente' });
    })
    .catch(err => {
      console.error('Error al actualizar cita:', err);
      res.status(500).json({ error: 'Hubo un error al actualizar la cita' });
    });
});

app.delete('/api/citas/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM citas WHERE id = @id';

  pool.request()
    .input('id', sql.Int, id)
    .query(query)
    .then(result => {
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      res.status(200).json({ message: 'Cita eliminada exitosamente' });
    })
    .catch(err => {
      console.error('Error al eliminar cita:', err);
      res.status(500).json({ error: 'Hubo un error al eliminar la cita' });
    });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
