const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json()); // NECESARIO PARA LEER BODY

mongoose.connect('mongodb://127.0.0.1:27017/telecable');

mongoose.connection.on('connected',()=>{
console.log("Mongo conectado");
});

const usersRoutes = require('./routes/users');

app.use('/api/users',usersRoutes);

app.listen(3000,()=>{
console.log("Servidor corriendo puerto 3000");
});