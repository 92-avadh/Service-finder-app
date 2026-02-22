const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 

dotenv.config();

const app = express();

const server = http.createServer(app);

// --- CORS & SOCKET SETUP ---
const io = new Server(server, {
  cors: {
    // IMPORTANT: Add your Vercel URL here so it has permission to connect!
    origin: ["http://localhost:3000", "https://your-vercel-frontend-url.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware to make 'io' accessible in all routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Used for real-time status updates on the Dashboard
  socket.on('join_dashboard', (userId) => {
    const room = String(userId);
    socket.join(room);
    console.log(`User joined dashboard room: ${room}`);
  });

  // Used for real-time chat messages
  socket.on('join_chat_room', (bookingId) => {
    const room = String(bookingId);
    socket.join(room);
    console.log(`User joined chat room: ${room}`);
  });

  // Used for the Navbar Notification Bell
  socket.on('join_notification_room', (userId) => {
    const room = String(userId);
    socket.join(room);
    console.log(`User joined notification room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// General Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://your-vercel-frontend-url.vercel.app"]
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat'); 
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users'); 
const paymentRoutes = require('./routes/payments'); 

// --- HEALTH CHECK ROUTE ---
app.get('/', (req, res) => {
  res.send('🚀 ServiceFinder API is Live and Running perfectly on Render!');
});

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/payments', paymentRoutes); 

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Service-db')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});