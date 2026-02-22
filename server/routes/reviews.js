const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// --- SUBMIT A NEW REVIEW ---
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookingId, rating, text } = req.body;
    const customerId = req.user.id;
    const customerName = req.user.name || req.user.email.split('@')[0];

    // 1. Verify the booking exists and is Completed
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'Completed') {
      return res.status(400).json({ message: "You can only review completed jobs." });
    }

    // 2. Prevent duplicate reviews for the same booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this job." });
    }

    // 3. Find the provider's actual ID based on their name in the booking
    const provider = await User.findOne({ name: booking.provider, role: 'provider' });
    if (!provider) {
      return res.status(404).json({ message: "Provider account no longer exists." });
    }

    // 4. Save the review
    const newReview = new Review({
      providerId: provider._id,
      customerId,
      bookingId,
      customerName,
      rating,
      text
    });

    await newReview.save();
    res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error submitting review" });
  }
});

// --- GET REVIEWS FOR A SPECIFIC PROVIDER ---
router.get('/provider/:providerId', async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error fetching reviews" });
  }
});

module.exports = router;