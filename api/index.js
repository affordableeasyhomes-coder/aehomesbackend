// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Tour fee: read from env, validate, fall back to 500 ----
const parsedFee = Number(process.env.TOUR_FEE);
const TOUR_FEE = Number.isFinite(parsedFee) ? parsedFee : 500;
console.log(`💰 TOUR_FEE = ${TOUR_FEE} (raw env: ${JSON.stringify(process.env.TOUR_FEE)})`);

// ---- DB connection (cached per cold start) ----
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = mongoose.connection;
  return cachedDb;
}

// ---- Reuse the real Property model (keeps schema in sync with seed) ----
const Property = require('../models/Property');

// ---- Health check (so Thunder Client has something to confirm) ----
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    tour_fee: TOUR_FEE,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ---- Properties ----
app.get('/api/properties.php', async (req, res) => {
  try {
    await connectToDatabase();
    const { state } = req.query;
    const filter = state ? { state } : {};

    const properties = await Property.find(filter).sort({ createdAt: -1 }).lean();
    const allStates = await Property.distinct('state');
    const totalProperties = await Property.countDocuments();

    res.json({
      success: true,
      properties,
      states: allStates,
      tour_fee: TOUR_FEE,
      stats: {
        total_properties: totalProperties,
        states: allStates.length,
      },
    });
  } catch (err) {
    console.error('GET /api/properties.php failed:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ---- Booking (stub) ----
app.post('/api/book_tour.php', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({
      success: true,
      booking_id: 'BOK-001',
      message: 'Booking created',
      tour_fee: TOUR_FEE, // so the confirmation email/modal shows the right amount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---- Payment methods ----
app.get('/api/payment-method.php', (req, res) => {
  res.json({
    success: true,
    payment_methods: {
      credit_card: 'Credit Card',
      paypal: 'PayPal',
      stripe: 'Stripe',
      bank_transfer: 'Bank Transfer',
    },
  });
});

// ---- Root route (silences "Cannot GET /") ----
app.get('/', (req, res) => {
  res.json({
    status: 'AE Homes Backend is live',
    tour_fee: TOUR_FEE,
    routes: [
      'GET /api/health',
      'GET /api/properties.php',
      'POST /api/book_tour.php',
      'GET /api/payment-method.php',
    ],
  });
});

module.exports = app;