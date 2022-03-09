// Middleware para autenticar token
const jwt = require('jsonwebtoken');
const config = require('config');


// Autorization es el nombre que le puse en el header de Postman
let verificarToken = (req,res,next) => {
    let token = req.get('Autorization');
    // Utilizo el método verify de jwt
    // Recibe tres parámetros token, secret (configure global), calback con error y data decodificada
    // Utilizo código http 401 para este caso: no autorizado
    jwt.verify(token, config.get('configToken.SEED'), (err,decode) => {
        if(err) {
            return res.status(401).json({
                error: err
            });
        }
        req.usuario = decode.data;
        next();
    });
};

module.exports = verificarToken;