const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');
const verifyToken = require('../middleware/authMiddleware');

// Get messages for a booking
router.get('/:bookingId', verifyToken, getMessages);

// Send a new message
router.post('/', verifyToken, sendMessage);

module.exports = router;