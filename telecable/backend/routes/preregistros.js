const express = require('express');
const router = express.Router();
const Preregistro = require('../models/preregistro');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const Report = require('../models/report');

// Crear pre-registro
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    
    if (!nombre || !telefono || !direccion) {
      return res.status(400).json({ error: 'Nombre, teléfono y dirección son requeridos' });
    }

    const preregistro = new Preregistro({
      nombre,
      telefono,
      direccion,
      paquete: 'basico',
      precio: 200
    });

    await preregistro.save();
    res.json({ mensaje: 'Solicitud enviada correctamente', preregistro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los pre-registros (admin)
router.get('/', async (req, res) => {
  try {
    const preregistros = await Preregistro.find().sort({ fechaSolicitud: -1 });
    res.json(preregistros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener pre-registros pendientes
router.get('/pendientes', async (req, res) => {
  try {
    const preregistros = await Preregistro.find({ estado: 'pendiente' }).sort({ fechaSolicitud: -1 });
    res.json(preregistros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aprobar pre-registro y crear usuario
router.post('/:id/aprobar', async (req, res) => {
  try {
    const { observaciones } = req.body;
    
    const preregistro = await Preregistro.findById(req.params.id);
    if (!preregistro) {
      return res.status(404).json({ error: 'Pre-registro no encontrado' });
    }

    // Generar número de contrato aleatorio único
    let numeroContrato;
    let existe = true;
    let intentos = 0;
    
    while (existe && intentos < 100) {
      // Generar número de 8 dígitos
      numeroContrato = Math.floor(10000000 + Math.random() * 90000000).toString();
      existe = await User.findOne({ numero: numeroContrato });
      intentos++;
    }
    
    if (existe) {
      return res.status(400).json({ error: 'No se pudo generar un número de contrato único' });
    }

    // Generar contraseña temporal
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(passwordTemporal, 10);

    // Crear usuario
    const nuevoUsuario = new User({
      numero: numeroContrato,
      nombre: preregistro.nombre,
      telefono: preregistro.telefono,
      direccion: preregistro.direccion,
      password: hashedPassword,
      estatus: 'Activo',
      paquete: preregistro.paquete || 'basico',
      precioPaquete: preregistro.precio || 200,
      solicitudRegistro: {
        tipo: 'preregistro',
        estado: 'aprobado',
        fecha: new Date()
      }
    });

    await nuevoUsuario.save();

    // Crear reporte de instalación para técnico
    const reporteInstalacion = new Report({
      usuarioId: nuevoUsuario._id,
      nombreCliente: nuevoUsuario.nombre,
      numeroContrato: numeroContrato,
      mensaje: `Nueva instalación de servicio Telecable - Paquete: ${preregistro.paquete || 'Básico'}`,
      fecha: new Date(),
      estatus: 'pendiente',
      tipo: 'Instalacion'
    });
    await reporteInstalacion.save();

    // Actualizar pre-registro
    preregistro.estado = 'aprobado';
    preregistro.numeroContrato = numeroContrato;
    preregistro.fechaAprobacion = new Date();
    preregistro.observaciones = observaciones;
    await preregistro.save();

    res.json({ 
      mensaje: 'Pre-registro aprobado y usuario creado', 
      usuario: {
        numero: numeroContrato,
        passwordTemporal
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rechazar pre-registro
router.post('/:id/rechazar', async (req, res) => {
  try {
    const { observaciones } = req.body;
    
    const preregistro = await Preregistro.findById(req.params.id);
    if (!preregistro) {
      return res.status(404).json({ error: 'Pre-registro no encontrado' });
    }

    preregistro.estado = 'rechazado';
    preregistro.fechaAprobacion = new Date();
    preregistro.observaciones = observaciones;
    await preregistro.save();

    res.json({ mensaje: 'Pre-registro rechazado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar pre-registro
router.delete('/:id', async (req, res) => {
  try {
    await Preregistro.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Pre-registro eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
