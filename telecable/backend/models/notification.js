const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['reporte_completado', 'reporte_asignado', 'pago_registrado'],
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  usuarioDestinoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  esParaAdmin: {
    type: Boolean,
    default: false
  },
  reporteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  leida: {
    type: Boolean,
    default: false
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);


