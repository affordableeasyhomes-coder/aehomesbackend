require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection (cached for serverless)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = mongoose.connection;
  return cachedDb;
}

// Property Model
const propertySchema = new mongoose.Schema({
  title: String, description: String, price: Number,
  location: String, state: String, type: String,
  image: String, rating: Number, createdAt: { type: Date, default: Date.now }
});
const Property = mongoose.model('Property', propertySchema);

// Routes
app.get('/api/properties.php', async (req, res) => {
  await connectToDatabase();
  try {
    const { state } = req.query;
    let filter = state ? { state } : {};
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    const allStates = await Property.distinct('state');
    res.json({
      success: true,
      properties,
      states: allStates,
      tour_fee: 50,
      stats: { total_properties: await Property.countDocuments(), countries: allStates.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/book_tour.php', async (req, res) => {
  await connectToDatabase();
  res.json({ success: true, booking_id: 'BOK-001', message: 'Booking created' });
});

app.get('/api/payment-method.php', (req, res) => {
  res.json({ success: true, payment_methods: { credit_card: 'Credit Card', paypal: 'PayPal', stripe: 'Stripe', bank_transfer: 'Bank Transfer' } });
});

module.exports = app;