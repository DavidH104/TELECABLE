const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nombreCliente: {
    type: String,
    required: true
  },
  numeroContrato: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['Falla', 'Instalacion', 'Retiro', 'Pago', 'Otro'],
    default: 'Otro'
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
    default: 'pendiente'
  },
  fechaAtencion: {
    type: Date,
    default: null
  },
  tecnicoAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    default: null
  },
  tecnicoNombre: {
    type: String,
    default: null
  },
  enviadoATecnico: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'reportes'
})

reportSchema.index({ fecha: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

module.exports = mongoose.model("Report", reportSchema)
