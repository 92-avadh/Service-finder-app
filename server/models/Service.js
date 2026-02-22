const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const Review = require('../models/Review'); // <--- Added Review model

// --- GET ALL ACTIVE PROFESSIONALS ---
router.get('/', async (req, res) => {
  try {
    const providers = await User.find({ 
      role: 'provider', 
      isProfileComplete: true 
    }).select('-password -firebaseUid');

    // Dynamically calculate reviews for each provider
    const formattedServices = await Promise.all(providers.map(async (provider) => {
      // Find all reviews for this specific provider
      const reviews = await Review.find({ providerId: provider._id });
      const reviewCount = reviews.length;
      
      // Calculate average rating (e.g., 4.5)
      const averageRating = reviewCount > 0 
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) 
        : 0;

      return {
        _id: provider._id,
        name: provider.name,
        title: provider.title,
        category: provider.serviceType,
        price: provider.price,
        location: provider.location,
        image: provider.image,
        about: provider.about,
        experience: provider.experience,
        // Send real stats instead of hardcoded numbers!
        rating: reviewCount > 0 ? parseFloat(averageRating) : "New",
        reviews: reviewCount
      };
    }));

    res.status(200).json(formattedServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: 'Server error fetching services' });
  }
});

// --- GET SINGLE PROFESSIONAL ---
router.get('/:id', async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('-password -firebaseUid');
    if (!provider) return res.status(404).json({ message: 'Professional not found' });

    // Dynamically fetch their specific stats
    const reviews = await Review.find({ providerId: provider._id });
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0;

    const formattedService = {
      _id: provider._id,
      name: provider.name,
      title: provider.title,
      category: provider.serviceType,
      price: provider.price,
      location: provider.location,
      image: provider.image,
      about: provider.about,
      experience: provider.experience,
      rating: reviewCount > 0 ? parseFloat(averageRating) : "New",
      reviews: reviewCount,
      services: [provider.serviceType]
    };

    res.status(200).json(formattedService);
  } catch (error) {
    console.error("Error fetching single service:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;