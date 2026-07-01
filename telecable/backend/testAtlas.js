const mongoose = require('mongoose');
const { connectDB } = require('./db');

const userSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  telefono: { type: String },
  localidad: { type: String },
  estatus: { type: String, default: "Activo" }
});

const User = mongoose.model('User', userSchema);

async function test() {
  try {
    await connectDB();
    console.log('Conectado a MongoDB local');
    
    const users = await User.find({});
    console.log('Usuarios encontrados:', users.length);
    
    if (users.length > 0) {
      console.log('Primer usuario:', users[0].nombre);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
