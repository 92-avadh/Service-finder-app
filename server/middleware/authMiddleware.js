const axios = require('axios');

const verifyToken = async (req, res, next) => {
  // 1. Get the token from the header
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // 2. Verify token by calling Google's API directly
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const googleUser = googleResponse.data;

    // 3. Map Google data to what your controller expects
    req.user = {
      uid: googleUser.sub, // 'sub' is the unique Google ID
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error.response?.data || error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;