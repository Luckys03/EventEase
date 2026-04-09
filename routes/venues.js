const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Venue = require('../models/Venue');
const { protect, authorize } = require('../middleware/auth');

// @route   GET api/venues
// @desc    Get all venues with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    let { city, minCapacity, maxPrice, date, amenities } = req.query;
    const whereClause = {};

    // Apply filters if provided
    if (city) whereClause.city = { [Op.iLike]: `%${city}%` };
    if (minCapacity) whereClause.capacity = { [Op.gte]: parseInt(minCapacity) };
    if (maxPrice) whereClause.pricePerDay = { [Op.lte]: parseFloat(maxPrice) };
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      whereClause.amenities = {
        [Op.contains]: amenitiesArray
      };
    }

    // If date is provided, we'll need to check availability
    // This is a simplified version - in a real app, you'd check against bookings
    if (date) {
      whereClause.isAvailable = true;
      // In a real implementation, you'd also check the bookings table
      // to see if the venue is available on the requested date
    }

    const venues = await Venue.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(venues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/venues/:id
// @desc    Get venue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);

    if (!venue) {
      return res.status(404).json({ msg: 'Venue not found' });
    }

    res.json(venue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Venue not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/venues
// @desc    Create a venue
// @access  Private (Vendor/Admin)
router.post(
  '/',
  [
    protect,
    authorize('vendor', 'admin'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty(),
      check('city', 'City is required').not().isEmpty(),
      check('capacity', 'Please include a valid capacity').isNumeric(),
      check('pricePerDay', 'Please include a valid price').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Set the vendorId to the current user's ID
      const venueData = {
        ...req.body,
        vendorId: req.user.id
      };

      const venue = await Venue.create(venueData);
      res.json(venue);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/venues/:id
// @desc    Update a venue
// @access  Private (Vendor/Admin)
router.put(
  '/:id',
  [protect, authorize('vendor', 'admin')],
  async (req, res) => {
    try {
      let venue = await Venue.findByPk(req.params.id);

      if (!venue) {
        return res.status(404).json({ msg: 'Venue not found' });
      }

      // Make sure user owns the venue or is an admin
      if (venue.vendorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Update venue
      venue = await venue.update(req.body);
      res.json(venue);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/venues/:id
// @desc    Delete a venue
// @access  Private (Vendor/Admin)
router.delete('/:id', [protect, authorize('vendor', 'admin')], async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);

    if (!venue) {
      return res.status(404).json({ msg: 'Venue not found' });
    }

    // Make sure user owns the venue or is an admin
    if (venue.vendorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await venue.destroy();
    res.json({ msg: 'Venue removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/venues/vendor/my-venues
// @desc    Get current vendor's venues
// @access  Private (Vendor)
router.get('/vendor/my-venues', protect, authorize('vendor'), async (req, res) => {
  try {
    const venues = await Venue.findAll({
      where: { vendorId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(venues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
