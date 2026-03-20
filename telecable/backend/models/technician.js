const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  especialidad: {
    type: String,
    enum: ['Instalaciones', 'Reparaciones', 'General', 'Todas'],
    default: 'Todas'
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Technician', technicianSchema);
