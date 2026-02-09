const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- GOOGLE LOGIN ---
const googleLogin = async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;
    const { role } = req.body;

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

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- MANUAL SIGNUP ---
const manualSignup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Return 400 if user exists
      return res.status(400).json({ message: 'User already exists' });
    }

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

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image
    };

    res.status(201).json({ message: 'Signup successful', user: userData });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- MANUAL LOGIN (UPDATED WITH LOGS) ---
const manualLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for: ${email}`); // <--- LOG 1

    // 1. Check user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found"); // <--- LOG 2
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Check if user was created via Google (no password)
    if (!user.password) {
      console.log("User has no password (Google Account)"); // <--- LOG 3
      return res.status(400).json({ message: 'Please login with Google' });
    }

    // 3. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch"); // <--- LOG 4
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log("Login successful"); // <--- LOG 5

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image
    };

    res.status(200).json({ message: 'Login successful', user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { googleLogin, manualSignup, manualLogin };