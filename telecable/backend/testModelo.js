const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/telecable';
const User = require('./models/user');

async function test() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    // Probar getting users
    const users = await User.find({}).limit(3);
    
    console.log('=== DATOS RECIBIDOS ===\n');
    users.forEach(u => {
      const json = u.toJSON();
      console.log(`Número: ${json.numero}`);
      console.log(`Nombre: ${json.nombre}`);
      console.log(`Localidad: ${json.localidad}`);
      console.log(`Estatus: ${json.estatus}`);
      console.log(`Deuda: ${json.deuda}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();
