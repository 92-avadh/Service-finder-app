const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  image: {
    type: String, // URL of the service/provider image
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);