import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// LOAD STRIPE WITH YOUR PUBLISHABLE KEY
const stripePromise = loadStripe('pk_test_51T39EgDRydSsxFQ79Yvw10kvW773dmSbiiElC6dZEzIbaMciU1wycJqsE9WJSFNIXWNmXbG40QPhTm1zVQmQPkjY00GxAlABvC');

const CheckoutForm = ({ clientSecret, bookingData, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    // 1. Confirm the card payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: bookingData.provider,
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // 2. Payment was successful! Now save the booking to the DB.
      try {
        const token = localStorage.getItem('serviceFinderToken');
        const response = await fetch('https://service-finder-app.onrender.com/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bookingData)
        });

        if (response.ok) {
          onSuccess();
        } else {
          setError("Payment succeeded, but we couldn't save your booking. Please contact support.");
        }
      } catch (err) {
        console.error("Booking save error:", err);
        setError("A server error occurred while saving the booking.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#ef4444' },
          },
        }} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing Payment...' : `Pay ₹${parseFloat(String(bookingData.price).replace(/[^0-9.]/g, ''))} securely`}
      </button>
    </form>
  );
};

const PaymentModal = ({ clientSecret, bookingData, onSuccess, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-display">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 zoom-in-95">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Secure Checkout</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete your booking</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm 
            clientSecret={clientSecret} 
            bookingData={bookingData} 
            onSuccess={onSuccess} 
            onClose={onClose} 
          />
        </Elements>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900 text-center border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
           <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payments secured by Stripe</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;