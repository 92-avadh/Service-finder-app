const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  role: { type: String, enum: ['customer', 'provider'], default: 'customer' },
  
  phone: { type: String }, // <--- NEW MOBILE NUMBER FIELD
  
  title: { type: String },
  serviceType: { type: String },
  price: { type: String },
  location: { type: String },
  about: { type: String },
  experience: { type: String },
  image: { type: String },
  isProfileComplete: { type: Boolean, default: false },

  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);