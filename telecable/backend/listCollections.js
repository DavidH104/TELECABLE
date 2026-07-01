const mongoose = require('mongoose');
const { connectDB } = require('./db');

async function listCollections() {
  try {
    await connectDB();
    console.log('Conectado a MongoDB local');
    
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
