const express = require('express');
const router = express.Router();
const { googleLogin, manualSignup, manualLogin } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Google Auth Route
router.post('/google', verifyToken, googleLogin);

// Manual Auth Routes (No token verification needed for these)
router.post('/signup', manualSignup);
router.post('/login', manualLogin);

module.exports = router;