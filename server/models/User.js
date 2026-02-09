const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Make firebaseUid optional because manual users won't have it
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    default: 'customer',
    enum: ['customer', 'provider']
  },
  // Add Password field for manual auth
  password: {
    type: String,
    // Only required if firebaseUid is missing
    required: function() { return !this.firebaseUid; }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);