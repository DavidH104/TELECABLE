const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/telecable")
.then(()=> console.log("Mongo conectado"))
.catch(err => console.log(err));

module.exports = mongoose;