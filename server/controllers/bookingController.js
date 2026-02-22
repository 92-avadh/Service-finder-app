const Booking = require('../models/Booking');
const User = require('../models/User');
const Message = require('../models/Message'); // Need this to delete chats
const Notification = require('../models/Notification'); // Need this for alerts

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

const getProviderBookings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const bookings = await Booking.find({ provider: user.name }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

const createBooking = async (req, res) => {
  try {
    const { service, provider, date, time, price, image } = req.body;
    const customerEmail = req.user.email; 

    const newBooking = new Booking({ customerEmail, service, provider, date, time, price, image, status: 'Pending' });
    await newBooking.save();

    // --- REAL-TIME NOTIFICATION FOR PROVIDER ---
    const providerUser = await User.findOne({ name: provider, role: 'provider' });
    if (providerUser) {
      const notif = new Notification({ userId: providerUser._id, text: `New booking request: ${service}`, type: 'booking' });
      await notif.save();
      req.app.get('io').to(providerUser._id.toString()).emit('receive_notification', notif);
    }

    res.status(201).json({ message: 'Booking created', booking: newBooking });
  } catch (error) { res.status(500).json({ message: 'Failed to create booking' }); }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });

    // --- AUTO-DELETE CHAT IF COMPLETED ---
    if (status === 'Completed') {
      await Message.deleteMany({ bookingId: id });
    }

    // --- REAL-TIME NOTIFICATION FOR CUSTOMER ---
    const customerUser = await User.findOne({ email: updatedBooking.customerEmail });
    if (customerUser) {
      const notif = new Notification({ userId: customerUser._id, text: `Your booking for ${updatedBooking.service} was ${status}`, type: 'status' });
      await notif.save();
      req.app.get('io').to(customerUser._id.toString()).emit('receive_notification', notif);
    }

    res.status(200).json({ message: 'Status updated', booking: updatedBooking });
  } catch (error) { res.status(500).json({ message: 'Failed to update status' }); }
};

module.exports = { getMyBookings, getProviderBookings, createBooking, updateBookingStatus };