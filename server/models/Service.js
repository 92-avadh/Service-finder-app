const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  image: { type: String, required: true },
  about: { type: String }, // Description of the pro
  isFeatured: { type: Boolean, default: false } // To show on Home page
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);