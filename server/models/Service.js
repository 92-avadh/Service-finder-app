const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  unit: {               // <--- NEW UNIT FIELD
    type: String,
    default: "hr"
  },
  rating: {
    type: Number,
    default: 4.5
  },
  image: {
    type: String
  },
  provider: {
    type: String,
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);