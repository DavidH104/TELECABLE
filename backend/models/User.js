const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    nombre:{
        type:String,
        required:true
    },

    correo:{
        type:String,
        required:true
    },

    telefono:{
        type:String
    },

    direccion:{
        type:String
    },

    plan:{
        type:String
    },

    estatus:{
        type:String,
        default:"Activo"
    },

    pagosPendientes:{
        type:Number,
        default:0
    },

    ultimoPago:{
        type:Date
    }

})

module.exports = mongoose.model('User',UserSchema)