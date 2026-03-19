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
    const reportes = await Report.find().sort({ fecha: -1 })
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
    const { tecnicoId, tecnicoNombre, clienteId } = req.body
    
    const updateData = {
      tecnicoAsignado: tecnicoId,
      tecnicoNombre: tecnicoNombre,
      estatus: 'asignado',
      enviadoATecnico: true
    };
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (clienteId) {
      await User.updateOne(
        { _id: clienteId, 'reportes._id': req.params.id },
        { $set: {
          'reportes.$.tecnicoAsignado': tecnicoId,
          'reportes.$.tecnicoNombre': tecnicoNombre,
          'reportes.$.estatus': 'Asignado'
        }}
      );
    }
    
    res.json(report)
  } catch (error) {
    res.status(500).json({ error: error.message })
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
