const express = require('express');
const mongoose = require('mongoose');
const usuarios = require('./routes/usuarios');
const cursos = require('./routes/cursos');
const auth = require('./routes/auth');
const config = require('config');

// Conectar DB
mongoose.connect(config.get('configDB.HOST'))
    .then(() => console.log('Conectado a MongoDB...'))
    .catch(error => console.log('Error al conectar con MongoDB', error));

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/usuarios', usuarios);
app.use('/api/cursos', cursos);
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Example app listening on port '+ port);
    console.log('API RESTful ejecutándose...');
});