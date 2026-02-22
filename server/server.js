const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('io', io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_dashboard', (userId) => {
    // FIX: Safely parse to string so it perfectly joins the right room
    socket.join(String(userId));
    console.log(`User joined personal dashboard room: ${userId}`);
  });

  socket.on('join_chat_room', (bookingId) => {
    socket.join(bookingId);
  });

  socket.on('join_notification_room', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat'); 
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users'); 
const paymentRoutes = require('./routes/payments'); 

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/payments', paymentRoutes); 

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Service-db')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});