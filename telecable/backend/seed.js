const mongoose = require('mongoose');

// Conexión a MongoDB
const dbURI = 'mongodb://localhost:27017/telecable';

// Definir esquema de usuario
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  contrato: { type: Number, required: true, unique: true },
  localidad: { type: String, required: true },
  estatus: { type: String, default: "Activo" },
  deuda: { type: Number, default: 0 },
  recibos: [{
    fecha: String,
    monto: Number
  }],
  reportes: [{
    mensaje: String,
    fecha: String
  }]
});

const User = mongoose.model('User', userSchema);

// Datos de ejemplo
const users = [
  {
    nombre: "Juan Pérez García",
    contrato: 1001,
    localidad: "Centro",
    estatus: "Activo",
    deuda: 0,
    recibos: [
      { fecha: "2024-01-15", monto: 250 },
      { fecha: "2024-02-15", monto: 250 }
    ],
    reportes: []
  },
  {
    nombre: "María López Hernández",
    contrato: 1002,
    localidad: "Norte",
    estatus: "Activo",
    deuda: 150,
    recibos: [
      { fecha: "2024-01-20", monto: 300 }
    ],
    reportes: []
  },
  {
    nombre: "Carlos Ramírez Soto",
    contrato: 1003,
    localidad: "Sur",
    estatus: "Suspendido",
    deuda: 600,
    recibos: [],
    reportes: [
      { mensaje: "Sin señal desde hace 3 días", fecha: "2024-02-10" }
    ]
  },
  {
    nombre: "Ana Martínez Flores",
    contrato: 1004,
    localidad: "Centro",
    estatus: "Activo",
    deuda: 0,
    recibos: [
      { fecha: "2024-01-10", monto: 280 },
      { fecha: "2024-02-10", monto: 280 }
    ],
    reportes: []
  },
  {
    nombre: "Roberto Díaz Mendoza",
    contrato: 1005,
    localidad: "Este",
    estatus: "Inactivo",
    deuda: 1200,
    recibos: [],
    reportes: []
  }
];

async function seed() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...');

    // Verificar si ya hay usuarios
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`Ya existen ${count} usuarios en la base de datos.`);
      console.log('No se agregaron usuarios de ejemplo.');
    } else {
      // Solo insertar si no hay usuarios
      await User.insertMany(users);
      console.log('Usuarios de ejemplo insertados correctamente');
    }

    console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
    const todosUsuarios = await User.find({});
    todosUsuarios.forEach(u => {
      console.log(`Contrato: ${u.contrato} - ${u.nombre} (${u.estatus})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
    process.exit(0);
  }
}

seed();
