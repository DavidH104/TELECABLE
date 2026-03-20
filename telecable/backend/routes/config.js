const express = require('express');
const router = express.Router();
const Config = require('../models/config');
const User = require('../models/user');

async function getOrCreateConfig() {
  let config = await Config.findOne({ clave: 'system' });
  if (!config) {
    config = new Config({
      clave: 'system',
      paquetes: [
        { nombre: 'Básico', clave: 'basico', precio: 200, velocidad: '20 Mbps', canales: 55, descripcion: 'Ideal para el hogar' },
        { nombre: 'Estándar', clave: 'estandar', precio: 299, velocidad: '50 Mbps', canales: 120, descripcion: 'Perfecto para toda la familia' },
        { nombre: 'Premium', clave: 'premium', precio: 449, velocidad: '100 Mbps', canales: 180, descripcion: 'La mejor experiencia' }
      ],
      canales: [
        { nombre: 'Canal 2', numero: 2, categoria: 'Nacional', imagen: '' },
        { nombre: 'Canal 4', numero: 4, categoria: 'Nacional', imagen: '' },
        { nombre: 'Canal 5', numero: 5, categoria: 'Nacional', imagen: '' },
        { nombre: 'Canal 7', numero: 7, categoria: 'Nacional', imagen: '' },
        { nombre: 'Canal 9', numero: 9, categoria: 'Nacional', imagen: '' },
        { nombre: 'Canal 11', numero: 11, categoria: 'Nacional', imagen: '' },
        { nombre: 'Canal 13', numero: 13, categoria: 'Nacional', imagen: '' }
      ],
      promociones: [],
      precioDefault: 200
    });
    await config.save();
  }
  return config;
}

router.get('/', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const config = await Config.findOneAndUpdate(
      { clave: 'system' },
      req.body,
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/paquete/:clave', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    const { precio, nombre, velocidad, canales, descripcion } = req.body;
    
    const paqueteIndex = config.paquetes.findIndex(p => p.clave === req.params.clave);
    if (paqueteIndex >= 0) {
      config.paquetes[paqueteIndex] = { ...config.paquetes[paqueteIndex], ...req.body };
    } else {
      config.paquetes.push({ nombre, clave: req.params.clave, precio, velocidad, canales, descripcion });
    }
    
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/promociones', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    const { titulo, descripcion, descuento, precioEspecial, validoHasta } = req.body;
    
    config.promociones.push({
      titulo,
      descripcion,
      descuento,
      precioEspecial,
      validoHasta: validoHasta ? new Date(validoHasta) : null,
      activo: true
    });
    
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/promociones/:id', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    const promo = config.promociones.id(req.params.id);
    if (promo) {
      Object.assign(promo, req.body);
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/promociones/:id', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    config.promociones.pull({ _id: req.params.id });
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mensajes-globales', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    const { titulo, mensaje } = req.body;
    
    config.mensajesGlobales.push({
      titulo,
      mensaje,
      activo: true
    });
    
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/mensajes-globales/:id', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    config.mensajesGlobales.pull({ _id: req.params.id });
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/precios', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({
      paquetes: config.paquetes,
      promociones: config.promociones.filter(p => p.activo),
      precioDefault: config.precioDefault,
      infoPaquete: config.infoPaquete
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/canales', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config.canales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mensajes', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config.mensajesGlobales.filter(m => m.activo));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mensaje-usuario/:userId', async (req, res) => {
  try {
    const { titulo, mensaje } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    user.mensajesAdmin.push({
      titulo,
      mensaje,
      activo: true
    });
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mensajes-usuario/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user.mensajesAdmin || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
