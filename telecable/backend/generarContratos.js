const mongoose = require('mongoose');

// Conexión a MongoDB
const dbURI = 'mongodb://localhost:27017/telecable';

async function generarContratos() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    const db = mongoose.connection.db;
    const collection = db.collection('clientes');

    // Contar documentos
    const total = await collection.countDocuments({});
    console.log(`Total de clientes: ${total}\n`);

    // Obtener todos los clientes
    const clientes = await collection.find({}).toArray();

    let contador = 0;
    for (const cliente of clientes) {
      // Si ya tiene numero, generamos uno nuevo único
      let nuevoNumero;
      
      // Obtener el nombre del suscriptor
      const nombre = cliente['NOMBRE DEL SUSCRIPTOR'] || '';
      
      if (nombre) {
        // Generar número basado en primera letra del nombre
        const primeraLetra = nombre.trim().charAt(0).toUpperCase();
        const numeroLetra = primeraLetra.charCodeAt(0) - 64; // A=1, B=2, etc.
        const anio = '26';
        const aleatorio = Math.floor(10000 + Math.random() * 90000); // 5 dígitos
        nuevoNumero = `${numeroLetra}${anio}${aleatorio}`;
      } else {
        // Si no tiene nombre, usar número secuencial
        nuevoNumero = `${cliente.NUMERO}`;
      }

      // Actualizar el documento
      await collection.updateOne(
        { _id: cliente._id },
        { $set: { numero: nuevoNumero } }
      );

      console.log(`✓ ${nombre || 'Sin nombre'} → ${nuevoNumero}`);
      contador++;
    }

    console.log(`\n=== SE ACTUALIZARON ${contador} CLIENTES ===\n`);

    // Mostrar algunos ejemplos
    const ejemplos = await collection.find({}).limit(5).toArray();
    console.log('Ejemplos:');
    ejemplos.forEach(c => {
      console.log(`  ${c.numero} | ${c['NOMBRE DEL SUSCRIPTOR']} | ${c.LOCALIDAD} | ${c.estatus} | Deuda: $${c.deuda}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
    process.exit(0);
  }
}

generarContratos();
