const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const verifyToken = require('../middleware/authMiddleware');

const notifyUsers = (req, booking) => {
  if (req.io) {
    if (booking.customerEmail) req.io.to(booking.customerEmail).emit('booking_status_updated', booking);
    if (booking.providerId) req.io.to(booking.providerId.toString()).emit('booking_status_updated', booking);
  }
};

// GET PROVIDER BOOKINGS
router.get('/provider', verifyToken, async (req, res) => {
  try {
    // FIX: Safely parse to string so it perfectly matches DB
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
      req.io.to(savedBooking.providerId.toString()).emit('new_booking_request', savedBooking);
    }
    
    res.status(201).json(savedBooking);
  } catch (error) { res.status(500).json({ message: "Error creating booking" }); }
});

// 1. STANDARD STATUS UPDATE
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    let updateData = { status };

    if (status === 'Confirmed') {
      updateData.startOtp = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error updating status" }); }
});

// 2. VERIFY OTP
router.put('/:id/start', verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (booking.startOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please check with the customer." });
    }

    booking.status = 'In Progress';
    await booking.save();
    notifyUsers(req, booking); 
    res.status(200).json(booking);
  } catch (error) { res.status(500).json({ message: "Error verifying OTP" }); }
});

// 3. SENDS BILL
router.put('/:id/bill', verifyToken, async (req, res) => {
  try {
    const { finalPrice } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'Payment Pending', finalPrice: finalPrice }, { new: true });
    notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error sending bill" }); }
});

// 4. CUSTOMER PAYS
router.put('/:id/pay', verifyToken, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const newStatus = paymentMethod === 'COD' ? 'Payment Verification' : 'Completed';
    
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: newStatus, paymentMethod }, { new: true });
    notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error processing payment" }); }
});

// 5. CONFIRMS PAYMENT
router.put('/:id/confirm-payment', verifyToken, async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error confirming payment" }); }
});
// 6. RESCHEDULE BOOKING
router.put('/:id/reschedule', verifyToken, async (req, res) => {
  try {
    const { date, time } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { date, time, status: 'Pending' }, // Sets back to pending so pro can re-confirm
      { new: true }
    );
    notifyUsers(req, updatedBooking); // Real-time socket update!
    res.status(200).json(updatedBooking);
  } catch (error) { 
    res.status(500).json({ message: "Error rescheduling booking" }); 
  }
});
module.exports = router;