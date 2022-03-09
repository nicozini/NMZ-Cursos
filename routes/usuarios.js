const express = require('express');
const Usuario = require('../models/usuario_model');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const verificarToken = require('../middlewares/auth');


// Esquema de Joi (POST)
const schema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(10)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    repeat_password: Joi.ref('password'),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})


// Rutas GET
router.get('/', (req,res) =>{
    res.json('Listo el GET de usuarios.');
});

router.get('/listar', verificarToken, (req,res) => {
    let resultado = usuariosActivos();

    resultado
    .then(documento => {
        res.status(200).json({
            valor: documento
        })
    })
    .catch(error => {
        res.status(400).json({
            error: error
        })
    })
});

// Rutas POST
router.post('/', (req,res) => {
    let body = req.body;

    // Validación para evitar duplicar mails de usuarios
    Usuario.findOne({email: body.email}, (err, user) => {
        if (err) {
            return res.status(400).json({error: 'Server Error'});
        }
        if (user) {
            return res.status(200).json({msj: 'El usuario ya existe'});
        }
    })

    // Validación Joi
    // const result = schema.validate({ nombre: body.nombre });
    // console.log(result);
    // Result contiene un objeto literal con value y error (ambos objetos literales). Aplico destructuring
    const {value, error} = schema.validate({
        nombre: body.nombre,
        email: body.email
    });

    if(!error) {
        let resultado = crearUsuario(body);
    
        resultado
        .then(documento => {
            res.status(200).json({
                nombre: documento.nombre,
                email: documento.email
            })
        })
        .catch(error => {
            res.status(400).json({
                error: error
            })
        })
    } else {
        res.status(400).json({
            error: error
        });
    }



});

// Rutas PUT
router.put('/:email', verificarToken, (req,res) => {

    const {value, error} = schema.validate({nombre: req.body.nombre});

    if (!error) {
        let resultado = actualizarUsuario(req.params.email, req.body);
    
        resultado
        .then(documento => {
            res.status(200).json({
                nombre: documento.nombre,
                email: documento.email
            })
        })
        .catch(error => {
            res.status(400).json({
                error: error
            })
        })
    } else {
        res.status(400).json({
            error: error,
            tipo: error.details[0].message
        })
    }





});

// Rutas DELET
// Recorar que no eliminamos documentos sino cambiamos de estado. Uso delete a los fines practicos
router.delete('/:email', verificarToken, (req,res) => {
    let resultado = desactivarUsuario(req.params.email);

    resultado
    .then(documento => {
        res.status(200).json({
            nombre: documento.nombre,
            email: documento.email
        })
    })
    .catch(error => {
        res.status(400).json({
            error: error
        })
    })
});










// Métodos (deberían ir en controller)
async function crearUsuario(body) {
    let usuario = new Usuario({
        email: body.email,
        nombre: body.nombre,
        password: bcrypt.hashSync(body.password, 10)
    });
    return await usuario.save();
}

async function usuariosActivos() {
    let usuarios = await Usuario.find({estado: true}).select({nombre:1,email:1});
    return usuarios;
}

async function actualizarUsuario(email, body) {
    let usuario = await Usuario.findOneAndUpdate({"email": email}, {
        $set: {
            nombre: body.nombre,
            password: body.password
        }
    }, {new: true});
    return usuario;
}

async function desactivarUsuario(email) {
    let usuario = await Usuario.findOneAndUpdate({"email": email}, {
        $set: {
            estado: false
        }
    }, {new: true});
    return usuario;
}










module.exports = router;