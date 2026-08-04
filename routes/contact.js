const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { sendContactNotification } = require('../utils/email');

router.post('/',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('subject').optional().trim(),
    body('message').notEmpty().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const { name, email, subject, message } = req.body;
      const contactMessage = new ContactMessage({ name, email, subject, message });
      await contactMessage.save();

      sendContactNotification(contactMessage).catch(console.error);

      res.json({
        success: true,
        message: 'Message received. Our team will get back to you within 24 hours.'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  }
);

module.exports = router;
