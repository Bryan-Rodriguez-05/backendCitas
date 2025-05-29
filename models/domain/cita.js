
const Subject = require('./subject'); // Asegúrate de importar correctamente la clase Subject

class Cita extends Subject {
  constructor(id, pacienteId, medicoId, fechaCita, motivo, paciente_email) {
    super(); // Llamada al constructor de Subject
    this.id = id;
    this.pacienteId = pacienteId;
    this.medicoId = medicoId;
    this.fechaCita = fechaCita;
    this.motivo = motivo;
    this.paciente_email = paciente_email; // Asigna correctamente la propiedad paciente_email
  }

  setEmail(correo) {
    this.paciente_email = correo; // Asigna el correo del paciente
  }

  getDetails() {
    return `Cita para el paciente con ID: ${this.pacienteId}, médico: ${this.medicoId}, fecha: ${this.fechaCita}, motivo: ${this.motivo}`;
  }
}

module.exports = Cita;

