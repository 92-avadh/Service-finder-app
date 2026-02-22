const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const Review = require('../models/Review');

// --- TOGGLE FAVORITE (Add / Remove) ---
router.post('/favorites/toggle', verifyToken, async (req, res) => {
  try {
    const { providerId } = req.body;
    const customerId = req.user.id || req.user._id;

    const user = await User.findById(customerId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.favorites) {
      user.favorites = [];
    }

    const isFavorite = user.favorites.some(id => id.toString() === providerId.toString());

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== providerId.toString());
    } else {
      user.favorites.push(providerId);
    }

    await user.save();
    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Server error toggling favorite" });
  }
});

// --- GET ALL FAVORITED PROFESSIONALS ---
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;
    const user = await User.findById(customerId).populate('favorites', '-password -firebaseUid');
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const favoritesList = user.favorites || [];

    const formattedFavorites = await Promise.all(favoritesList.map(async (provider) => {
      const reviews = await Review.find({ providerId: provider._id });
      const reviewCount = reviews.length;
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
        rating: reviewCount > 0 ? parseFloat(averageRating) : "New",
        reviews: reviewCount
      };
    }));

    res.status(200).json(formattedFavorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Server error fetching favorites" });
  }
});

// --- UPDATE USER PROFILE (Used for Edit Profile & Complete Profile) ---
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    // Update the user and return the new data (excluding password)
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      req.body, 
      { new: true }
    ).select('-password');
    
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;