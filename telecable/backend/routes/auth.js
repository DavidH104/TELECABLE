const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const db = mongoose.connection;

/*
LOGIN ADMIN
POST
/api/auth/admin
*/

router.post('/admin', async (req, res) => {

try {

const { usuario, password } = req.body;

const admin = await db.collection('admin').findOne({
usuario: usuario,
password: password
});

if(!admin){
return res.status(401).json({
mensaje: "Credenciales incorrectas"
});
}

res.json({
mensaje: "Login correcto",
admin: admin
});

} catch(error){

res.status(500).json({
error: error.message
});

}

});


/*
LOGIN USUARIO POR NUMERO DE CONTRATO
POST
/api/auth/user
*/

router.post('/user', async (req, res) => {

try {

const { contrato } = req.body;

const user = await db.collection('clientes').findOne({
"N.CONTRATOS": Number(contrato)
});

if(!user){
return res.status(404).json({
mensaje: "Usuario no encontrado"
});
}

res.json({
mensaje: "Usuario encontrado",
user: user
});

} catch(error){

res.status(500).json({
error: error.message
});

}

});


module.exports = router;