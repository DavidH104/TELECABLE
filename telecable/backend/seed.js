const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://telecable:TelecableSanbartolo2026@cluster0.qyxpbok.mongodb.net/telecableDB?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  telefono: { type: String },
  localidad: { type: String },
  direccion: { type: String },
  estatus: { type: String, default: "Activo" },
  deuda: { type: Number, default: 0 },
  paquete: { type: String, default: 'basico' },
  precioPaquete: { type: Number, default: 200 },
  fechaInstalacion: { type: Date },
  recibos: [{
    fecha: String,
    monto: Number
  }],
  historialPagos: [{
    mes: Number,
    año: Number,
    monto: Number,
    fechaPago: Date,
    status: { type: String, default: 'pendiente' }
  }],
  reportes: [{
    tipo: { type: String, default: 'Falla' },
    mensaje: String,
    fecha: { type: Date, default: Date.now },
    estatus: { type: String, default: 'Pendiente' }
  }]
});

const User = mongoose.model('User', userSchema, 'clientes');

const users = [
  {
    numero: "1001",
    nombre: "Juan Pérez García",
    telefono: "6181234567",
    localidad: "Centro",
    direccion: "Av. Principal #123",
    estatus: "Activo",
    deuda: 0,
    paquete: "basico",
    precioPaquete: 200,
    fechaInstalacion: new Date("2024-01-10"),
    recibos: [
      { fecha: "2024-01-15", monto: 200 },
      { fecha: "2024-02-15", monto: 200 }
    ],
    historialPagos: [
      { mes: 1, año: 2024, monto: 200, fechaPago: new Date("2024-01-15"), status: 'pagado' },
      { mes: 2, año: 2024, monto: 200, fechaPago: new Date("2024-02-15"), status: 'pagado' }
    ],
    reportes: []
  },
  {
    numero: "1002",
    nombre: "María López Hernández",
    telefono: "6182345678",
    localidad: "Norte",
    direccion: "Calle Norte #456",
    estatus: "Activo",
    deuda: 200,
    paquete: "estandar",
    precioPaquete: 280,
    fechaInstalacion: new Date("2024-01-20"),
    recibos: [
      { fecha: "2024-01-20", monto: 280 }
    ],
    historialPagos: [
      { mes: 1, año: 2024, monto: 280, fechaPago: new Date("2024-01-20"), status: 'pagado' }
    ],
    reportes: []
  },
  {
    numero: "1003",
    nombre: "Carlos Ramírez Soto",
    telefono: "6183456789",
    localidad: "Sur",
    direccion: "Blvd. Sur #789",
    estatus: "Suspendido",
    deuda: 600,
    paquete: "premium",
    precioPaquete: 350,
    fechaInstalacion: new Date("2023-06-15"),
    recibos: [],
    historialPagos: [],
    reportes: [
      { tipo: "Falla", mensaje: "Sin señal desde hace 3 días", fecha: new Date("2024-02-10"), estatus: "Pendiente" }
    ]
  },
  {
    numero: "1004",
    nombre: "Ana Martínez Flores",
    telefono: "6184567890",
    localidad: "Centro",
    direccion: "Calle Centro #321",
    estatus: "Activo",
    deuda: 0,
    paquete: "basico",
    precioPaquete: 200,
    fechaInstalacion: new Date("2023-11-05"),
    recibos: [
      { fecha: "2024-01-10", monto: 200 },
      { fecha: "2024-02-10", monto: 200 }
    ],
    historialPagos: [
      { mes: 1, año: 2024, monto: 200, fechaPago: new Date("2024-01-10"), status: 'pagado' },
      { mes: 2, año: 2024, monto: 200, fechaPago: new Date("2024-02-10"), status: 'pagado' }
    ],
    reportes: []
  },
  {
    numero: "1005",
    nombre: "Roberto Díaz Mendoza",
    telefono: "6185678901",
    localidad: "Este",
    direccion: "Av. Este #654",
    estatus: "Inactivo",
    deuda: 1200,
    paquete: "estandar",
    precioPaquete: 280,
    fechaInstalacion: new Date("2023-08-20"),
    recibos: [],
    historialPagos: [],
    reportes: []
  }
];

async function seed() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB Atlas...');

    // Verificar si ya hay usuarios
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`Ya existen ${count} usuarios en la base de datos.`);
      console.log('No se agregaron usuarios de ejemplo.');
    } else {
      // Solo insertar si no hay usuarios
      await User.insertMany(users);
      console.log('5 usuarios de ejemplo insertados correctamente');
    }

    console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
    const todosUsuarios = await User.find({});
    todosUsuarios.forEach(u => {
      console.log(`Contrato: ${u.numero} - ${u.nombre} (${u.estatus})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
    process.exit(0);
  }
}

seed();
