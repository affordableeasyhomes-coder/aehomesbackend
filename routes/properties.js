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

router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid property id' });
    }
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({
      success: true,
      property,
      tour_fee: parseFloat(process.env.TOUR_FEE || 50)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;