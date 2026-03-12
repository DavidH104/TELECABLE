const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

  numero: {
    type: String,
    required: true,
    unique: true
  },

  nombre: String,

  telefono: String,

  localidad: String,

  // Nueva funcionalidad de contraseña
  password: {
    type: String,
    default: null
  },
  codigoVerificacion: {
    type: String,
    default: null
  },
  codigoExpira: {
    type: Date,
    default: null
  },

  estatus: {
    type: String,
    default: "Activo"
  },

  deuda: {
    type: Number,
    default: 0
  },

  // Campos originales de MongoDB (para referencia)
  'NOMBRE DEL SUSCRIPTOR': String,
  'LOCALIDAD': String,
  NUMERO: Number

},{
  collection:'clientes'
})

// Transformar la respuesta para que el frontend reciba los campos en minúsculas
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Si tiene NOMBRE DEL SUSCRIPTOR, usarla como nombre
    if (ret['NOMBRE DEL SUSCRIPTOR'] && !ret.nombre) {
      ret.nombre = ret['NOMBRE DEL SUSCRIPTOR'];
    }
    // Si tiene LOCALIDAD, usarla como localidad
    if (ret.LOCALIDAD && !ret.localidad) {
      ret.localidad = ret.LOCALIDAD;
    }
    // Si tiene NUMERO (number), convertir a string
    if (ret.NUMERO && !ret.numero) {
      ret.numero = String(ret.NUMERO);
    }
    // Eliminar campos originales
    delete ret['NOMBRE DEL SUSCRIPTOR'];
    delete ret['LOCALIDAD'];
    delete ret.NUMERO;
    return ret;
  }
});

module.exports = mongoose.model("User",userSchema)
