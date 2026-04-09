const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { estimateCost, getAvailableServices } = require('../utils/costEstimator');
const Venue = require('../models/Venue');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/estimates/services
 * @desc    Get available services for cost estimation
 * @access  Public
 */
router.get('/services', (req, res) => {
  try {
    const services = getAvailableServices();
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving services',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/estimates/calculate
 * @desc    Calculate estimated cost for a booking
 * @access  Private (if you want to protect this route, uncomment the protect middleware)
 */
router.post(
  '/calculate',
  [
    // protect, // Uncomment to make this endpoint protected
    [
      check('venueId', 'Venue ID is required').not().isEmpty(),
      check('startDate', 'Start date is required').isISO8601(),
      check('endDate', 'End date is required').isISO8601(),
      check('guestCount', 'Number of guests is required').isInt({ min: 1 }),
      check('services', 'Services should be an array').optional().isArray()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { venueId, startDate, endDate, guestCount, services = [] } = req.body;

    try {
      // Get venue details
      const venue = await Venue.findByPk(venueId);
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }

      // Calculate duration in days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Get cost estimate
      const estimate = estimateCost({
        basePrice: venue.pricePerDay,
        guestCount: parseInt(guestCount),
        duration,
        services: Array.isArray(services) ? services : []
      });

      res.json({
        success: true,
        data: {
          ...estimate,
          venue: {
            id: venue.id,
            name: venue.name,
            capacity: venue.capacity
          },
          eventDetails: {
            startDate,
            endDate,
            duration: `${duration} day${duration > 1 ? 's' : ''}`,
            guestCount: parseInt(guestCount)
          }
        }
      });

    } catch (error) {
      console.error('Error calculating estimate:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating estimate',
        error: error.message
      });
    }
  }
);

module.exports = router;
