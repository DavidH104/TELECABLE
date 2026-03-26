const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

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

const dbURI = 'mongodb+srv://telecable:TelecableSanbartolo2026@cluster0.qyxpbok.mongodb.net/telecable?retryWrites=true&w=majority';

mongoose.connect(dbURI)
  .then(async () => {
    console.log('MongoDB Connected to:', mongoose.connection.db.databaseName);
    
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

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/preregistros', preregistrosRoutes);
app.use('/api/config', configRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
