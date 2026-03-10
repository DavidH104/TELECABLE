const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema({
  NUM: Number,
  "LOS REYES": Number,
  "NOMBRE DEL SUSCRIPTOR": String
});

module.exports = mongoose.model("Cliente", ClienteSchema, "clientes");