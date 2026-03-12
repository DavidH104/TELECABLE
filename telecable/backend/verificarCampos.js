const mongoose = require('mongoose');

// Conexión a MongoDB
const dbURI = 'mongodb://localhost:27017/telecable';

async function verificarCampos() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    const db = mongoose.connection.db;
    const collection = db.collection('clientes');

    // Ver un documento de ejemplo
    const ejemplo = await collection.findOne({});
    
    if (ejemplo) {
      console.log('=== CAMPOS EN LA BASE DE DATOS ===\n');
      console.log(JSON.stringify(ejemplo, null, 2));
    } else {
      console.log('No hay documentos en la colección');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
    process.exit(0);
  }
}

verificarCampos();
