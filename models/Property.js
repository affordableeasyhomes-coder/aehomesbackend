const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  location: String,
  city: String,
  state: { type: String, required: true },
  country: String,
  type: { type: String, enum: ['apartment', 'house', 'penthouse', 'villa', 'loft'] },
  beds: Number,
  baths: Number,
  sqft: Number,
  amenities: String,
  featured: Boolean,
  status: { type: String, default: 'available' },
  image: String,
  rating: Number,
  tag: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);
