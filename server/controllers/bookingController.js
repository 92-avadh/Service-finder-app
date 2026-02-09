const Booking = require('../models/Booking');

// Get all bookings for the logged-in user
const getMyBookings = async (req, res) => {
  try {
    const email = req.user.email;
    const bookings = await Booking.find({ customerEmail: email }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// NEW: Create a new booking
const createBooking = async (req, res) => {
  try {
    const { service, provider, date, time, price, image } = req.body;
    const customerEmail = req.user.email; // Get from logged-in user

    const newBooking = new Booking({
      customerEmail,
      service,
      provider,
      date,
      time,
      price,
      image,
      status: 'Pending'
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

module.exports = { getMyBookings, createBooking };