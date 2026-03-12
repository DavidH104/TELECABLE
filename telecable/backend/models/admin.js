const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: { type: String, default: '' },
  rol: { type: String, default: 'admin' }, // admin, superadmin
  createdAt: { type: Date, default: Date.now }
},{
  collection: 'admin'
})

module.exports = mongoose.model('Admin', AdminSchema)
