const Booking = require('../models/Booking');
const PDFDocument = require('pdfkit');

// Standard Booking Functions
exports.createBooking = async (req, res) => {
  try {
    const newBooking = new Booking({
      ...req.body,
      customer: req.user.id 
    });
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const query = req.user.role === 'provider' 
      ? { providerId: req.user.id } 
      : { customer: req.user.id };
      
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

exports.payBooking = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', paymentMethod },
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
};

// --- NEW INVOICE FUNCTIONS ---

// 1. Provider submits the itemized bill
exports.submitItemizedBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceItems } = req.body;

    const finalPrice = invoiceItems.reduce((total, item) => total + Number(item.amount), 0);

    const booking = await Booking.findByIdAndUpdate(
      id, 
      { invoiceItems, finalPrice, status: 'Payment Pending' }, 
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error submitting bill", error: error.message });
  }
};

// 2. Customer downloads the PDF (FIXED FALLBACK)
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Initialize PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-disposition', `attachment; filename="Invoice-${booking._id}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Build PDF content
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' }).moveDown();
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Booking ID: ${booking._id}`);
    doc.text(`Date of Service: ${new Date(booking.date).toLocaleDateString()}`);
    doc.text(`Service: ${booking.service}`);
    doc.text(`Provider: ${booking.provider}`);
    doc.moveDown(2);

    doc.fontSize(16).font('Helvetica-Bold').text('Itemized Charges', { underline: true }).moveDown();

    let totalAmountToPay = booking.finalPrice || booking.price || 0;

    // Loop through items or use fallback
    doc.fontSize(12).font('Helvetica');
    if (booking.invoiceItems && booking.invoiceItems.length > 0) {
      booking.invoiceItems.forEach(item => {
        doc.text(`${item.description}`, { continued: true });
        doc.text(`₹${item.amount}`, { align: 'right' });
      });
    } else {
        doc.text(`Standard Service Charge`, { continued: true });
        doc.text(`₹${totalAmountToPay}`, { align: 'right' });
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(); 

    doc.fontSize(18).font('Helvetica-Bold').text(`Total Amount: ₹${totalAmountToPay}`, { align: 'right' });

    if(booking.status === 'Paid' || booking.status === 'Completed') {
        doc.moveDown().fillColor('green').text('PAID IN FULL', { align: 'center' });
    }

    doc.end();

  } catch (error) {
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};