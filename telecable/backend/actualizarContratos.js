const mongoose = require('mongoose');

// Conexión a MongoDB
const dbURI = 'mongodb://localhost:27017/telecable';

// Definir esquema de usuario
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  numero: { type: String, required: true, unique: true },
  localidad: { type: String },
  estatus: { type: String, default: "Activo" },
  deuda: { type: Number, default: 0 },
  correo: { type: String },
  telefono: { type: String },
  paquete: { type: String },
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

// Función para convertir letra a número (a=1, b=2, ..., z=26)
function letraANumero(letra) {
  const letraLower = letra.toLowerCase();
  return letraLower.charCodeAt(0) - 96;
}

// Función para generar número de contrato único
function generarNumeroContrato(nombre) {
  // Obtener primera letra del nombre
  const primeraLetra = nombre.trim().charAt(0).toUpperCase();
  const numeroLetra = letraANumero(primeraLetra);
  
  // Año actual (26 = 2026)
  const anio = '26';
  
  // Generar números aleatorios (4 dígitos)
  const aleatorio = Math.floor(1000 + Math.random() * 9000);
  
  // Combinar: numeroLetra + anio + aleatorio
  // Ejemplo: J (10) + 26 + 1234 = 10261234
  return `${numeroLetra}${anio}${aleatorio}`;
}

async function actualizarContratos() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...');

    // Obtener todos los usuarios
    const usuarios = await User.find({});
    
    console.log(`\n=== ACTUALIZANDO ${usuarios.length} CONTRATOS ===\n`);

    for (const usuario of usuarios) {
      // Verificar si ya tiene número de contrato con el nuevo formato
      // El nuevo formato tiene 7 dígitos (ejemplo: 10261234)
      if (usuario.numero && usuario.numero.length >= 7) {
        console.log(`Usuario ${usuario.nombre} ya tiene contrato: ${usuario.numero}`);
        continue;
      }

      // Generar nuevo número de contrato
      let nuevoNumero = generarNumeroContrato(usuario.nombre);
      
      // Verificar que no exista (por si hay duplicados)
      let existente = await User.findOne({ numero: nuevoNumero });
      let intentos = 0;
      while (existente && intentos < 10) {
        nuevoNumero = generarNumeroContrato(usuario.nombre + Math.random());
        existente = await User.findOne({ numero: nuevoNumero });
        intentos++;
      }

      // Actualizar el usuario
      await User.updateOne(
        { _id: usuario._id },
        { $set: { numero: nuevoNumero } }
      );

      console.log(`✓ ${usuario.nombre} → Contrato: ${nuevoNumero}`);
    }

    console.log('\n=== CONTRACTOS ACTUALIZADOS ===');
    const todosActualizados = await User.find({});
    console.log('\nLista final de clientes:');
    todosActualizados.forEach(u => {
      console.log(`  ${u.numero} | ${u.nombre} | ${u.localidad || 'N/A'} | ${u.estatus} | Deuda: $${u.deuda}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
    process.exit(0);
  }
}

actualizarContratos();
