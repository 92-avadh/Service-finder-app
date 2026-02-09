const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Generate a unique ID for this server instance (Server Start Time)
const BOOT_ID = Date.now().toString();

// Middleware
app.use(express.json());

// Configure CORS to allow the frontend to read the custom header
app.use(cors({
  origin: 'http://localhost:3000', // Adjust if your frontend port differs
  exposedHeaders: ['x-boot-id']
}));

// Global Middleware to attach Server Boot ID to every response
app.use((req, res, next) => {
  res.setHeader('x-boot-id', BOOT_ID);
  next();
});

// Health Check Endpoint for Session Validation
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', bootId: BOOT_ID });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`🆔 Server Boot ID: ${BOOT_ID}`);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));