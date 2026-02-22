const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/authMiddleware');

// Get all notifications for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(notifications);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// Mark all notifications as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All read' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;