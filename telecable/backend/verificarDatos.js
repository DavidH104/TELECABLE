const mongoose = require('mongoose');

// Conexión a MongoDB
const dbURI = 'mongodb://localhost:27017/telecable';

// Definir esquema de usuario
const userSchema = new mongoose.Schema({
  numero: { type: String },
  nombre: { type: String },
  localidad: { type: String },
  estatus: { type: String },
  deuda: { type: Number }
}, { collection: 'clientes' });

const User = mongoose.model('User', userSchema);

async function verificarDatos() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    // Contar documentos
    const total = await User.countDocuments({});
    console.log(`Total de documentos: ${total}\n`);

    // Verificar si hay documentos con numero definido
    const conNumero = await User.find({ numero: { $exists: true, $ne: null, $ne: "" } });
    console.log(`Documentos con número: ${conNumero.length}\n`);

    // Mostrar los que tienen numero
    if (conNumero.length > 0) {
      console.log('=== CLIENTES CON NÚMERO ===\n');
      conNumero.forEach(u => {
        console.log(`  ${u.numero} | ${u.nombre} | ${u.localidad} | ${u.estatus} | Deuda: $${u.deuda}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
    process.exit(0);
  }
}

verificarDatos();
