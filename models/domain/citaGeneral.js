const Cita = require('./cita'); // Asegúrate de que Cita extiende de Subject

class CitaGeneral extends Cita {
  constructor(id, pacienteId, medicoId, fechaCita, motivo) {
    super(id, pacienteId, medicoId, fechaCita, motivo);
    this.urgency = 'Normal';
  }

  getDetails() {
    return `Consulta General: ${super.getDetails()} - Urgencia: ${this.urgency}`;
  }
}

module.exports = CitaGeneral;
