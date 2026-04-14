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

bookingSchema.pre('save', async function(next) {
  if (!this.booking_id) {
    const count = await this.constructor.countDocuments();
    this.booking_id = `BOK-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);