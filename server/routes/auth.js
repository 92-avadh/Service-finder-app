const express = require('express');
const router = express.Router();
const { 
  googleLogin, 
  manualSignup, 
  manualLogin, 
  completeProfile, 
  deleteAccount // <--- Added this
} = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Public routes
router.post('/google', googleLogin);
router.post('/signup', manualSignup);
router.post('/login', manualLogin);

// Protected routes (requires token)
router.put('/complete-profile', verifyToken, completeProfile);
router.delete('/delete-account', verifyToken, deleteAccount); // <--- New Route!

module.exports = router;