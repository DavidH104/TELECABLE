const mongoose = require('mongoose');

const canalSchema = new mongoose.Schema({
  nombre: String,
  numero: Number,
  categoria: String,
  imagen: String
});

const precioPaqueteSchema = new mongoose.Schema({
  nombre: String,
  clave: { type: String, unique: true },
  precio: Number,
  velocidad: String,
  canales: Number,
  descripcion: String,
  activo: { type: Boolean, default: true }
});

const promocionSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  descuento: Number,
  precioEspecial: Number,
  validoHasta: Date,
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now }
});

const configSchema = new mongoose.Schema({
  clave: { type: String, unique: true, default: 'system' },
  
  paquetes: [precioPaqueteSchema],
  
  canales: [canalSchema],
  
  promociones: [promocionSchema],
  
  mensajesGlobales: [{
    titulo: String,
    mensaje: String,
    fecha: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true }
  }],
  
  precioDefault: { type: Number, default: 200 }
}, {
  collection: 'configuracion'
});

module.exports = mongoose.model('Config', configSchema);
