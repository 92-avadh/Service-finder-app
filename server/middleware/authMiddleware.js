const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Get token from the header (Format: "Bearer <token>")
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    // 2. Verify the custom JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');
    
    // 3. Attach decoded user data (id, email, role) to the request object
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;