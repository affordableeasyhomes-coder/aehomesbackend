require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (only once, reused)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = mongoose.connection;
  return cachedDb;
}

// Models (define here or import)
const propertySchema = new mongoose.Schema({
  title: String, description: String, price: Number,
  location: String, city: String, state: String, country: String,
  image: String, type: String, tag: String, sqft: Number,
  beds: Number, baths: Number, amenities: String, rating: Number,
  featured: Boolean, status: String, createdAt: Date
});
const Property = mongoose.model('Property', propertySchema);

const bookingSchema = new mongoose.Schema({
  property_id: mongoose.Schema.Types.ObjectId,
  full_name: String, email: String, phone: String,
  preferred_date: Date, preferred_time: String, guests: Number,
  message: String, payment_method: String, booking_id: String, status: String
});
const Booking = mongoose.model('Booking', bookingSchema);

// Routes
app.get('/api/properties.php', async (req, res) => {
  await connectToDatabase();
  try {
    const { state, type, min_price, max_price } = req.query;
    let filter = {};
    if (state) filter.state = state;
    if (type) filter.type = type;
    if (min_price || max_price) {
      filter.price = {};
      if (min_price) filter.price.$gte = parseInt(min_price);
      if (max_price) filter.price.$lte = parseInt(max_price);
    }
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    const allStates = await Property.distinct('state');
    const totalProperties = await Property.countDocuments();
    const countriesCount = allStates.length;
    res.json({
      success: true,
      properties,
      states: allStates,
      tour_fee: parseFloat(process.env.TOUR_FEE || 50),
      stats: {
        total_properties: totalProperties,
        countries: countriesCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/book_tour.php', async (req, res) => {
  await connectToDatabase();
  // validation and logic as before
  // ... (simplified for brevity, include your full logic)
  res.json({ success: true, booking_id: 'BOK-001' });
});

app.get('/api/payment-method.php', (req, res) => {
  res.json({
    success: true,
    payment_methods: {
      credit_card: 'Credit Card',
      paypal: 'PayPal',
      stripe: 'Stripe',
      bank_transfer: 'Bank Transfer'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Export for Vercel
module.exports = app;