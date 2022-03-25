const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express=require('express');//Importamos express
const config=require('config');
const logger = require('./logger');//importamos el modulo logger.js
const morgan=require('morgan');
const app=express();//Se crea una instancia de express
const Joi = require('joi');//importamo JOI
/**
 * Middleware
 * El middleware es un bloque de codigo que se ejecuta entre las peticiones del usuario (cliente)(request)
 * y el request que llega al servidor. Es un enlace entre la peticion del usuario y el servidor, antes
 * de que este pueda dar una respuesta
 * 
 * Las funciones de middleware son funciones que tienen acceso al objeto de peticion (request req), al objeto
 * de respuesta (response res) y a la siguiente funcion middleware en el ciclo de peticiones/respuestas
 * de la aplicacion. La siguiente funcion middleware se denota normalmente con una variable denominada next
 * 
 * Las funciones de middleware pueden realizr las siguientes tareas:
 *      - Ejecuta cualquier codigo
 *      - Realizar cambios en la peticion y los objetos de respuesta
 *      - Finalizar el ciclo de peticion/respuesta
 *      - invocar la siguiente funcion de middleware en la pila
 * 
 * Express es un framework de direccionamiento y de uso de middleware que permite que la aplicacion tenga
 * una funiconalidad minima propia
 * 
 * Ya usamos algunos middleware como exress.json(), que transforma el body del req a formato JSON
 *           -----------------------
 * request -|-> json() --> route() -|-> response
 *           -----------------------
 * 
 * route() --> funciones GET,POST,PUT,DELETE
 */        

//JSON hace un parsing de la entrada a formato JSON, de tal manera que lo que recibamos en el req
//de una peticion esté en formato JSON
app.use(express.json());//Se le dice a express que use este middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//crear funcion middleware
//app.use(logger);//logger ya hace referencia a la funcion log por el export

console.log(`Aplicacion: ${config.get('nombre')}`);
console.log(`DB Server: ${config.get('configDB.host')}`);

if(app.get('env')=='development'){
    app.use(morgan('tiny'));
    inicioDebug('Morgan esta habilitado');
}

//Operaciones con la Base de Datos
dbDebug('Conectado a la base de datos');

/*
app.use(function(req,res,next){
    console.log('Autenticando...');
    next();
});
*/

/**
 * Query String -> url/?var1=val1&var2=val2...
 */

/**
 * Hay cuatro tipo de peticiones
 * get: Consulta de datos
 * app.get();
 * post: Envia datos al servidor (insetar datos)
 * app.post();
 * put: Actualizar datos
 * app.put();
 * delete: Elimina datos
 * app.delete();
 */

const usuarios=[
    {id:1,nombre:'Juan'},
    {id:2,nombre:'Pedro'},
    {id:3,nombre:'Maria'},
    {id:4,nombre:'Carlos'},
];

//Consulta en la ruta raiz de nuestro servidor con una funcion callback
app.get('/',(req, res)=>{
    res.send('Hola mundo desde Express');
});

app.get('/api/usuario',(req, res)=>{
    res.send(usuarios);
});

//Como pasar parametros dentro de las rutas, por ejemplo
//solo quiero un usuario especifico en vez de todos
//: delante del parametro Express sabe que es un parametro a recibir
app.get('/api/usuario/:id',(req,res)=>{
    //devuelve el primer elemento de arreglo que cumpla con un predicado
    let usuario=existeUsuario(req.params.id);
    if(!usuario)
        res.status(404).send('El usuario no se encuentra');//Devuelve el estado HTTP
    else
        res.send(usuarios);
});
//Tiene el mismo nombre que la peticion GET, Express hace la diferencia dependiendo el tipo de peticion
app.post('/api/usuario',(req,res)=>{
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
app.put('/api/usuario/:id',(req,res)=>{
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
app.delete('/api/usuario/:id',(req,res)=>{
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
//Usando el modulo process, se lee una varuable de entorno
//si la variable no existe, va a tomar un valor por default (3000)
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Activo en el puerto ${port}...`);
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