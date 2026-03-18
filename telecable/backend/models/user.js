const mongoose = require("mongoose")

const reporteSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['Falla', 'Instalacion', 'Retiro', 'Pago', 'Otro'],
    default: 'Falla'
  },
  mensaje: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  estatus: {
    type: String,
    enum: ['Pendiente', 'En Revision', 'Asignado', 'En Proceso', 'Completado', 'Cancelado'],
    default: 'Pendiente'
  },
  prioridad: {
    type: String,
    enum: ['Baja', 'Normal', 'Alta', 'Urgente'],
    default: 'Normal'
  },
  tecnicoAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  tecnicoNombre: String,
  notasTecnico: String,
  fechaCompletado: Date,
  direccion: String
});

const userSchema = new mongoose.Schema({

  numero: {
    type: String,
    required: true,
    unique: true
  },

  nombre: String,

  telefono: String,

  localidad: String,

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

  direccion: String,

  reportes: [reporteSchema],

  'NOMBRE DEL SUSCRIPTOR': String,
  'LOCALIDAD': String,
  NUMERO: Number

},{
  collection:'clientes'
})

userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    if (ret['NOMBRE DEL SUSCRIPTOR'] && !ret.nombre) {
      ret.nombre = ret['NOMBRE DEL SUSCRIPTOR'];
    }
    if (ret.LOCALIDAD && !ret.localidad) {
      ret.localidad = ret.LOCALIDAD;
    }
    if (ret.NUMERO && !ret.numero) {
      ret.numero = String(ret.NUMERO);
    }
    delete ret['NOMBRE DEL SUSCRIPTOR'];
    delete ret['LOCALIDAD'];
    delete ret.NUMERO;
    return ret;
  }
});

module.exports = mongoose.model("User",userSchema)
