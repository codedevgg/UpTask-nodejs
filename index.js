const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser=require('body-parser');
const expressValidator=require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require ('cookie-parser');
const passport = require('./config/passport');


// crear una aplicacion de express
const app = express();

//Donde cargar los archivos estáticos
app.use(express.static('public'));

//Habilitar Pug
app.set('view engine', 'pug');


// helpers con algunas funciones
const helpers=require('./helpers');

// crear la conexion a la DB
const db=require('./config/db');

// Importar los modelos
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');


db.sync()
    .then(()=>console.log('Conectado al Servidor'))
    .catch(error=>console.log(error));



// Habilitar bodyParser para leer datos del formulario
app.use(bodyParser.urlencoded({extended:true}));

// Agregamos express validator a toda la aplicaciòn
app.use(expressValidator());



// Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

// Agregar flash messages
app.use(flash());

app.use(cookieParser());

// sessiones nos permiten navegar entre distintas paginas sin volvernos a autenticar
app.use(session({
    secret:  'supersecreto',
    resave:  false,
    saveUninitialized:  false

}));

app.use(passport.initialize());
app.use(passport.session());


// middware
app.use((req,res,next)=>{
    
    res.locals.vardump=helpers.vardump;
    res.locals.mensajes=req.flash();
    res.locals.usuario={...req.user} || null;
    
    next();
});





app.use('/', routes());


app.listen(3000);

//require('./handlers/email');