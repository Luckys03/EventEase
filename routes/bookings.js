const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('venueId', 'Venue ID is required').not().isEmpty(),
      check('startDate', 'Start date is required').isISO8601(),
      check('endDate', 'End date is required').isISO8601(),
      check('totalGuests', 'Number of guests is required').isInt({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { venueId, startDate, endDate, totalGuests, specialRequests } = req.body;
    const userId = req.user.id;

    try {
      // 1. Check if venue exists and is available
      const venue = await Venue.findByPk(venueId);
      if (!venue) {
        return res.status(404).json({ msg: 'Venue not found' });
      }

      if (!venue.isAvailable) {
        return res.status(400).json({ msg: 'Venue is not available for booking' });
      }

      // 2. Check if venue can accommodate the number of guests
      if (totalGuests > venue.capacity) {
        return res.status(400).json({ 
          msg: `Venue can only accommodate up to ${venue.capacity} guests` 
        });
      }

      // 3. Check for existing bookings that overlap with the requested dates
      const existingBooking = await Booking.findOne({
        where: {
          venueId,
          status: { [Op.notIn]: ['cancelled'] },
          [Op.or]: [
            {
              startDate: { [Op.between]: [startDate, endDate] }
            },
            {
              endDate: { [Op.between]: [startDate, endDate] }
            },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: startDate } },
                { endDate: { [Op.gte]: endDate } }
              ]
            }
          ]
        }
      });

      if (existingBooking) {
        return res.status(400).json({ 
          msg: 'Venue is already booked for the selected dates' 
        });
      }

      // 4. Calculate total cost
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const totalAmount = days * venue.pricePerDay;

      // 5. Create booking
      const booking = await Booking.create({
        userId,
        venueId,
        startDate,
        endDate,
        totalGuests,
        totalAmount,
        specialRequests: specialRequests || null,
        status: 'pending',
        paymentStatus: 'pending'
      });

      // 6. Get booking with venue and user details
      const bookingWithDetails = await Booking.findByPk(booking.id, {
        include: [
          { model: Venue },
          { model: User, attributes: ['id', 'name', 'email'] }
        ]
      });

      res.status(201).json(bookingWithDetails);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Venue,
          attributes: ['id', 'name', 'address', 'city', 'pricePerDay']
        }
      ],
      order: [['startDate', 'DESC']]
    });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bookings/venue/:venueId
// @desc    Get all bookings for a specific venue (for venue owners)
// @access  Private
router.get('/venue/:venueId', protect, async (req, res) => {
  try {
    // Check if the venue exists and belongs to the current user (vendor)
    const venue = await Venue.findOne({
      where: { 
        id: req.params.venueId,
        vendorId: req.user.id
      }
    });

    if (!venue) {
      return res.status(404).json({ msg: 'Venue not found or access denied' });
    }

    const bookings = await Booking.findAll({
      where: { venueId: req.params.venueId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['startDate', 'DESC']]
    });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Venue },
        { model: User, attributes: ['id', 'name'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the user is the one who made the booking or the venue owner
    if (booking.userId !== req.user.id && booking.Venue.vendorId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to cancel this booking' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Booking is already cancelled' });
    }

    // Check if booking is already completed
    if (booking.status === 'completed') {
      return res.status(400).json({ msg: 'Cannot cancel a completed booking' });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.json({ 
      msg: 'Booking cancelled successfully',
      booking 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { 
          model: Venue,
          attributes: ['id', 'name', 'address', 'city', 'pricePerDay']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the user is the one who made the booking or the venue owner
    if (booking.userId !== req.user.id && booking.Venue.vendorId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
