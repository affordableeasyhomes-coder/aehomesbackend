const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
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

module.exports = router;