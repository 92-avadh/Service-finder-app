const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const Review = require('../models/Review'); 

// --- GET FEATURED PROFESSIONALS ---
router.get('/featured', async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider', isProfileComplete: true }).select('-password -firebaseUid');

    const formattedServices = await Promise.all(providers.map(async (provider) => {
      const reviews = await Review.find({ providerId: provider._id });
      const reviewCount = reviews.length;
      const averageRating = reviewCount > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0;

      return {
        _id: provider._id,
        name: provider.name,
        phone: provider.phone, 
        title: provider.title,
        category: provider.serviceType,
        price: provider.price,
        unit: provider.unit, // <--- ADDED UNIT HERE
        location: provider.location,
        image: provider.image,
        rating: reviewCount > 0 ? parseFloat(averageRating) : 0, 
        reviews: reviewCount
      };
    }));

    const topProviders = formattedServices.sort((a, b) => b.rating - a.rating).slice(0, 3);
    const finalDisplayProviders = topProviders.map(p => ({ ...p, rating: p.rating === 0 ? "New" : p.rating }));

    res.status(200).json(finalDisplayProviders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching featured services' });
  }
});

// --- GET ALL PROFESSIONALS w/ SEARCH & FILTER ---
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { role: 'provider', isProfileComplete: true };
    
    if (category && category !== 'All') query.serviceType = category;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { serviceType: { $regex: search, $options: 'i' } }
      ];
    }

    const providers = await User.find(query).select('-password -firebaseUid');

    const formattedServices = await Promise.all(providers.map(async (provider) => {
      const reviews = await Review.find({ providerId: provider._id });
      const reviewCount = reviews.length;
      const averageRating = reviewCount > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0;

      return {
        _id: provider._id,
        name: provider.name,
        phone: provider.phone, 
        title: provider.title,
        category: provider.serviceType,
        price: provider.price,
        unit: provider.unit, // <--- ADDED UNIT HERE
        location: provider.location,
        image: provider.image,
        about: provider.about,
        experience: provider.experience,
        rating: reviewCount > 0 ? parseFloat(averageRating) : "New",
        reviews: reviewCount
      };
    }));

    res.status(200).json(formattedServices);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching services' });
  }
});

// --- GET SINGLE PROFESSIONAL ---
router.get('/:id', async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('-password -firebaseUid');
    if (!provider) return res.status(404).json({ message: 'Professional not found' });

    const reviews = await Review.find({ providerId: provider._id });
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0;

    const formattedService = {
      _id: provider._id,
      name: provider.name,
      phone: provider.phone, 
      title: provider.title,
      category: provider.serviceType,
      price: provider.price,
      unit: provider.unit, // <--- ADDED UNIT HERE
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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;