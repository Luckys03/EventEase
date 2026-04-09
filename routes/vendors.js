const express = require('express');
const router = express.Router();

// @route   GET /api/vendors
// @desc    Test vendors route
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Vendors route working' });
});

module.exports = router;
