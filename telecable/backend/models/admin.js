const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({

usuario:String,
password:String

},{
collection:'admin'
})

module.exports = mongoose.model('Admin',AdminSchema)