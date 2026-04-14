const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  location: String,
  state: { type: String, required: true },
  type: { type: String, enum: ['apartment', 'house', 'penthouse', 'villa', 'loft'] },
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  image: String,
  rating: Number,
  tag: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);