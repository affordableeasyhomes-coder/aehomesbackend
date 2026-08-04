const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  preferred_date: { type: Date, required: true },
  preferred_time: { type: String, required: true },
  guests: { type: Number, required: true, min: 1, max: 6 },
  message: String,
  payment_method: { type: String, required: true },
  booking_id: { type: String, unique: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Collision-resistant id: count-based ids break the unique index as soon as
// any booking is deleted, so derive from timestamp + random instead.
bookingSchema.pre('save', function(next) {
  if (!this.booking_id) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0');
    this.booking_id = `BOK-${stamp}${rand}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);