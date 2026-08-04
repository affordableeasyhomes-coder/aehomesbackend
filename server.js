require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

const enrichProperties = require('./utils/enrichProperties');

// Connect to MongoDB with detailed logging
connectDB()
  .then(() => {
    console.log('✅ MongoDB connected');
    // Backfill any property fields older seeds left out (additive, idempotent)
    enrichProperties()
      .then(count => { if (count) console.log(`🛠 Enriched ${count} properties with missing fields`); })
      .catch(err => console.error('Property enrichment failed:', err.message));
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:');
    console.error('   - Error name:', err.name);
    console.error('   - Error message:', err.message);
    console.error('   - Check if MONGODB_URI is set in Render environment');
    console.error('   - Check if IP is whitelisted in MongoDB Atlas');
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/properties.php', require('./routes/properties'));
app.use('/api/book_tour.php', require('./routes/bookTour'));
app.use('/api/payment-method.php', require('./routes/paymentMethods'));
app.use('/api/contact.php', require('./routes/contact'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   GET  /api/properties.php`);
  console.log(`   POST /api/book_tour.php`);
  console.log(`   GET  /api/payment-method.php`);
});