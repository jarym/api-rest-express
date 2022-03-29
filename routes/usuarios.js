const express=require('express');//Importamos express
const ruta=express.Router();//Se crea una instancia de express
const Joi = require('joi');//importamo JOI

const usuarios=[
    {id:1,nombre:'Juan'},
    {id:2,nombre:'Pedro'},
    {id:3,nombre:'Maria'},
    {id:4,nombre:'Carlos'},
];

ruta.get('/',(req, res)=>{
    res.send(usuarios);
});
//Como pasar parametros dentro de las rutas, por ejemplo
//solo quiero un usuario especifico en vez de todos
//: delante del parametro Express sabe que es un parametro a recibir
ruta.get('/:id',(req,res)=>{
    //devuelve el primer elemento de arreglo que cumpla con un predicado
    let usuario=existeUsuario(req.params.id);
    if(!usuario)
        res.status(404).send('El usuario no se encuentra');//Devuelve el estado HTTP
    else
        res.send(usuarios);
});
//Tiene el mismo nombre que la peticion GET, Express hace la diferencia dependiendo el tipo de peticion
ruta.post('/',(req,res)=>{
    //El objeto req tiene la propiedadd body
    const {value,error}=validarUsuario(req.body.nombre)
    if(!error){
        const usuario={
            id:usuarios.length + 1,
            nombre:req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario)
    }else{
        const mensaje=error.details[0].message;
        res.status(400).send(mensaje);
    }
    console.log(value,error);
});

/**
 * Peticion POST
 * Metodo para actualizar la informacion
 * Recibe el id del usuario que se quiere actualizar/modificar utilizando en parametro en la ruta :id
 */
ruta.put('/:id',(req,res)=>{
    //Validar que el usuario se encuentre en los registros
    let usuario=existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no se encuentra');//Devuelve el estado HTTP
        return;
    }
    //en el body del request debe venir la informacion del usuario

    //El objeto req tiene la propiedadd body
    const {value,error}=validarUsuario(req.body.nombre);
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    //cambiando el nombre
    usuario.nombre=value.nombre
    console.log(usuario.nombre);
});

/**
 * Peticion DELETE
 * Metodo para eliminar infromacion
 * Recibe el id del usuario que se quiere eliminar utilizando en parametro en la ruta :id
 */
ruta.delete('/:id',(req,res)=>{
    //Validar que el usuario se encuentre en los registros
    const usuario=existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no se encuentra');//Devuelve el estado HTTP
        return;
    }
    //encontrar el indice del dato a eliminar
    const index=usuarios.indexOf(usuario);
    usuarios.splice(index,1);//Elimina el elemento en el inidice
    res.send(usuario);//Responde con el usuairo eliminado
});

function existeUsuario(id){
    return (usuarios.find(u=>u.id===parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string()
            .min(3)//minimo 3 caracteres
            .required()//Requerido
    });
    return (schema.validate({nombre:nom}));
}

module.exports=ruta;