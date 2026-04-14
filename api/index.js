require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
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

// ==================== MODELS ====================
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
  message: String, payment_method: String, booking_id: String, status: String,
  createdAt: { type: Date, default: Date.now }
});
bookingSchema.pre('save', async function(next) {
  if (!this.booking_id) {
    const count = await this.constructor.countDocuments();
    this.booking_id = `BOK-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);

// ==================== ROUTES ====================
// 1. GET properties
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
    res.json({
      success: true,
      properties,
      states: allStates,
      tour_fee: parseFloat(process.env.TOUR_FEE || 50),
      stats: {
        total_properties: totalProperties,
        countries: allStates.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. POST book tour
app.post('/api/book_tour.php',
  [
    body('property_id').isMongoId(),
    body('full_name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty(),
    body('preferred_date').isISO8601(),
    body('preferred_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:00$/),
    body('guests').isInt({ min: 1, max: 6 }),
    body('payment_method').isIn(['credit_card', 'paypal', 'stripe', 'bank_transfer'])
  ],
  async (req, res) => {
    await connectToDatabase();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    try {
      const { property_id, ...bookingData } = req.body;
      const property = await Property.findById(property_id);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      const booking = new Booking({
        property_id,
        ...bookingData,
        preferred_date: new Date(bookingData.preferred_date)
      });
      await booking.save();
      // Email sending optional (skip or implement with a service)
      res.json({
        success: true,
        booking_id: booking.booking_id,
        message: 'Booking created successfully'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Booking failed' });
    }
  }
);

// 3. GET payment methods
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