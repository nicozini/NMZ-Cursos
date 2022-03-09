const express = require('express');
const curso_model = require('../models/curso_model');
const Curso = require('../models/curso_model');
const usuario_model = require('../models/usuario_model');
const router = express.Router();
const verificarToken = require('../middlewares/auth');

// Rutas GET
router.get('/', (req,res) => {
    res.json('Listo el GET de cursos.');
});

router.get('/listar', verificarToken, (req,res) => {
    let resultado = listarCursos()

    // res.json({
    //     // req.usuario viene de una asignacion que le puse a req en el middleware auth
    //     usuario: req.usuario
    // })

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
router.post('/', verificarToken, (req,res) => {
    let resultado = crearCurso(req);
    
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

// Rutas PUT
router.put('/:id', verificarToken, (req, res) => {
    let resultado = actualizarCurso(req.params.id, req.body);
    
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

// Rutas DELETE
router.delete('/:id', verificarToken, (req,res) => {
    let resultado = desactivarCurso(req.params.id)

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





// Métodos (debería modularizar en Controller)
async function crearCurso(req) {
    let curso = new Curso({
        titulo: req.body.titulo,
        autor: req.usuario._id,
        descripcion: req.body.descripcion
    })
    // Acá se crea el documento MongoDB de curso
    return await curso.save()
}

async function listarCursos() {
    let cursos = await Curso.find({estado: true}).populate('autor', 'nombre -_id');
    return cursos;
}

async function actualizarCurso(id, body) {
    let curso = await Curso.findByIdAndUpdate(id, {
        $set: {
            titulo: body.titulo,
            descripcion: body.desc

        }
    }, {new: true});
    return curso;
}

async function desactivarCurso(id) {
    let curso = await Curso.findByIdAndUpdate(id, {
        $set: {
            estado: false
        }
    }, {new: true});
    return curso;
}




module.exports = router;