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
    default: 'pendiente' // pendiente, atendido
  },
  fechaAtencion: {
    type: Date,
    default: null
  }
}, {
  collection: 'reportes'
})

// Middleware para auto-eliminar reportes después de 30 días
reportSchema.index({ fecha: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

module.exports = mongoose.model("Report", reportSchema)
