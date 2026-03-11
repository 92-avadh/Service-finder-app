import React, { useState } from 'react';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('serviceFinderToken');
      
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id || booking.id,
          rating,
          text
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(); // Close modal and maybe show a success toast
      } else {
        alert(data.message || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("A server error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-display">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 zoom-in-95">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rate your experience</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">with {booking.provider}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Interactive Star Rating */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={`material-symbols-outlined text-4xl ${
                    (hoverRating || rating) >= star 
                      ? 'text-yellow-400 fill-current font-variation-settings-[\\"FILL\\",1]' 
                      : 'text-slate-300 dark:text-slate-700'
                  }`}>
                    star
                  </span>
                </button>
              ))}
            </div>
            <span className="text-sm font-bold text-slate-500">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Write a Review</label>
            <textarea 
              rows="4" 
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How was the service? Would you recommend them?"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !text.trim()}
            className="w-full py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ReviewModal;