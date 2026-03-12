const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/telecable';

async function eliminarDuplicados() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    const db = mongoose.connection.db;
    const collection = db.collection('clientes');

    // Encontrar duplicados por número de contrato
    const duplicados = await collection.aggregate([
      { $group: { _id: "$numero", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log(`Se encontraron ${duplicados.length} números de contrato duplicados\n`);

    for (const dup of duplicados) {
      console.log(`Duplicado: ${dup._id} - ${dup.count} veces`);
      
      // Eliminar todos menos el primero
      const idsAEliminar = dup.ids.slice(1);
      await collection.deleteMany({ _id: { $in: idsAEliminar } });
      console.log(`  ✓ Eliminados ${idsAEliminar.length} duplicados`);
    }

    // Verificar que no haya duplicados de nombres
    const duplicadosNombres = await collection.aggregate([
      { $group: { _id: "$NOMBRE DEL SUSCRIPTOR", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: "" } } }
    ]).toArray();

    console.log(`\nSe encontraron ${duplicadosNombres.length} nombres duplicados\n`);

    for (const dup of duplicadosNombres) {
      console.log(`Duplicado: ${dup._id} - ${dup.count} veces`);
      
      // Eliminar todos menos el primero
      const idsAEliminar = dup.ids.slice(1);
      await collection.deleteMany({ _id: { $in: idsAEliminar } });
      console.log(`  ✓ Eliminados ${idsAEliminar.length} duplicados`);
    }

    // Contar total después de limpiar
    const total = await collection.countDocuments({});
    console.log(`\n=== Total de clientes después de limpiar: ${total} ===`);

    // Mostrar ejemplos
    const ejemplos = await collection.find({}).limit(5).toArray();
    console.log('\nEjemplos:');
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

eliminarDuplicados();
