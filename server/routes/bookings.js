const express = require('express');
const router = express.Router();
const { getMyBookings, createBooking } = require('../controllers/bookingController');
const verifyToken = require('../middleware/authMiddleware');

// GET all my bookings
router.get('/', verifyToken, getMyBookings);

// POST create a new booking
router.post('/', verifyToken, createBooking);

module.exports = router;