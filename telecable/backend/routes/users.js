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

// PUT - Actualizar usuario completo
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Actualizar datos del cliente (estatus, paquete, fecha instalacion)
router.put("/:id/datos", async (req, res) => {
  try {
    const { estatus, paquete, precioPaquete, fechaInstalacion, nombre, telefono, direccion, localidad } = req.body;
    
    const updateData = {};
    if (estatus) updateData.estatus = estatus;
    if (paquete) updateData.paquete = paquete;
    if (precioPaquete !== undefined) updateData.precioPaquete = precioPaquete;
    if (fechaInstalacion) updateData.fechaInstalacion = new Date(fechaInstalacion);
    if (nombre) updateData.nombre = nombre;
    if (telefono) updateData.telefono = telefono;
    if (direccion) updateData.direccion = direccion;
    if (localidad) updateData.localidad = localidad;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Registrar pago en historial de pagos
router.put("/:id/pago", async (req, res) => {
  try {
    const { mes, año, monto } = req.body;
    
    if (!mes || !año || !monto) {
      return res.status(400).json({ error: "Mes, año y monto son requeridos" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Inicializar historialPagos si no existe
    if (!user.historialPagos) {
      user.historialPagos = [];
    }

    // Buscar si ya existe un registro para ese mes/año
    const existingIndex = user.historialPagos.findIndex(
      p => p.mes === mes && p.año === año
    );

    const nuevoPago = {
      mes: mes,
      año: año,
      monto: monto,
      fechaPago: new Date(),
      status: 'pagado',
      fechaLimite: new Date(año, mes - 1, 10) // 10 de cada mes
    };

    if (existingIndex >= 0) {
      // Actualizar pago existente
      user.historialPagos[existingIndex] = nuevoPago;
    } else {
      // Agregar nuevo pago
      user.historialPagos.push(nuevoPago);
    }

    // Actualizar deuda
    user.deuda = Math.max(0, (user.deuda || 0) - monto);
    if (user.deuda === 0) {
      user.estatus = "Activo";
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET - Obtener historial de pagos (todos los años)
router.get("/:id/historial", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let historial = user.historialPagos || [];
    
    // Agrupar por año
    const grouped = {};
    historial.forEach(p => {
      if (!grouped[p.año]) grouped[p.año] = [];
      grouped[p.año].push(p);
    });
    // Ordenar años descending
    const añosOrdenados = Object.keys(grouped).sort((a, b) => b - a);
    historial = añosOrdenados.map(a => ({ anio: parseInt(a), meses: grouped[a].sort((x, y) => x.mes - y.mes) }));

    res.json({
      usuario: {
        _id: user._id,
        numero: user.numero,
        nombre: user.nombre,
        paquete: user.paquete,
        precioPaquete: user.precioPaquete,
        fechaInstalacion: user.fechaInstalacion
      },
      historial: historial
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET - Obtener historial de pagos de un año específico
router.get("/:id/historial/:año", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const año = parseInt(req.params.año);
    let historial = user.historialPagos || [];
    historial = historial.filter(p => p.año === año);
    // Ordenar por mes
    historial.sort((a, b) => a.mes - b.mes);
    // Cambiar nombre de campo año a anio para compatibilidad con Angular
    historial = historial.map(p => ({ ...p, anio: p.año }));

    res.json({
      usuario: {
        _id: user._id,
        numero: user.numero,
        nombre: user.nombre,
        paquete: user.paquete,
        precioPaquete: user.precioPaquete,
        fechaInstalacion: user.fechaInstalacion
      },
      historial: historial
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Eliminar un pago del historial
router.delete("/:id/pago/:index", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= (user.historialPagos?.length || 0)) {
      return res.status(400).json({ error: "Índice de pago inválido" });
    }

    const pagoEliminado = user.historialPagos[index];
    user.historialPagos.splice(index, 1);
    
    // Restaurar deuda
    user.deuda = (user.deuda || 0) + pagoEliminado.monto;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
