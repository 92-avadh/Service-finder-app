const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const User = require('../models/User'); // <-- NEW
const Notification = require('../models/Notification'); // <-- NEW
const verifyToken = require('../middleware/authMiddleware');

// Get messages for a booking
router.get('/:bookingId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ bookingId: req.params.bookingId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Send a new message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookingId, sender, text } = req.body;
    const newMessage = new Message({ bookingId, sender, text });
    const savedMessage = await newMessage.save();

    // 1. Emit to the active Chat Box
    if (req.io) {
      req.io.to(bookingId).emit('receive_message', savedMessage);
    }

    // 2. Generate a Notification for the Receiver's Navbar Bell
    try {
      const booking = await Booking.findById(bookingId);
      if (booking) {
         let receiverId = null;
         
         // Figure out who should receive the notification
         if (req.user.email === booking.customerEmail) {
             receiverId = booking.providerId; // Sender is Customer -> Ping Provider
         } else {
             const customer = await User.findOne({ email: booking.customerEmail });
             if (customer) receiverId = customer._id; // Sender is Provider -> Ping Customer
         }

         if (receiverId) {
             const notif = new Notification({
                 userId: receiverId,
                 text: `New message from ${sender}: ${text.length > 25 ? text.substring(0, 25) + '...' : text}`,
                 type: 'message'
             });
             await notif.save();
             if (req.io) {
                 req.io.to(receiverId.toString()).emit('receive_notification', notif);
             }
         }
      }
    } catch(err) { console.error("Chat Notification Error", err); }

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;