class Subject {
  constructor() {
    this.observers = [];  // Lista de observadores
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notifyObservers(cita) {
    this.observers.forEach(observer => observer.update(cita));  // Notifica a todos los observadores
  }
}

module.exports = Subject;

