const express = require("express")
const router = express.Router()
const Report = require("../models/report")
const User = require("../models/user")

router.post("/", async (req, res) => {
  try {
    const { usuarioId, nombreCliente, numeroContrato, mensaje } = req.body
    
    const report = new Report({
      usuarioId,
      nombreCliente,
      numeroContrato,
      mensaje,
      fecha: new Date(),
      estatus: 'pendiente'
    })
    
    await report.save()
    res.json(report)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/", async (req, res) => {
  try {
    // Primero intentar obtener de la coleccion Report
    let reportes = await Report.find().sort({ fecha: -1 });
    
    // Si no hay reportes en la coleccion, buscar en User
    if (reportes.length === 0) {
      const usuarios = await User.find(
        { 'reportes.0': { $exists: true } },
        { numero: 1, nombre: 1, localidad: 1, reportes: 1 }
      );
      
      let reportesUser = [];
      usuarios.forEach(usuario => {
        usuario.reportes.forEach(reporte => {
          reportesUser.push({
            _id: reporte._id,
            usuarioId: usuario._id,
            clienteId: usuario._id,
            clienteNumero: usuario.numero,
            clienteNombre: usuario.nombre,
            clienteLocalidad: usuario.localidad,
            tipo: reporte.tipo,
            mensaje: reporte.mensaje,
            fecha: reporte.fecha,
            estatus: reporte.estatus,
            prioridad: reporte.prioridad,
            tecnicoAsignado: reporte.tecnicoAsignado,
            tecnicoNombre: reporte.tecnicoNombre
          });
        });
      });
      
      return res.json(reportesUser);
    }
    
    res.json(reportes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const reportes = await Report.find({ usuarioId: req.params.usuarioId }).sort({ fecha: -1 })
    res.json(reportes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id/atendido", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        estatus: 'atendido',
        fechaAtencion: new Date()
      },
      { new: true }
    )
    res.json(report)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id/pendiente", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        estatus: 'pendiente',
        fechaAtencion: null
      },
      { new: true }
    )
    res.json(report)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id)
    res.json({ message: "Reporte eliminado" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { estado, tecnicoAsignado, tecnicoNombre, enviadoATecnico, prioridad, notasTecnico, fechaAtencion, mensaje, clienteId } = req.body;
    
    const updateData = {};
    if (estado !== undefined) updateData.estatus = estado;
    if (tecnicoAsignado !== undefined) updateData.tecnicoAsignado = tecnicoAsignado;
    if (tecnicoNombre !== undefined) updateData.tecnicoNombre = tecnicoNombre;
    if (enviadoATecnico !== undefined) updateData.enviadoATecnico = enviadoATecnico;
    if (prioridad !== undefined) updateData.prioridad = prioridad;
    if (notasTecnico !== undefined) updateData.notasTecnico = notasTecnico;
    if (fechaAtencion !== undefined) updateData.fechaAtencion = fechaAtencion;
    if (mensaje !== undefined) updateData.mensaje = mensaje;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (clienteId && tecnicoAsignado) {
      await User.updateOne(
        { _id: clienteId, 'reportes._id': req.params.id },
        { $set: {
          'reportes.$.tecnicoAsignado': tecnicoAsignado,
          'reportes.$.tecnicoNombre': tecnicoNombre,
          'reportes.$.enviadoATecnico': enviadoATecnico
        }}
      );
    }
    
    res.json(report)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id/asignar-tecnico", async (req, res) => {
  try {
    const { tecnicoId, tecnicoNombre, clienteId } = req.body;
    
    // Primero intentar en la coleccion Report
    let reporteEnColeccion = await Report.findById(req.params.id);
    if (reporteEnColeccion) {
      reporteEnColeccion.tecnicoAsignado = tecnicoId;
      reporteEnColeccion.tecnicoNombre = tecnicoNombre;
      reporteEnColeccion.estatus = 'Asignado';
      await reporteEnColeccion.save();
      return res.json({ mensaje: 'Reporte asignado', reporte: reporteEnColeccion });
    }
    
    // Los reportes también pueden estar embebidos en User, buscar y actualizar ahí
    if (clienteId) {
      const usuario = await User.findOneAndUpdate(
        { _id: clienteId, 'reportes._id': req.params.id },
        { $set: {
          'reportes.$.tecnicoAsignado': tecnicoId,
          'reportes.$.tecnicoNombre': tecnicoNombre,
          'reportes.$.estatus': 'Asignado'
        }},
        { new: true }
      );
      
      if (usuario) {
        const reporteActualizado = usuario.reportes.id(req.params.id);
        return res.json({ mensaje: 'Reporte asignado', reporte: reporteActualizado });
      }
    }
    
    // Si no hay clienteId, intentar buscar en todos los usuarios
    const resultado = await User.findOneAndUpdate(
      { 'reportes._id': req.params.id },
      { $set: {
        'reportes.$.tecnicoAsignado': tecnicoId,
        'reportes.$.tecnicoNombre': tecnicoNombre,
        'reportes.$.estatus': 'Asignado'
      }},
      { new: true }
    );
    
    if (resultado) {
      const reporteActualizado = resultado.reportes.id(req.params.id);
      return res.json({ mensaje: 'Reporte asignado', reporte: reporteActualizado });
    }
    
    res.status(404).json({ error: 'Reporte no encontrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.delete("/cleanup/antiguos", async (req, res) => {
  try {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 30)
    
    const result = await Report.deleteMany({
      fecha: { $lt: fechaLimite },
      estatus: 'atendido'
    })
    
    res.json({ message: `Se eliminaron ${result.deletedCount} reportes antiguos` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
