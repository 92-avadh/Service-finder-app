const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: { type: String, required: true },
  provider: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true }, // The original estimated price
  image: { type: String },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Confirmed', 'Completed', 'Payment Pending', 'Paid', 'Cancelled']
  },
  paymentMethod: { type: String }, // 'Card' or 'COD'
  
  // --- NEW INVOICE FIELDS ---
  invoiceItems: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  finalPrice: { type: Number } // The calculated total from invoiceItems
  
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);