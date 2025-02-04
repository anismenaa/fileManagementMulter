const mongoose = require('mongoose');

const fileschema = new mongoose.Schema({
  originalname: {
    type: String,
    required: true
  },

  mimetype: {
    type: String,
    required: true
  },

  path: {
    type: String,
    required: true
  },

  size: {
    type: Number,
    required: true
  },

  uploadDate: {
    type: Date,
    default: Date.now
  }
})

const File = mongoose.model('File', fileschema)

module.exports = File