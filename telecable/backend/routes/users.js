const express = require('express')
const router = express.Router()
const User = require('../models/user')

/* OBTENER TODOS LOS USUARIOS */

router.get('/', async (req,res)=>{

try{

const users = await User.find()
res.json(users)

}catch(err){

res.status(500).json(err)

}

})


/* CREAR USUARIO */

router.post('/', async (req,res)=>{

try{

const user = new User(req.body)

await user.save()

res.json(user)

}catch(err){

res.status(500).json(err)

}

})


/* ACTUALIZAR DEUDA */

router.put('/deuda/:id', async (req,res)=>{

try{

const user = await User.findByIdAndUpdate(

req.params.id,

{ deuda:req.body.deuda },

{ new:true }

)

res.json(user)

}catch(err){

res.status(500).json(err)

}

})


/* ACTUALIZAR ESTATUS */

router.put('/estatus/:id', async (req,res)=>{

try{

const user = await User.findByIdAndUpdate(

req.params.id,

{ estatus:req.body.estatus },

{ new:true }

)

res.json(user)

}catch(err){

res.status(500).json(err)

}

})

module.exports = router