const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");

router.get("/", async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;