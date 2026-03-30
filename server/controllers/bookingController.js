const Booking = require('../models/Booking');
const PDFDocument = require('pdfkit');

// Standard Booking Functions
exports.createBooking = async (req, res) => {
  try {
    const newBooking = new Booking({
      ...req.body,
      customer: req.user.id // Assuming your auth middleware sets req.user
    });
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    // If user is a provider, fetch bookings where providerId matches. Else, match customer.
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

    // Auto-calculate the total price on the backend
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

// 2. Customer downloads the PDF
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!booking.invoiceItems || booking.invoiceItems.length === 0) {
      return res.status(400).json({ message: "No invoice generated yet." });
    }

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

    // Loop through items
    doc.fontSize(12).font('Helvetica');
    booking.invoiceItems.forEach(item => {
      doc.text(`${item.description}`, { continued: true });
      doc.text(`₹${item.amount}`, { align: 'right' });
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(); // draw a line

    doc.fontSize(18).font('Helvetica-Bold').text(`Total Amount: ₹${booking.finalPrice}`, { align: 'right' });

    if(booking.status === 'Paid') {
        doc.moveDown().fillColor('green').text('PAID IN FULL', { align: 'center' });
    }

    doc.end();

  } catch (error) {
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};