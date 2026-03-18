const express = require("express")
const router = express.Router()
const User = require("../models/user")

router.get("/",async(req,res)=>{

const users = await User.find()
res.json(users)

})

router.post("/",async(req,res)=>{

  const { numero, nombre, telefono } = req.body;

  // Verificar si el número de contrato ya existe
  const existeNumero = await User.findOne({ numero: numero });
  if (existeNumero) {
    return res.status(400).json({ error: "El número de contrato ya existe" });
  }

  // Verificar si el nombre ya existe
  if (nombre) {
    const existeNombre = await User.findOne({ 
      nombre: { $regex: new RegExp("^" + nombre + "$", "i") } 
    });
    if (existeNombre) {
      return res.status(400).json({ error: "Ya existe un cliente con ese nombre" });
    }
  }

  // Verificar si el teléfono ya existe (si se proporciona)
  if (telefono) {
    const existeTelefono = await User.findOne({ telefono: telefono });
    if (existeTelefono) {
      return res.status(400).json({ error: "El número de teléfono ya existe" });
    }
  }

  const user = new User(req.body)
  await user.save()

  res.json(user)

})

router.get("/buscar/:query",async(req,res)=>{

const query = req.params.query;

const users = await User.find({
  $or: [
    { numero: { $regex: query, $options: 'i' } },
    { nombre: { $regex: query, $options: 'i' } },
    { 'NOMBRE DEL SUSCRIPTOR': { $regex: query, $options: 'i' } }
  ]
});

res.json(users);

})

router.get("/contrato/:contrato",async(req,res)=>{

const user = await User.findOne({numero: req.params.contrato})

res.json(user)

})

router.get("/:id",async(req,res)=>{

const user = await User.findById(req.params.id)

if (!user) {
  return res.status(404).json({ error: "Usuario no encontrado" });
}

res.json(user)

})

router.put("/estatus/:id",async(req,res)=>{

const user = await User.findByIdAndUpdate(

req.params.id,
{estatus:req.body.estatus},
{new:true}

)

res.json(user)

})

router.put("/deuda/:id",async(req,res)=>{

const user = await User.findById(req.params.id)

user.deuda = (user.deuda || 0) + req.body.deuda

await user.save()

res.json(user)

})

router.put("/recibo/:id",async(req,res)=>{

const user = await User.findById(req.params.id)

if(!user.recibos){
user.recibos = [];
}

user.recibos.push({

fecha:new Date().toLocaleDateString(),
monto:req.body.monto

})

user.deuda = Math.max(0, (user.deuda || 0) - req.body.monto);

if (user.deuda === 0) {
  user.estatus = "Activo";
}

await user.save()

res.json(user)

})

router.delete("/:id", async (req, res) => {
  try {
    console.log('Intentando eliminar usuario con ID:', req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    console.log('Usuario eliminado:', user.nombre);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: "Error al eliminar usuario: " + error.message });
  }
});

module.exports = router;
