const express = require('express');
const Usuario = require('../models/usuario_model');
// const Joi = require('joi');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');

router.post('/', (req,res) => {
    Usuario.findOne({email: req.body.email})
        .then(datos => {
            if(datos) {
                const passwordValido = bcrypt.compareSync(req.body.password, datos.password);
                if(!passwordValido) return res.status(400).json({error: 'Ok', msj: 'Usuario o contraseña incorrecta'})

                // Generar el token del lado del Cliente
                // Si es correcto, el res.send va a devolver el token para el usuario
                // FORMA 1 - jwt.sign({_id: datos.id, nombre: datos.nombre, email: datos.email}, 'password');
                // FORMA 2: {expiresIn: 60 * 60});
                const jwtoken = jwt.sign({
                    data: {_id: datos.id, nombre: datos.nombre, email: datos.email}
                  }, config.get('configToken.SEED'), {expiresIn: config.get('configToken.expiration')});

                res.json({
                    usuario: {
                        _id: datos.id,
                        nombre: datos.nombre,
                        email: datos.email
                    },
                    token: jwtoken
                });

            } else {
                res.status(400).json({
                    error: 'ok',
                    msj: 'Usuario o contraseña incorrecta'
                })
            }
        })
        .catch(error => {
            res.status(400).json({
                error: 'ok',
                msj: 'Error en el servicio ' + error 
            })
        })
});





module.exports = router;