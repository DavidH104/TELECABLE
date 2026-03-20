const express = require('express');
const router = express.Router();
const Technician = require('../models/technician');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Login de técnico
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const tecnico = await Technician.findOne({ username, activo: true });
    
    if (!tecnico) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }
    
    const passwordValido = await bcrypt.compare(password, tecnico.password);
    
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }
    
    res.json({
      mensaje: 'Login exitoso',
      tecnico: {
        id: tecnico._id,
        username: tecnico.username,
        nombre: tecnico.nombre,
        especialidad: tecnico.especialidad
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

// Obtener todos los técnicos
router.get('/', async (req, res) => {
  try {
    const tecnicos = await Technician.find().sort({ nombre: 1 });
    res.json(tecnicos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener técnicos', error: error.message });
  }
});

// Obtener técnico por ID
router.get('/:id', async (req, res) => {
  try {
    const tecnico = await Technician.findById(req.params.id);
    if (!tecnico) {
      return res.status(404).json({ mensaje: 'Técnico no encontrado' });
    }
    res.json(tecnico);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener técnico', error: error.message });
  }
});

// Crear técnico
router.post('/', async (req, res) => {
  try {
    const { username, password, nombre, telefono, email, especialidad } = req.body;
    
    // Verificar si el username ya existe
    const existente = await Technician.findOne({ username });
    if (existente) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya existe' });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);
    
    const nuevoTecnico = new Technician({
      username,
      password: passwordEncriptada,
      nombre,
      telefono,
      email,
      especialidad: especialidad || 'Todas'
    });
    
    await nuevoTecnico.save();
    
    res.status(201).json({
      mensaje: 'Técnico creado exitosamente',
      tecnico: {
        id: nuevoTecnico._id,
        username: nuevoTecnico.username,
        nombre: nuevoTecnico.nombre
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear técnico', error: error.message });
  }
});

// Actualizar técnico
router.put('/:id', async (req, res) => {
  try {
    const { username, password, nombre, telefono, email, especialidad, activo } = req.body;
    
    // Si se proporciona una nueva contraseña, encriptarla
    let passwordEncriptada;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordEncriptada = await bcrypt.hash(password, salt);
    }
    
    // Construir objeto de actualización
    const datosActualizar = { nombre, telefono, email, especialidad, activo };
    
    // Agregar username si se proporciona
    if (username) {
      // Verificar si el username ya existe en otro técnico
      const existente = await Technician.findOne({ username, _id: { $ne: req.params.id } });
      if (existente) {
        return res.status(400).json({ mensaje: 'El nombre de usuario ya existe' });
      }
      datosActualizar.username = username;
    }
    
    // Agregar password encriptada si se proporciona
    if (passwordEncriptada) {
      datosActualizar.password = passwordEncriptada;
    }
    
    const tecnico = await Technician.findByIdAndUpdate(
      req.params.id,
      datosActualizar,
      { new: true }
    );
    
    if (!tecnico) {
      return res.status(404).json({ mensaje: 'Técnico no encontrado' });
    }
    
    res.json({ mensaje: 'Técnico actualizado', tecnico });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar técnico', error: error.message });
  }
});

// Eliminar técnico
router.delete('/:id', async (req, res) => {
  try {
    const tecnico = await Technician.findByIdAndDelete(req.params.id);
    
    if (!tecnico) {
      return res.status(404).json({ mensaje: 'Técnico no encontrado' });
    }
    
    res.json({ mensaje: 'Técnico eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar técnico', error: error.message });
  }
});

// Obtener todos los reportes pendientes
router.get('/reportes/todos', async (req, res) => {
  try {
    const reportes = await User.find(
      { 'reportes.0': { $exists: true } },
      { numero: 1, nombre: 1, localidad: 1, reportes: 1 }
    ).sort({ 'reportes.fecha': -1 });
    
    // Transformar para obtener todos los reportes en un solo array
    let todosReportes = [];
    reportes.forEach(cliente => {
      cliente.reportes.forEach(reporte => {
        todosReportes.push({
          ...reporte.toObject(),
          clienteId: cliente._id,
          clienteNumero: cliente.numero,
          clienteNombre: cliente.nombre,
          clienteLocalidad: cliente.localidad
        });
      });
    });
    
    // Ordenar por fecha descendente
    todosReportes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    res.json(todosReportes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reportes', error: error.message });
  }
});

// Obtener reportes asignados al técnico
router.get('/reportes/asignados/:tecnicoId', async (req, res) => {
  try {
    const { tecnicoId } = req.params;
    
    const reportes = await User.find(
      { 'reportes.tecnicoAsignado': tecnicoId },
      { numero: 1, nombre: 1, localidad: 1, reportes: 1 }
    );
    
    let misReportes = [];
    reportes.forEach(cliente => {
      cliente.reportes.forEach(reporte => {
        if (reporte.tecnicoAsignado && reporte.tecnicoAsignado.toString() === tecnicoId) {
          misReportes.push({
            ...reporte.toObject(),
            clienteId: cliente._id,
            clienteNumero: cliente.numero,
            clienteNombre: cliente.nombre,
            clienteLocalidad: cliente.localidad
          });
        }
      });
    });
    
    res.json(misReportes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reportes', error: error.message });
  }
});

// Actualizar estado de un reporte
router.put('/reportes/:clienteId/:reporteId', async (req, res) => {
  try {
    const { clienteId, reporteId } = req.params;
    const { estatus, prioridad, notasTecnico, tecnicoAsignado, tecnicoNombre } = req.body;
    
    const update = {};
    if (estatus) update['reportes.$.estatus'] = estatus;
    if (prioridad) update['reportes.$.prioridad'] = prioridad;
    if (notasTecnico) update['reportes.$.notasTecnico'] = notasTecnico;
    if (tecnicoAsignado) {
      update['reportes.$.tecnicoAsignado'] = tecnicoAsignado;
      update['reportes.$.tecnicoNombre'] = tecnicoNombre;
    }
    if (estatus === 'Completado') {
      update['reportes.$.fechaCompletado'] = new Date();
    }
    
    const usuario = await User.findOneAndUpdate(
      { _id: clienteId, 'reportes._id': reporteId },
      { $set: update },
      { new: true }
    );
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Reporte no encontrado' });
    }
    
    const reporte = usuario.reportes.id(reporteId);
    res.json({ mensaje: 'Reporte actualizado', reporte });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar reporte', error: error.message });
  }
});

// Asignar técnico a un reporte
router.put('/reportes/asignar/:clienteId/:reporteId', async (req, res) => {
  try {
    const { clienteId, reporteId } = req.params;
    const { tecnicoId, tecnicoNombre } = req.body;
    
    const usuario = await User.findOneAndUpdate(
      { _id: clienteId, 'reportes._id': reporteId },
      { 
        $set: {
          'reportes.$.tecnicoAsignado': tecnicoId,
          'reportes.$.tecnicoNombre': tecnicoNombre,
          'reportes.$.estatus': 'Asignado'
        }
      },
      { new: true }
    );
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Reporte no encontrado' });
    }
    
    res.json({ mensaje: 'Técnico asignado al reporte' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar técnico', error: error.message });
  }
});

module.exports = router;
