const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Notification = require('../models/Notification'); // <-- NEW
const User = require('../models/User'); // <-- NEW
const verifyToken = require('../middleware/authMiddleware');

// --- HELPER TO GENERATE DB NOTIFICATIONS & REAL-TIME EVENTS ---
const notifyUsers = async (req, booking) => {
  // 1. Instantly update the Dashboards
  if (req.io) {
    if (booking.customerEmail) req.io.to(booking.customerEmail).emit('booking_status_updated', booking);
    if (booking.providerId) req.io.to(booking.providerId.toString()).emit('booking_status_updated', booking);
  }

  // 2. Create Persistent Notifications for the Navbar Bell
  try {
    // Notify the Customer about the status change
    if (booking.customerEmail) {
      const customer = await User.findOne({ email: booking.customerEmail });
      if (customer) {
        const notif = new Notification({
          userId: customer._id,
          text: `Your booking for ${booking.service} is now ${booking.status}.`,
          type: 'status'
        });
        await notif.save();
        if (req.io) req.io.to(customer._id.toString()).emit('receive_notification', notif);
      }
    }

    // Notify the Provider when the job is finally completed/paid
    if (booking.status === 'Completed' && booking.providerId) {
      const notif = new Notification({
        userId: booking.providerId,
        text: `Payment confirmed for ${booking.service}. Job completed!`,
        type: 'status'
      });
      await notif.save();
      if (req.io) req.io.to(booking.providerId.toString()).emit('receive_notification', notif);
    }
  } catch (err) { console.error("Error generating notification", err); }
};

// GET PROVIDER BOOKINGS
router.get('/provider', verifyToken, async (req, res) => {
  try {
    const proId = String(req.user.id || req.user._id);
    const bookings = await Booking.find({ $or: [{ providerId: proId }, { provider: req.user.name }] }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: "Error fetching provider bookings" }); }
});

// GET CUSTOMER BOOKINGS
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: "Error fetching bookings" }); }
});

// INITIAL BOOKING CREATION
router.post('/', verifyToken, async (req, res) => {
  try {
    const newBooking = new Booking({ ...req.body, customerEmail: req.user.email });
    const savedBooking = await newBooking.save();
    
    if (req.io && savedBooking.providerId) {
      // Update Pro Dashboard
      req.io.to(savedBooking.providerId.toString()).emit('new_booking_request', savedBooking);
      
      // Ping Pro Navbar Bell
      try {
        const notif = new Notification({
          userId: savedBooking.providerId,
          text: `New booking request for ${savedBooking.service}!`,
          type: 'status'
        });
        await notif.save();
        req.io.to(savedBooking.providerId.toString()).emit('receive_notification', notif);
      } catch(e) { console.error(e); }
    }
    
    res.status(201).json(savedBooking);
  } catch (error) { res.status(500).json({ message: "Error creating booking" }); }
});

// 1. STANDARD STATUS UPDATE
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    let updateData = { status };
    if (status === 'Confirmed') updateData.startOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    await notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error updating status" }); }
});

// 2. VERIFY OTP
router.put('/:id/start', verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (booking.startOtp !== otp) return res.status(400).json({ message: "Invalid OTP." });

    booking.status = 'In Progress';
    await booking.save();
    await notifyUsers(req, booking); 
    res.status(200).json(booking);
  } catch (error) { res.status(500).json({ message: "Error verifying OTP" }); }
});

// 3. SENDS BILL
router.put('/:id/bill', verifyToken, async (req, res) => {
  try {
    const { finalPrice } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'Payment Pending', finalPrice: finalPrice }, { new: true });
    await notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error sending bill" }); }
});

// 4. CUSTOMER PAYS
router.put('/:id/pay', verifyToken, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const newStatus = paymentMethod === 'COD' ? 'Payment Verification' : 'Completed';
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: newStatus, paymentMethod }, { new: true });
    await notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error processing payment" }); }
});

// 5. CONFIRMS PAYMENT
router.put('/:id/confirm-payment', verifyToken, async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    await notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error confirming payment" }); }
});

// 6. RESCHEDULE BOOKING
router.put('/:id/reschedule', verifyToken, async (req, res) => {
  try {
    const { date, time } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { date, time, status: 'Pending' }, { new: true });
    
    // Notify the Provider that the customer requested a reschedule
    if (updatedBooking.providerId) {
      try {
        const notif = new Notification({
          userId: updatedBooking.providerId,
          text: `Customer rescheduled ${updatedBooking.service} to ${date} at ${time}.`,
          type: 'status'
        });
        await notif.save();
        if (req.io) req.io.to(updatedBooking.providerId.toString()).emit('receive_notification', notif);
      } catch(e) {}
    }
    
    await notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error rescheduling booking" }); }
});

module.exports = router;