const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

const Technician = mongoose.model('Technician', technicianSchema);

async function createDefaultTechnician() {
  try {
    await mongoose.connect('mongodb://localhost:27017/telecable');
    
    // Verificar si ya existe
    const exists = await Technician.findOne({ username: 'tecnico1' });
    if (exists) {
      console.log('El técnico ya existe');
      process.exit(0);
    }
    
    // Crear técnico por defecto
    const hashedPassword = await bcrypt.hash('tecnico123', 10);
    const tecnico = new Technician({
      username: 'tecnico1',
      password: hashedPassword,
      nombre: 'Juan Pérez',
      telefono: '1234567890',
      email: 'juan@telecable.com',
      especialidad: 'Todas'
    });
    
    await tecnico.save();
    console.log('Técnico creado exitosamente!');
    console.log('Usuario: tecnico1');
    console.log('Contraseña: tecnico123');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createDefaultTechnician();
