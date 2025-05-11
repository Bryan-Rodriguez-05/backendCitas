// models/citasModel.js
const { sql, poolPromise } = require('../config/dbConfig');

// Modificamos createCita para incluir 'tipo'
// Modificamos createCita para incluir 'tipo'
exports.createCita = async (tipo, paciente_id, medico_id, especialidad_id, fecha_cita, motivo) => {
  const pool = await poolPromise;
  const query = `
    INSERT INTO citas (tipo, paciente_id, medico_id, fecha_cita, motivo)
    OUTPUT INSERTED.id
    VALUES (@tipo, @paciente_id, @medico_id, @fecha_cita, @motivo)
  `;
  const result = await pool.request()
    .input('tipo', sql.VarChar, tipo) // Aquí agregamos el tipo
    .input('paciente_id', sql.Int, paciente_id)
    .input('medico_id', sql.Int, medico_id)
    .input('especialidad_id', sql.Int, especialidad_id)  // Asegúrate de pasar el ID de la especialidad
    .input('fecha_cita', sql.DateTime, fecha_cita)
    .input('motivo', sql.VarChar, motivo)
    .query(query);
  return result.recordset[0];
};


// Modificamos getCitas para incluir 'tipo'
exports.getCitas = async (paciente_id) => {
  const pool = await poolPromise;
  let query = `
    SELECT 
      c.id, 
      c.fecha_cita, 
      c.motivo, 
      c.tipo,  
      p.nombre      AS paciente_nombre, 
      p.apellido    AS paciente_apellido, 
      m.nombre      AS medico_nombre, 
      m.apellido    AS medico_apellido,
      e.nombre      AS especialidad_nombre  -- Traemos el nombre de la especialidad desde la tabla medicos
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos   m ON c.medico_id   = m.id
    INNER JOIN especialidades e ON m.especialidad_id = e.id
  `;
  const request = pool.request();
  if (paciente_id) {
    query += ' WHERE c.paciente_id = @paciente_id';
    request.input('paciente_id', sql.Int, paciente_id);
  }
  const result = await request.query(query);
  // devolvemos siempre el array de filas
  return result.recordset;
};

// Función de actualización sin cambios (solo modificamos el tipo cuando sea necesario)
exports.updateCitaSoloFechaMotivo = async (id, fecha_cita, motivo) => {
  const pool = await poolPromise;
  const query = `
    UPDATE citas
       SET fecha_cita = @fecha_cita,
           motivo     = @motivo
     WHERE id         = @id
  `;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('fecha_cita', sql.DateTime, fecha_cita)
    .input('motivo', sql.VarChar, motivo)
    .query(query);
  return result.rowsAffected[0];
};

// Función de eliminación sin cambios
exports.deleteCita = async (id) => {
  const pool = await poolPromise;
  const query = 'DELETE FROM citas WHERE id = @id';
  await pool.request()
    .input('id', sql.Int, id)
    .query(query);
};
