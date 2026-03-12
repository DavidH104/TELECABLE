const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const reportesRoutes = require('./routes/reportes');
const receiptRoutes = require('./routes/receipts');
const Admin = require('./models/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Config
const dbURI = 'mongodb://localhost:27017/telecable';

// Connect to MongoDB
mongoose.connect(dbURI)
  .then(async () => {
    console.log('MongoDB Connected...');
    
    // Crear admin por defecto si no existe
    const adminExists = await Admin.findOne({ usuario: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new Admin({
        usuario: 'admin',
        password: hashedPassword,
        nombre: 'Administrador'
      });
      await newAdmin.save();
      console.log('Admin creado: usuario=admin, password=admin123');
    }
  })
  .catch(err => console.log(err));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/receipts', receiptRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
