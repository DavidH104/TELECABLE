const mongoose = require('mongoose');

const dbURI = 'mongodb://localhost:27017/telecable';

// Schema para Config
const precioPaqueteSchema = new mongoose.Schema({
  nombre: String,
  clave: { type: String, unique: true },
  precio: Number,
  velocidad: String,
  canales: Number,
  descripcion: String,
  activo: { type: Boolean, default: true }
});

const configSchema = new mongoose.Schema({
  clave: { type: String, unique: true, default: 'system' },
  paquetes: [precioPaqueteSchema],
  precioDefault: { type: Number, default: 200 }
}, {
  collection: 'configuracion'
});

const Config = mongoose.model('Config', configSchema);

async function actualizarPaquete() {
  try {
    await mongoose.connect(dbURI);
    console.log('Conectado a MongoDB...');

    // Buscar o crear configuración
    let config = await Config.findOne({ clave: 'system' });
    
    if (!config) {
      config = new Config({ clave: 'system', paquetes: [] });
    }

    // Establecer solo un paquete: 200 pesos, 55 canales
    config.paquetes = [{
      nombre: 'Paquete Básico',
      clave: 'basico',
      precio: 200,
      velocidad: '',
      canales: 55,
      descripcion: '55 canales',
      activo: true
    }];
    
    config.precioDefault = 200;

    await config.save();
    console.log('Paquete actualizado correctamente');
    console.log('Paquete: 200 pesos - 55 canales');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
    process.exit(0);
  }
}

actualizarPaquete();
