const passport = require('passport');
const Usuarios =require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');



exports.autenticarUsuario=passport.authenticate('local',{
    successRedirect:  '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash:  true,
    badRequestMessage:  'Ambos campos son obligatorios'
});

//Funciòn para revisar si el usuario està logueado o no
exports.usuarioAutenticado=(req,res,next)=>{

    // Si el usuario està autenticado, adelante
    if(req.isAuthenticated()){
        return next();
    }
    // sino esta autenticador, redigir al formulario
    return res.redirect('/iniciar-sesion');

};

//Funciòn para cerrar sesion
exports.cerrarSesion=(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/iniciar-sesion');//al cerrar sesion nos lleva al login
    })
}
// Genera un token si el usuario es válido
exports.enviarToken=async(req,res)=>{
    // verificar que el usuario existe
    const {email}=req.body
    const usuario = await Usuarios.findOne({where:{email}})
    // Si no existe el usuario
    if(!usuario){
        req.flash('error','No existe es cuenta');
        res.redirect('/reestablecer');
    }

    // Usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');
    // expiracion
    usuario.expiracion =Date.now()+3600000;

    //Guardar en la Base de Datos
    await usuario.save();

    //url de reset
    const resetUrl=`http://${req.headers.host}/reestablecer/${usuario.token}`;

    // Envia el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject:  'Password Reset',
        resetUrl,
        archivo: 'reestablecer-password'

    });
    // terminar
    req.flash('correcto','Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

exports.validarToken=async(req,res)=>{
    const usuario = await Usuarios.findOne({
        where:{
            token:  req.params.token
        }
    })
    // sino encuentra el usuario
    if(!usuario){
        req.flash('error','No Válido');
        res.redirect('/reestablecer');
    }

    // Formulario para generar el password de usuario valido
    res.render('resetPassword',{
        nombrePagina: 'Reestablecer Contraseña'
    });
    
}
// cambia el paswword por uno nuevo
exports.actualizarPassword=async(req,res)=>{
    //console.log(req.params.token);

    //verifica el token valido pero también la fecha de expiración
    const usuario=await Usuarios.findOne({
        where:{
            token: req.params.token,
            expiracion:{
                [Op.gte]:  Date.now()
            }
        }
    });

    // verificamos si el usuario existe
    if(!usuario){
        req.flash('error','No Válido');
        res.redirect('/reestablecer');
    }

    // Hashear el nuevo password
    usuario.password=bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token=null;
    usuario.expiracion=null;

    // guardamos el nuevo password
    await usuario.save();
    req.flash('correcto', 'Tu password se ha modificado correctamente');
    res.redirect('/iniciar-sesion');
}
