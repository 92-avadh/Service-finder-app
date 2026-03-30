const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit'); 

// --- HELPER TO GENERATE DB NOTIFICATIONS & REAL-TIME EVENTS ---
const notifyUsers = async (req, booking) => {
  try {
    const customer = await User.findById(booking.customer);

    if (req.io) {
      if (customer && customer.email) req.io.to(customer.email).emit('booking_status_updated', booking);
      if (booking.providerId) req.io.to(booking.providerId.toString()).emit('booking_status_updated', booking);
    }

    if (customer) {
      const notif = new Notification({
        userId: customer._id,
        text: `Your booking for ${booking.service} is now ${booking.status}.`,
        type: 'status'
      });
      await notif.save();
      if (req.io) req.io.to(customer.email).emit('receive_notification', notif);
    }

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
    // FIXED: Match by customer ObjectId
    const customerId = req.user.id || req.user._id;
    const bookings = await Booking.find({ customer: customerId }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) { res.status(500).json({ message: "Error fetching bookings" }); }
});

// INITIAL BOOKING CREATION
router.post('/', verifyToken, async (req, res) => {
  try {
    // FIXED: Explicitly attach the customer ID to pass MongoDB validation
    const newBooking = new Booking({ 
      ...req.body, 
      customer: req.user.id || req.user._id 
    });
    
    const savedBooking = await newBooking.save();
    
    if (req.io && savedBooking.providerId) {
      req.io.to(savedBooking.providerId.toString()).emit('new_booking_request', savedBooking);
      try {
        const notif = new Notification({ userId: savedBooking.providerId, text: `New booking request for ${savedBooking.service}!`, type: 'status' });
        await notif.save();
        req.io.to(savedBooking.providerId.toString()).emit('receive_notification', notif);
      } catch(e) { console.error(e); }
    }
    res.status(201).json(savedBooking);
  } catch (error) { 
    console.error("Booking Creation Error:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message }); 
  }
});

// 1. STANDARD STATUS UPDATE (FIXED OTP GENERATION)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    let updateData = { status };
    
    // Explicitly generate the OTP when status moves to Confirmed
    if (status === 'Confirmed') {
      updateData.startOtp = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    await notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { 
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Error updating status" }); 
  }
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

// 3. SENDS ITEMIZED BILL
router.put('/:id/bill', verifyToken, async (req, res) => {
  try {
    const { invoiceItems } = req.body;
    const finalPrice = invoiceItems.reduce((total, item) => total + Number(item.amount), 0);

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status: 'Payment Pending', invoiceItems: invoiceItems, finalPrice: finalPrice }, 
      { new: true }
    );
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
    
    if (updatedBooking.providerId) {
      try {
        const notif = new Notification({ userId: updatedBooking.providerId, text: `Customer rescheduled ${updatedBooking.service} to ${date} at ${time}.`, type: 'status' });
        await notif.save();
        if (req.io) req.io.to(updatedBooking.providerId.toString()).emit('receive_notification', notif);
      } catch(e) {}
    }
    
    await notifyUsers(req, updatedBooking); 
    res.status(200).json(updatedBooking);
  } catch (error) { res.status(500).json({ message: "Error rescheduling booking" }); }
});

// 7. DOWNLOAD INVOICE PDF (FIXED FALLBACK)
router.get('/:id/invoice', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-disposition', `attachment; filename="Invoice-${booking._id}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // Build PDF Content
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' }).moveDown();
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Booking ID: ${booking._id}`);
    doc.text(`Date of Service: ${new Date(booking.date).toLocaleDateString()}`);
    doc.text(`Service: ${booking.service}`);
    doc.text(`Professional: ${booking.provider}`);
    doc.moveDown(2);

    doc.fontSize(16).font('Helvetica-Bold').text('Charges', { underline: true }).moveDown();
    doc.fontSize(12).font('Helvetica');

    let totalAmountToPay = booking.finalPrice || booking.price || 0;

    if (booking.invoiceItems && booking.invoiceItems.length > 0) {
      booking.invoiceItems.forEach(item => {
        doc.text(`${item.description}`, { continued: true });
        doc.text(`Rs. ${item.amount}`, { align: 'right' });
      });
    } else {
      doc.text(`Standard Service Charge`, { continued: true });
      doc.text(`Rs. ${totalAmountToPay}`, { align: 'right' });
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(); 

    doc.fontSize(18).font('Helvetica-Bold').text(`Total Amount: Rs. ${totalAmountToPay}`, { align: 'right' });

    if(booking.status === 'Completed' || booking.status === 'Paid') {
        doc.moveDown(2).fillColor('green').fontSize(20).text('PAID IN FULL', { align: 'center' });
    }

    doc.end();

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

module.exports = router;