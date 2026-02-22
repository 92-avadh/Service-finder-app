import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// YOUR EXACT STRIPE TEST KEY
const stripePromise = loadStripe('pk_test_51T39EgDRydSsxFQ79Yvw10kvW773dmSbiiElC6dZEzIbaMciU1wycJqsE9WJSFNIXWNmXbG40QPhTm1zVQmQPkjY00GxAlABvC');

const CardForm = ({ booking, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('serviceFinderToken');
    
    try {
      // 1. Ask backend for the secret intent
      const res = await fetch('https://service-finder-app.onrender.com/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ price: booking.finalPrice })
      });
      const { clientSecret } = await res.json();

      // 2. Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (stripeError) { 
        setError(stripeError.message); 
        setLoading(false); 
      }
      else if (paymentIntent.status === 'succeeded') {
        // 3. Mark as paid in DB
        await fetch(`https://service-finder-app.onrender.com/api/bookings/${booking._id}/pay`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ paymentMethod: 'Card' })
        });
        onSuccess();
      }
    } catch (err) {
      setError("An error occurred during payment processing.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } } } }} />
      </div>
      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
      <button type="submit" disabled={loading || !stripe} className="w-full py-3.5 bg-primary hover:bg-blue-600 transition-colors text-white rounded-xl font-bold shadow-md shadow-primary/20 disabled:opacity-50">
        {loading ? "Processing..." : `Pay ₹${booking.finalPrice}`}
      </button>
    </form>
  );
};

const CheckoutModal = ({ booking, onClose, onSuccess }) => {
  const [method, setMethod] = useState('card');
  const [isProcessingCOD, setIsProcessingCOD] = useState(false);

  const handleCOD = async () => {
    setIsProcessingCOD(true);
    try {
      const token = localStorage.getItem('serviceFinderToken');
      const res = await fetch(`https://service-finder-app.onrender.com/api/bookings/${booking._id}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ paymentMethod: 'COD' })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      alert("Error confirming Cash on Delivery");
    } finally {
      setIsProcessingCOD(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-display">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-black dark:text-white">Complete Payment</h3>
            <p className="text-sm text-slate-500 mt-1">Choose how you want to pay</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Toggle Card vs COD */}
          <div className="mb-6 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setMethod('card')} 
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${method === 'card' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Pay Online
            </button>
            <button 
              onClick={() => setMethod('cod')} 
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${method === 'cod' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Cash / UPI Direct
            </button>
          </div>

          {/* Amount Due Box */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex justify-between items-center border border-blue-100 dark:border-blue-900/50">
            <span className="font-bold text-blue-800 dark:text-blue-300">Total Due</span>
            <span className="text-2xl font-black text-blue-900 dark:text-white">₹{booking.finalPrice}</span>
          </div>

          {/* Render Active Payment Form */}
          {method === 'card' ? (
            <Elements stripe={stripePromise}>
              <CardForm booking={booking} onSuccess={onSuccess} />
            </Elements>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 text-center">
                You will pay the professional directly in cash or via their personal UPI after the service is fully completed.
              </p>
              <button 
                onClick={handleCOD} 
                disabled={isProcessingCOD} 
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 transition-colors text-white rounded-xl font-bold shadow-md shadow-green-600/20"
              >
                {isProcessingCOD ? 'Processing...' : 'Confirm Cash Payment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;