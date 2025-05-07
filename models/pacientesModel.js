// models/pacientesModel.js
const { sql, poolPromise } = require('../config/dbConfig');

exports.getPacientes = async () => {
  const pool = await poolPromise;
  const result = await pool.request()
    .query('SELECT * FROM pacientes');
  return result.recordset;
};

exports.createPaciente = async (
  nombre,
  apellido,
  dni,
  fecha_nacimiento,
  direccion,
  telefono,
  correo,
  contrasenia
) => {
  const pool = await poolPromise;
  const query = `
    INSERT INTO pacientes
      (nombre, apellido, dni, fecha_nacimiento, direccion, telefono, correo, contrasenia)
    OUTPUT INSERTED.id
    VALUES
      (@nombre, @apellido, @dni, @fecha_nacimiento, @direccion, @telefono, @correo, @contrasenia)
  `;
  const result = await pool.request()
    .input('nombre', sql.VarChar, nombre)
    .input('apellido', sql.VarChar, apellido)
    .input('dni', sql.VarChar, dni)
    .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
    .input('direccion', sql.VarChar, direccion)
    .input('telefono', sql.VarChar, telefono)
    .input('correo', sql.VarChar, correo)
    .input('contrasenia', sql.VarChar, contrasenia)
    .query(query);
  return result.recordset[0];
};

exports.updatePaciente = async (
  id,
  nombre,
  apellido,
  dni,
  fecha_nacimiento,
  direccion,
  telefono,
  correo,
  contrasenia
) => {
  const pool = await poolPromise;
  const query = `
    UPDATE pacientes
    SET
      nombre = @nombre,
      apellido = @apellido,
      dni = @dni,
      fecha_nacimiento = @fecha_nacimiento,
      direccion = @direccion,
      telefono = @telefono,
      correo = @correo
      contrasenia = @contrasenia
    WHERE id = @id
  `;
  await pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.VarChar, nombre)
    .input('apellido', sql.VarChar, apellido)
    .input('dni', sql.VarChar, dni)
    .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
    .input('direccion', sql.VarChar, direccion)
    .input('telefono', sql.VarChar, telefono)
    .input('correo', sql.VarChar, correo)
    .input('contrasenia', sql.VarChar, contrasenia)
    .query(query);
};

exports.deletePaciente = async (id) => {
  const pool = await poolPromise;
  const query = 'DELETE FROM pacientes WHERE id = @id';
  await pool.request()
    .input('id', sql.Int, id)
    .query(query);
};
