const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://telecable:TelecableSanbartolo2026@cluster0.qyxpbok.mongodb.net/telecableDB?retryWrites=true&w=majority';

async function listCollections() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB Atlas');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n=== COLECCIONES EN LA BASE DE DATOS ===');
    collections.forEach(c => {
      console.log('- ' + c.name);
    });
    
    // Ver contents de cada colección
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  -> ${c.name}: ${count} documentos`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listCollections();
