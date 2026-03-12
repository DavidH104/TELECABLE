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

async function actualizarLocalidad() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...\n');

    // Actualizar las localidades
    const actualizaciones = [
      { numero: '10267825', nombre: 'Juan Pérez García', localidad: 'Centro' },
      { numero: '13267619', nombre: 'María López Hernández', localidad: 'Norte' },
      { numero: '3267733', nombre: 'Carlos Ramírez Soto', localidad: 'Sur' },
      { numero: '1261377', nombre: 'Ana Martínez Flores', localidad: 'Centro' },
      { numero: '18267037', nombre: 'Roberto Díaz Mendoza', localidad: 'Este' }
    ];

    for (const act of actualizaciones) {
      await User.updateOne(
        { numero: act.numero },
        { $set: { localidad: act.localidad } }
      );
      console.log(`✓ ${act.nombre} → Localidad: ${act.localidad}`);
    }

    console.log('\n=== CLIENTES ACTUALIZADOS ===\n');
    const todos = await User.find({});
    todos.forEach(u => {
      console.log(`  ${u.numero} | ${u.nombre} | ${u.localidad} | ${u.estatus} | Deuda: $${u.deuda}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
    process.exit(0);
  }
}

actualizarLocalidad();
