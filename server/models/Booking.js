const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: { type: String, required: true },
  provider: { type: String, required: true },
  providerId: { type: String }, 
  customerEmail: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: String, required: true }, 
  image: { type: String },
  
  // NEW: Store the 4-digit OTP
  startOtp: { type: String },
  
  status: { type: String, default: 'Pending' }, 
  finalPrice: { type: Number },
  paymentMethod: { type: String }

}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);