const nodemailer=require('nodemailer');
const pug = require('pug');
const juice =require('juice');// Nos permite agregar estilos lineales
const htmlToText = require('html-to-text');//Nos crear una version de html de puro texto
const util = require('util');//Utilidad de node en caso de no aceptar async utiliza Promises
const emailConfig =require('../config/email');

//Ir a la web de nodemailer.com y buscar la configuración
let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    
    auth: {
      user: emailConfig.user, // generated ethereal user
      pass: emailConfig.pass // generated ethereal password
    }
  });
  
  // generar HTML
  const generarHTML=(archivo, opciones={})=>{
      const html=pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, opciones);
      return juice(html);
  }
  exports.enviar=async(opciones)=>{
    const html= generarHTML(opciones.archivo, opciones);
    const text=htmlToText.fromString(html);
    let opcionesEmail = {
        from: 'UpTask <no-reply@uptask.com>', // sender address
        to: opciones.usuario.email, // list of receivers
        subject: opciones.subject, // Subject line
        text,
        html
        
      };

      const enviarEmail=util.promisify(transport.sendMail, transport);
      return enviarEmail.call(transport,opcionesEmail)
      
  }

    


