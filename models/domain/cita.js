// models/domain/cita.js
class Cita {
  constructor({ id, pacienteId, medicoId, especialidadId, fechaCita, motivo }) {
    this.id             = id;
    this.pacienteId     = pacienteId;
    this.medicoId       = medicoId;
    this.especialidadId = especialidadId;
    this.fechaCita      = fechaCita;
    this.motivo         = motivo;
  }

  // Descripción genérica; las subclases la enriquecerán
  getDetails() {
    return `Cita [ID ${this.id}]: Paciente ${this.pacienteId}, Médico ${this.medicoId}, Especialidad ${this.especialidadId}, Fecha ${this.fechaCita}, Motivo "${this.motivo}"`;
  }
}

module.exports = Cita;

  