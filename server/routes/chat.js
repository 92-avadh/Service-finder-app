const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const User = require('../models/User'); 
const Notification = require('../models/Notification'); 
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
    // We accept both sender and senderName to prevent breaking anything
    const { bookingId, senderName, sender, text } = req.body;
    
    // Identify the sender's details securely from the Token
    const actualSenderId = req.user.id || req.user._id; 
    const actualSenderName = senderName || sender || req.user.name || req.user.email.split('@')[0];

    if (!actualSenderId) {
        return res.status(400).json({ message: "Authentication error: User ID missing." });
    }

    // FIX: Match the exact schema defined in Message.js
    const newMessage = new Message({ 
        bookingId, 
        senderId: actualSenderId, 
        senderName: actualSenderName, 
        text 
    });
    
    const savedMessage = await newMessage.save();

    // 1. Emit to the active Chat Box (This makes it appear for both users instantly)
    if (req.io) {
      req.io.to(bookingId).emit('receive_message', savedMessage);
    }

    // 2. Generate a Notification for the Receiver
    try {
      const booking = await Booking.findById(bookingId);
      if (booking) {
         let receiverId = null;
         
         if (req.user.email === booking.customerEmail) {
             receiverId = booking.providerId; // Customer -> Provider
         } else {
             const customer = await User.findOne({ email: booking.customerEmail });
             if (customer) receiverId = customer._id; // Provider -> Customer
         }

         if (receiverId) {
             const notif = new Notification({
                 userId: receiverId,
                 text: `New message from ${actualSenderName}: ${text.length > 25 ? text.substring(0, 25) + '...' : text}`,
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
    console.error("Message Save Error:", error.message);
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
});

module.exports = router;