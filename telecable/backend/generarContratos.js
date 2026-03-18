const mongoose = require('mongoose');

const dbURI = 'mongodb://localhost:27017/telecable';

async function generarContratos() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    const db = mongoose.connection.db;
    const collection = db.collection('clientes');

    const total = await collection.countDocuments({});
    console.log(`Total de clientes: ${total}\n`);

    const clientes = await collection.find({}).toArray();

    let contador = 0;
    for (const cliente of clientes) {
      let nuevoNumero;
      
      const nombre = cliente['NOMBRE DEL SUSCRIPTOR'] || '';
      
      if (nombre) {
        const primeraLetra = nombre.trim().charAt(0).toUpperCase();
        const numeroLetra = primeraLetra.charCodeAt(0) - 64;
        const anio = '26';
        const aleatorio = Math.floor(10000 + Math.random() * 90000);
        nuevoNumero = `${numeroLetra}${anio}${aleatorio}`;
      } else {
        nuevoNumero = `${cliente.NUMERO}`;
      }

      await collection.updateOne(
        { _id: cliente._id },
        { $set: { numero: nuevoNumero } }
      );

      console.log(`✓ ${nombre || 'Sin nombre'} → ${nuevoNumero}`);
      contador++;
    }

    console.log(`\n=== SE ACTUALIZARON ${contador} CLIENTES ===\n`);

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
