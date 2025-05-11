// models/domain/citaGeneral.js
const Cita = require('./cita');

class CitaGeneral extends Cita {
  constructor(props) {
    super(props);
    this.urgency = 'Normal';
  }

  getDetails() {
    return `Consulta General → ${super.getDetails()} (Urgencia: ${this.urgency})`;
  }
}

module.exports = CitaGeneral;
