require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const reportesRoutes = require('./routes/reportes');
const receiptRoutes = require('./routes/receipts');
const technicianRoutes = require('./routes/technicians');
const preregistrosRoutes = require('./routes/preregistros');
const configRoutes = require('./routes/config');
const Admin = require('./models/admin');

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await connectDB();
    console.log('MongoDB Connected to:', connection.connection.db.databaseName);

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

    app.use('/api/auth', authRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/reportes', reportesRoutes);
    app.use('/api/receipts', receiptRoutes);
    app.use('/api/technicians', technicianRoutes);
    app.use('/api/preregistros', preregistrosRoutes);
    app.use('/api/config', configRoutes);

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
    process.exit(1);
  }
}

startServer();
