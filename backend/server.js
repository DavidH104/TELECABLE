const express = require("express");
const cors = require("cors");

require("./config/db"); // conexión a MongoDB

const clientesRoutes = require("./routes/clientes");

const app = express();

app.use(cors());
app.use(express.json());

// rutas
app.use("/api/clientes", clientesRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});