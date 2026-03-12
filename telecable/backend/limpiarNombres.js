const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/telecable';

async function limpiarNombres() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    const db = mongoose.connection.db;
    const collection = db.collection('clientes');

    // Obtener todos los clientes
    const clientes = await collection.find({}).toArray();

    let contador = 0;
    for (const cliente of clientes) {
      let nombreOriginal = cliente['NOMBRE DEL SUSCRIPTOR'] || '';
      
      // Limpiar el nombre: quitar *, números, $, (, ), palabras como "paga", "y", etc.
      let nombreLimpio = nombreOriginal
        .replace(/\*/g, '')           // Quitar *
        .replace(/\s+\d+\s*$/g, '')   // Quitar números al final como " 1", " 2"
        .replace(/\$\d+/g, '')        // Quitar $320, $100, etc.
        .replace(/\s*\(\d+\)\s*/g, '') // Quitar (180), (160), etc.
        .replace(/\s+y\s+\d+\s*/g, ' ') // Quitar " y 2", " y 3"
        .replace(/\s+paga\s+\d+/gi, '') // Quitar "paga 100", "paga 240"
        .replace(/\s+y\s*\$\d+/g, '')   // Quitar " y $320"
        .replace(/\s+/g, ' ')           // Espacios múltiples a uno solo
        .trim();

      if (nombreLimpio !== nombreOriginal) {
        await collection.updateOne(
          { _id: cliente._id },
          { $set: { 'NOMBRE DEL SUSCRIPTOR': nombreLimpio } }
        );
        console.log(`✓ "${nombreOriginal}" → "${nombreLimpio}"`);
        contador++;
      }
    }

    console.log(`\n=== SE LIMPIARON ${contador} NOMBRES ===\n`);

    // Mostrar ejemplos
    const ejemplos = await collection.find({}).limit(5).toArray();
    console.log('Ejemplos:');
    ejemplos.forEach(c => {
      console.log(`  ${c.numero} | ${c['NOMBRE DEL SUSCRIPTOR']}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

limpiarNombres();
