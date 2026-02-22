const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Needed for Google verification

// Helper function to generate our custom JWT
const generateToken = (id, email, role) => {
  // Uses the secret from .env, or a fallback for development
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
    expiresIn: '30d', // Token lasts for 30 days
  });
};

// --- GOOGLE LOGIN ---
const googleLogin = async (req, res) => {
  try {
    // 1. Get the Google Access Token sent from the frontend
    const googleToken = req.headers.authorization?.split(' ')[1];
    if (!googleToken) {
      return res.status(401).json({ message: 'No Google token provided' });
    }

    // 2. Verify with Google's API directly here
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${googleToken}` } }
    );
    
    const { sub: uid, email, name, picture } = googleResponse.data;
    const { role } = req.body;

    // 3. Find or Create User in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name || 'User',
        email: email,
        firebaseUid: uid,
        image: picture,
        role: role || 'customer',
      });
      await user.save();
    }

    // 4. Generate OUR custom token
    const token = generateToken(user._id, user.email, user.role);

    res.status(200).json({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Google login error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Server error during Google auth' });
  }
};

// --- MANUAL SIGNUP ---
const manualSignup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      image: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, image: user.image };
    res.status(201).json({ message: 'Signup successful', user: userData, token });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- MANUAL LOGIN ---
const manualLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password) return res.status(400).json({ message: 'Please login with Google' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, image: user.image };
    res.status(200).json({ message: 'Login successful', user: userData, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
// --- COMPLETE PROVIDER PROFILE ---
const completeProfile = async (req, res) => {
  try {
    const { title, serviceType, experience, location, about, price, image } = req.body;
    
    // Find the logged-in user using the token
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields
    user.title = title;
    user.serviceType = serviceType;
    user.experience = experience;
    user.location = location;
    user.about = about;
    user.price = price;
    if (image) user.image = image;
    
    user.isProfileComplete = true; // Mark as complete!

    await user.save();

    // Send back the updated user data
    const userData = {
      _id: user._id, name: user.name, email: user.email, 
      role: user.role, image: user.image, isProfileComplete: true
    };

    res.status(200).json({ message: 'Profile completed successfully', user: userData });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
// --- CANCEL SIGNUP / DELETE ACCOUNT ---
const deleteAccount = async (req, res) => {
  try {
    // req.user.id comes from the verifyToken middleware
    const userId = req.user.id; 
    
    // Find the user and delete them from the database
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};

// Update your exports to include deleteAccount!
module.exports = { googleLogin, manualSignup, manualLogin, completeProfile, deleteAccount };
