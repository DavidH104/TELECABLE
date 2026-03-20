const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos. Intenta de nuevo en 15 minutos." }
});

const codeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo en una hora." }
});

function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
}

/*
LOGIN ADMIN
POST
/api/auth/admin
*/

router.post('/admin', async (req, res) => {

try {

const { usuario, password } = req.body;

console.log('Login attempt:', usuario);

const admin = await Admin.findOne({
  usuario: usuario
});

if (!admin) {
  console.log('Admin not found');
  return res.status(401).json({
    mensaje: "Credenciales incorrectas"
  });
}

console.log('Admin found, checking password...');

const isPasswordValid = await bcrypt.compare(password, admin.password);

console.log('Password valid:', isPasswordValid);

if (!isPasswordValid) {
  return res.status(401).json({
    mensaje: "Credenciales incorrectas"
  });
}

res.json({
  mensaje: "Login correcto",
  admin: {
    _id: admin._id,
    usuario: admin.usuario,
    nombre: admin.nombre
  }
});

} catch(error){

console.error('Login error:', error);
res.status(500).json({
  error: error.message
});

}

});

/*
SOLICITAR CÓDIGO DE VERIFICACIÓN (para establecer contraseña)
POST
/api/auth/solicitar-codigo
*/

router.post('/solicitar-codigo', codeLimiter, async (req, res) => {
  try {
    const { contrato, telefono } = req.body;

    // Validar entrada
    if (!contrato || !telefono) {
      return res.status(400).json({ error: "Contrato y teléfono son requeridos" });
    }

    // Buscar usuario por número de contrato
    const user = await User.findOne({ numero: contrato });
    
    // Mensaje genérico para evitar enumeración
    if (!user) {
      return res.json({ 
        mensaje: "Si el contrato y teléfono son válidos, recibirás un código" 
      });
    }

    // Verificar que el teléfono coincida
    if (user.telefono !== telefono) {
      return res.json({ 
        mensaje: "Si el contrato y teléfono son válidos, recibirás un código" 
      });
    }

    // Generar código de verificación
    const codigo = generarCodigo();
    
    // Hashear el código antes de almacenarlo
    const hashedCodigo = await bcrypt.hash(codigo, 10);
    
    user.codigoVerificacion = hashedCodigo;
    user.codigoExpira = new Date(Date.now() + 10 * 60 * 1000); // Expira en 10 minutos
    await user.save();

    // En producción, aquí se enviaría el SMS
    console.log(`\n========================================`);
    console.log(`CÓDIGO DE VERIFICACIÓN PARA ${user.nombre}`);
    console.log(`Contrato: ${contrato}`);
    console.log(`Código: ${codigo}`);
    console.log(`Expira en 10 minutos`);
    console.log(`========================================\n`);

    res.json({ 
      mensaje: "Si el contrato y teléfono son válidos, recibirás un código",
      // En desarrollo mostraremos el código (quitar en producción)
      codigoTemporal: codigo 
    });

  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

/*
VERIFICAR CÓDIGO Y ESTABLECER CONTRASEÑA
POST
/api/auth/verificar-codigo
*/

const verifyCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Demasiados intentos de verificacion. Intenta de nuevo en una hora." }
});

router.post('/verificar-codigo', verifyCodeLimiter, async (req, res) => {
  try {
    const { contrato, codigo, nuevaPassword } = req.body;

    // Validar entrada
    if (!contrato || !codigo || !nuevaPassword) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Validar longitud de contraseña
    if (nuevaPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const user = await User.findOne({ numero: contrato });
    
    if (!user) {
      return res.status(400).json({ error: "Código o contrato inválido" });
    }

    // Verificar código usando comparación segura
    if (!user.codigoVerificacion) {
      return res.status(400).json({ error: "No hay código de verificación pendiente" });
    }

    const isCodeValid = await bcrypt.compare(codigo, user.codigoVerificacion);

    if (!isCodeValid) {
      return res.status(400).json({ error: "Código incorrecto" });
    }

    // Verificar expiración
    if (new Date() > user.codigoExpira) {
      return res.status(400).json({ error: "El código ha expirado. Solicita uno nuevo." });
    }

    // Hashear la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    
    user.password = hashedPassword;
    user.codigoVerificacion = null;
    user.codigoExpira = null;
    await user.save();

    res.json({ mensaje: "Contraseña establecida correctamente" });

  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

/*
LOGIN USUARIO POR NUMERO DE CONTRATO Y CONTRASEÑA
POST
/api/auth/user
*/

router.post('/user', loginLimiter, async (req, res) => {

try {

const { contrato, password } = req.body;

const user = await User.findOne({
  numero: contrato
});

if (!user) {
  return res.status(401).json({
    mensaje: "Credenciales incorrectas"
  });
}

if (!user.password) {
  return res.status(401).json({
    necesitaPassword: true,
    mensaje: "Este usuario no tiene contraseña establecida"
  });
}

const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
  return res.status(401).json({
    mensaje: "Credenciales incorrectas"
  });
}

const userResponse = {
  _id: user._id,
  numero: user.numero,
  nombre: user.nombre,
  telefono: user.telefono,
  localidad: user.localidad,
  estatus: user.estatus,
  deuda: user.deuda,
  recibos: user.recibos
};

res.json({
  mensaje: "Login correcto",
  user: userResponse
});

} catch(error){

res.status(500).json({
  error: error.message
});

}

});

/*
SOLICITAR CÓDIGO DE VERIFICACIÓN POR TELÉFONO
POST
/api/auth/user/solicitar-codigo
*/

router.post('/user/solicitar-codigo', codeLimiter, async (req, res) => {
  try {
    const { contrato, telefono } = req.body;

    if (!contrato || !telefono) {
      return res.status(400).json({ error: "Contrato y teléfono son requeridos" });
    }

    const user = await User.findOne({ numero: contrato });
    
    if (!user) {
      return res.json({ 
        mensaje: "Si el contrato y teléfono son válidos, recibirás un código" 
      });
    }

    if (user.telefono !== telefono) {
      return res.json({ 
        mensaje: "Si el contrato y teléfono son válidos, recibirás un código" 
      });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCodigo = await bcrypt.hash(codigo, 10);
    
    user.codigoVerificacion = hashedCodigo;
    user.codigoExpira = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`\n========================================`);
    console.log(`CÓDIGO DE VERIFICACIÓN PARA ${user.nombre}`);
    console.log(`Contrato: ${contrato}`);
    console.log(`Código: ${codigo}`);
    console.log(`Expira en 10 minutos`);
    console.log(`========================================\n`);

    res.json({ 
      mensaje: "Si el contrato y teléfono son válidos, recibirás un código",
      codigoTemporal: codigo 
    });

  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

/*
VERIFICAR CÓDIGO Y LOGIN
POST
/api/auth/user/verificar-login
*/

router.post('/user/verificar-login', verifyCodeLimiter, async (req, res) => {
  try {
    const { contrato, codigo, password } = req.body;

    if (!contrato || !codigo || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const user = await User.findOne({ numero: contrato });
    
    if (!user) {
      return res.status(400).json({ error: "Contrato o código inválido" });
    }

    if (!user.codigoVerificacion) {
      return res.status(400).json({ error: "No hay código de verificación pendiente" });
    }

    const isCodeValid = await bcrypt.compare(codigo, user.codigoVerificacion);
    
    if (!isCodeValid) {
      return res.status(400).json({ error: "Código de verificación inválido" });
    }

    if (user.codigoExpira && new Date() > user.codigoExpira) {
      return res.status(400).json({ error: "El código de verificación ha expirado" });
    }

    // Verificar contraseña
    if (!user.password) {
      return res.status(400).json({ error: "Este usuario no tiene contraseña establecida" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Limpiar código de verificación
    user.codigoVerificacion = null;
    user.codigoExpira = null;
    await user.save();

    const userResponse = {
      _id: user._id,
      numero: user.numero,
      nombre: user.nombre,
      telefono: user.telefono,
      localidad: user.localidad,
      estatus: user.estatus,
      deuda: user.deuda,
      recibos: user.recibos
    };

    res.json({
      mensaje: "Login correcto",
      user: userResponse
    });

  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

/*
CREAR NUEVO ADMINISTRADOR
POST
/api/auth/admin/crear
*/

router.post('/admin/crear', async (req, res) => {
  try {
    const { usuario, password, nombre } = req.body;

    // Validar
    if (!usuario || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    // Verificar si ya existe
    const existe = await Admin.findOne({ usuario });
    if (existe) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoAdmin = new Admin({
      usuario,
      password: hashedPassword,
      nombre: nombre || '',
      rol: 'admin'
    });

    await nuevoAdmin.save();

    res.json({ mensaje: "Administrador creado exitosamente" });

  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

/*
LISTAR ADMINISTRADORES
GET
/api/auth/admin/listar
*/

router.get('/admin/listar', async (req, res) => {
  try {
    const admins = await Admin.find({}, '-password');
    res.json(admins);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/solicitudes', async (req, res) => {
  try {
    const solicitudes = await User.find({
      'solicitudRegistro.estado': { $in: ['pendiente', 'aprobado', 'rechazado'] }
    }).sort({ 'solicitudRegistro.fecha': -1 });
    res.json(solicitudes);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/solicitudes/:id/aprobar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    user.solicitudRegistro.estado = 'aprobado';
    user.solicitudRegistro.fecha = new Date();
    await user.save();
    res.json({ mensaje: 'Solicitud aprobada', user });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/solicitudes/:id/rechazar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    user.solicitudRegistro.estado = 'rechazado';
    user.solicitudRegistro.fecha = new Date();
    await user.save();
    res.json({ mensaje: 'Solicitud rechazada', user });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/solicitudes/crear', async (req, res) => {
  try {
    const { numero, nombre, telefono, direccion } = req.body;
    if (!numero || !nombre || !telefono) {
      return res.status(400).json({ error: 'Número de contrato, nombre y teléfono son requeridos' });
    }
    let user = await User.findOne({ numero });
    if (user) {
      if (user.solicitudRegistro && user.solicitudRegistro.estado === 'pendiente') {
        return res.status(400).json({ error: 'Ya existe una solicitud pendiente para este contrato' });
      }
      if (user.password) {
        return res.status(400).json({ error: 'Este contrato ya tiene una cuenta' });
      }
      user.solicitudRegistro = {
        tipo: 'nuevo_usuario',
        estado: 'pendiente',
        fecha: new Date(),
        nombre,
        telefono,
        direccion
      };
      await user.save();
      return res.json({ mensaje: 'Solicitud actualizada', user });
    }
    user = new User({
      numero,
      nombre,
      telefono,
      direccion,
      solicitudRegistro: {
        tipo: 'nuevo_usuario',
        estado: 'pendiente',
        fecha: new Date(),
        nombre,
        telefono,
        direccion
      }
    });
    await user.save();
    res.json({ mensaje: 'Solicitud creada correctamente', user });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
