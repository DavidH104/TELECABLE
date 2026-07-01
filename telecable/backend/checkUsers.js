const mongoose = require('mongoose');
const { connectDB } = require('./db');

async function checkUsers() {
  try {
    await connectDB();
    console.log('Conectado a MongoDB local\n');
    
    const db = mongoose.connection.db;
    
    // Ver colección users
    console.log('=== COLECCIÓN: users ===');
    const users = await db.collection('users').find({}).limit(3).toArray();
    console.log('Total en users:', await db.collection('users').countDocuments());
    users.forEach(u => {
      console.log('-', u.numero || u.contrato || u._id, '-', u.nombre);
    });
    
    // Ver colección clientes
    console.log('\n=== COLECCIÓN: clientes ===');
    const clientes = await db.collection('clientes').find({}).limit(3).toArray();
    console.log('Total en clientes:', await db.collection('clientes').countDocuments());
    clientes.forEach(c => {
      console.log('-', c.numero || c.contrato || c._id, '-', c.nombre);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
