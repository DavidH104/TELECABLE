const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

NUMERO:Number,

N:{
CONTRATOS:Number
},

"NOMBRE DEL SUSCRIPTOR":String,

LOCALIDAD:String,

deuda:{
type:Number,
default:0
},

estatus:{
type:String,
default:"Activo"
}

})

module.exports = mongoose.model('User',userSchema)