const Proyectos=require('../models/Proyectos');
const slug = require('slug');
const Tareas = require ('../models/Tareas');


exports.proyectosHome = async(req, res) => {

    //console.log(res.locals.usuario);

    const usuarioId=res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where:{usuarioId:usuarioId}});
    
    res.render('index', {
        nombrePagina: 'Proyectos',
        proyectos
    });
}

exports.formularioProyecto= async (req,res)=>{
    const usuarioId=res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where:{usuarioId:usuarioId}});
    res.render('nuevoProyecto',{
        nombrePagina:'Nuevo Proyecto',
        proyectos
    });
}

exports.nuevoProyecto= async (req,res)=>{
    const usuarioId=res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where:{usuarioId:usuarioId}});
    // Enviar a la consola lo que el usuaio escribio en el formulario
    //console.log(req.body);

    // Validar que tengamos algo en el input 
    // Apicando un Destructoring
    const {nombre}=req.body;
    let errores=[];

    if (!nombre){
        errores.push({'texto':'Agrega un Nombre al Proyecto'})
    }
    // si hay errores
    if(errores.length>0){
        res.render('nuevoProyecto',{
            nombrePagina:'Nuevo Proyecto',
            errores,
            proyectos
        })
    }else{
        // Nohay errores
        // Insertar en una D.B
        const usuarioId=res.locals.usuario.id;
        await Proyectos.create({ nombre, usuarioId });
        res.redirect('/');
            
    }

}

exports.proyectoPorUrl=async (req,res,next)=>{
    const usuarioId=res.locals.usuario.id;

    const proyectosPromise = Proyectos.findAll({where:{usuarioId:usuarioId}});
    const proyectoPromise =  Proyectos.findOne({
        where:{
            url: req.params.url,
            usuarioId
        }
    });
    const [proyectos,proyecto]=await Promise.all([proyectosPromise, proyectoPromise]);

    // Consultar tareas del proyecto actual

    const tareas=await Tareas.findAll({
        where:{
            proyectoId : proyecto.id
        },
        include :[
            {model : Proyectos}
        ]
    });
   


    if(!proyecto) return next();
    // render a la vista
    res.render('tareas',{
        nombrePagina: 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    })
}

exports.formularioEditar= async (req,res)=>{
    const usuarioId=res.locals.usuario.id;

    const proyectosPromise = Proyectos.findAll({where:{usuarioId:usuarioId}});
    const proyectoPromise =  Proyectos.findOne({
        where:{
            id: req.params.id,
            usuarioId
        }
    });
    const [proyectos,proyecto]=await Promise.all([proyectosPromise, proyectoPromise]);

    // render a la vista
    res.render('nuevoProyecto',{
        nombrePagina: 'Editar Proyecto',
        proyectos,
        proyecto
    });
}

exports.actualizarProyecto= async (req,res)=>{
    const usuarioId=res.locals.usuario.id;

    const proyectos = await Proyectos.findAll({where:{usuarioId:usuarioId}});

    const nombre = req.body.nombre;

    let errores =[];
    if(!nombre){
        errores.push({'texto':'Agregar un Nombre al proyecto'})
    }
    // si hay errores
    if(errores.length>0){
        res.render('nuevoProyecto',{
            nombrePagina:'Nuevo Proyecto',
            errores,
            proyectos
        })
    }else{
        //No hay errores
        //Insertar en DB
        await Proyectos.update(
            {nombre:nombre},
            {where:{id: req.params.id}}
        );
        res.redirect('/');
    }
}

exports.eliminarProyecto=async (req,res,next)=>{
    //req, query o params para leer los datos que se envian al servidor
    //console.log(req.query);
    const {urlProyecto}=req.query;
    const resultado= await Proyectos.destroy({where:{url:urlProyecto}});
    if(!resultado){
        return next();
    }
    res.status(200).send('Proyecto Eliminado Correctamente');

}

