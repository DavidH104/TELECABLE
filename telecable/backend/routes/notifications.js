const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");

router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const notificaciones = await Notification.find({ 
      usuarioDestinoId: req.params.usuarioId 
    }).sort({ fecha: -1 }).limit(50);
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin", async (req, res) => {
  try {
    const notificaciones = await Notification.find({ 
      esParaAdmin: true 
    }).sort({ fecha: -1 }).limit(50);
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin/no-leidas", async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      esParaAdmin: true,
      leida: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/usuario/:usuarioId/no-leidas", async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      usuarioDestinoId: req.params.usuarioId,
      leida: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/leida", async (req, res) => {
  try {
    const notificacion = await Notification.findByIdAndUpdate(
      req.params.id,
      { leida: true },
      { new: true }
    );
    res.json(notificacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/admin/leer-todas", async (req, res) => {
  try {
    await Notification.updateMany(
      { esParaAdmin: true, leida: false },
      { leida: true }
    );
    res.json({ message: "Notificaciones marcadas como ledas" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/usuario/:usuarioId/leer-todas", async (req, res) => {
  try {
    await Notification.updateMany(
      { usuarioDestinoId: req.params.usuarioId, leida: false },
      { leida: true }
    );
    res.json({ message: "Notificaciones marcadas como ledas" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notificacin eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


