const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const Stripe = require('stripe');

// Initialize Stripe with your secret key from the .env file
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', verifyToken, async (req, res) => {
  try {
    const { price } = req.body; 

    // Clean the price string (e.g., if it says "₹499/hr" -> 499)
    const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
    
    if (numericPrice <= 0) {
      return res.status(400).json({ message: "Invalid price." });
    }

    // Stripe expects the amount in the smallest currency unit (paise/cents)
    const amount = Math.round(numericPrice * 100);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr', 
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Failed to create payment intent." });
  }
});

module.exports = router;