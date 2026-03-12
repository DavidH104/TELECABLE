const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/telecable';
const User = require('./models/user');

async function testLogin(contrato) {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    // Buscar por numero (String)
    const user = await User.findOne({ numero: contrato });
    
    if (user) {
      console.log('✓ Usuario encontrado:');
      console.log(user.toJSON());
    } else {
      console.log('✗ Usuario no encontrado');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Usar el primer argumento como número de contrato
const contrato = process.argv[2] || '162623773';
testLogin(contrato);
