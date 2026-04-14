const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

router.get('/', async (req, res) => {
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
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;