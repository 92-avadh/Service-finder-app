const Message = require('../models/Message');
const Booking = require('../models/Booking');
const User = require('../models/User'); // Add this at the top
const Notification = require('../models/Notification'); // Add this at the top

const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const messages = await Message.find({ bookingId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) { res.status(500).json({ message: "Server error fetching messages" }); }
};

const sendMessage = async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    const senderId = req.user.id; 
    const senderName = req.user.name || req.user.email.split('@')[0];

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const newMessage = new Message({ bookingId, senderId, senderName, text });
    await newMessage.save();

    const io = req.app.get('io');
    io.to(bookingId).emit('receive_message', newMessage);

    // --- REAL-TIME NOTIFICATION ---
    // Figure out who receives the notification
    let receiverUser;
    if (req.user.role === 'customer') {
      receiverUser = await User.findOne({ name: booking.provider, role: 'provider' });
    } else {
      receiverUser = await User.findOne({ email: booking.customerEmail });
    }

    if (receiverUser) {
      const notif = new Notification({ userId: receiverUser._id, text: `New message from ${senderName}`, type: 'message' });
      await notif.save();
      io.to(receiverUser._id.toString()).emit('receive_notification', notif);
    }

    res.status(201).json(newMessage);
  } catch (error) { res.status(500).json({ message: "Server error sending message" }); }
};

module.exports = { getMessages, sendMessage };