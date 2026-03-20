const mongoose = require('mongoose');

const preregistroSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  email: String,
  direccion: {
    type: String,
    required: true
  },
  paquete: {
    type: String,
    enum: ['basico', 'estandar', 'premium'],
    required: true
  },
  precio: Number,
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  numeroContrato: String,
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  fechaAprobacion: Date,
  observaciones: String,
  mensaje: String
}, {
  collection: 'preregistros'
});

module.exports = mongoose.model('Preregistro', preregistroSchema);
