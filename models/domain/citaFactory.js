// models/domain/citaFactory.js
const CitaGeneral = require('./citaGeneral');
const CitaUrgente = require('./citaUrgente');

class CitaFactory {
  static create(type, props) {
    const t = type.toLowerCase();
    if (t === 'general') {
      return new CitaGeneral(props);
    }
    if (t === 'urgente') {
      return new CitaUrgente(props);
    }
    throw new Error(`Tipo de cita desconocido: ${type}`);
  }
}

module.exports = CitaFactory;

