require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telecable';

mongoose.set('strictQuery', false);

async function connectDB() {
  return mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });
}

module.exports = {
  connectDB,
  MONGODB_URI
};
