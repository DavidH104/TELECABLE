const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://telecable:TelecableSanbartolo2026@cluster0.qyxpbok.mongodb.net/telecableDB?retryWrites=true&w=majority';

async function checkAll() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a la base de datos: telecableDB\n');
    
    const db = mongoose.connection.db;
    
    // Listar todas las bases de datos en el cluster
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('=== BASES DE DATOS EN EL CLUSTER ===');
    dbs.databases.forEach(database => {
      console.log('- ' + database.name + ' (' + database.sizeOnDisk / 1024 / 1024 + ' MB)');
    });
    
    // Ver colecciones en telecableDB
    console.log('\n=== COLECCIONES EN telecableDB ===');
    const collections = await db.listCollections().toArray();
    collections.forEach(c => {
      console.log('- ' + c.name);
    });
    
    // Contar documentos en cada colección
    console.log('\n=== CANTIDAD DE DOCUMENTOS ===');
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documentos`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAll();
