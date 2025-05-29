// models/observers/emailObserver.js
const nodemailer = require('nodemailer');

class EmailObserver {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,  // Usamos el puerto 465 para SSL
      secure: true,  // Usamos 'true' para SSL
      auth: {
        user: 'supersayayingoku026@gmail.com',  // Tu correo de Gmail
        pass: 'jzwq tpuv ixxb uach'  // Contraseña de aplicación generada
      }
    });
  }

  update(cita) {
      console.log("Método update ejecutado");

    // Lógica para verificar si el correo está presente
    if (!cita.paciente_email) {
      console.log('No se proporcionó el correo del paciente.');
      return;
    }

    // Lógica para enviar el correo
    const mailOptions = {
      from: 'supersayayingoku026@gmail.com',
      to: citaDominio.paciente_email,  // Aquí accedes a la variable directamente
      subject: 'Confirmación de Cita Médica',
      text: `Estimado paciente, su cita ha sido agendada para el ${citaDominio.fechaCita}. Motivo: ${citaDominio.motivo}`
    };

    console.log('Intentando enviar correo...');

    // Ahora usamos 'this.transporter' correctamente
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error al enviar correo:', error);
      } else {
        console.log('Correo enviado: ' + info.response);
      }
    });
  }
}

module.exports = EmailObserver;
