const express = require("express")
const router = express.Router()
const Report = require("../models/report")

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
