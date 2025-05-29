const Cita = require('./cita'); // Asegúrate de que Cita extiende de Subject

class CitaUrgente extends Cita {
  constructor(id, pacienteId, medicoId, fechaCita, motivo) {
    super(id, pacienteId, medicoId, fechaCita, motivo);
    this.urgency = 'Alta';
  }

  getDetails() {
    return `URGENTE: ${super.getDetails()} - Urgencia: ${this.urgency}`;
  }
}

module.exports = CitaUrgente;

