// models/domain/citaUrgente.js
const Cita = require('./cita');

class CitaUrgente extends Cita {
  constructor(props) {
    super(props);
    this.urgency = 'Alta';
  }

  getDetails() {
    return `¡URGENTE! → ${super.getDetails()} (Urgencia: ${this.urgency})`;
  }
}

module.exports = CitaUrgente;
