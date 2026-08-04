const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { sendBookingConfirmation } = require('../utils/email');

router.post('/',
  [
    body('property_id').isMongoId(),
    body('full_name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty(),
    body('preferred_date').isISO8601(),
    body('preferred_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    body('guests').isInt({ min: 1, max: 6 }),
    body('message').optional().trim(),
    body('payment_method').isIn(['credit_card', 'paypal', 'stripe', 'bank_transfer'])
  ],
  async (req, res) => {
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

      sendBookingConfirmation(booking, property).catch(console.error);

      res.json({
        success: true,
        booking_id: booking.booking_id,
        message: 'Booking created successfully'
      });
    } catch (err) {
      console.error('Booking error:', err);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Duplicate booking reference, please try again' });
      }
      // TEMP DIAGNOSTIC: surface error details while debugging the 500
      res.status(500).json({ success: false, message: 'Booking failed. Please try again later.', debug: { name: err.name, code: err.code, detail: err.message } });
    }
  }
);

module.exports = router;