require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const enrichProperties = require('./utils/enrichProperties');

const app = express();

// ---- Resolve TOUR_FEE once, safely ----
const parsedFee = Number(process.env.TOUR_FEE);
const TOUR_FEE = Number.isFinite(parsedFee) ? parsedFee : 500;
console.log(`💰 TOUR_FEE = ${TOUR_FEE} (raw env: ${JSON.stringify(process.env.TOUR_FEE)})`);

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Lazy DB connect (serverless-safe) ----
let dbConnected = false;
app.use(async (req, res, next) => {
  if (dbConnected) return next();
  try {
    await connectDB();
    dbConnected = true;
    console.log('✅ MongoDB connected');
    enrichProperties()
      .then(n => { if (n) console.log(`🛠 Enriched ${n} properties`); })
      .catch(err => console.error('Enrichment failed:', err.message));
    next();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    // Do NOT process.exit — return 503 so the function survives
    res.status(503).json({ success: false, message: 'Database unavailable' });
  }
});

// ---- Routes ----
app.use('/api/properties.php', require('./routes/properties'));
app.use('/api/book_tour.php', require('./routes/bookTour'));
app.use('/api/payment-method.php', require('./routes/paymentMethods'));
app.use('/api/contact.php', require('./routes/contact'));

// ---- Health ----
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    tour_fee: TOUR_FEE,
    db: dbConnected ? 'connected' : 'disconnected',
  });
});

// ---- Root (silences "Cannot GET /") ----
app.get('/', (req, res) => {
  res.json({
    status: 'AE Homes Backend is live',
    tour_fee: TOUR_FEE,
    routes: [
      'GET /api/health',
      'GET /api/properties.php',
      'POST /api/book_tour.php',
      'GET /api/payment-method.php',
      'POST /api/contact.php',
    ],
  });
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// ---- Local dev only ----
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ---- What Vercel needs ----
module.exports = app;