import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const ServiceDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [favoriteIds, setFavoriteIds] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/services/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setService(data);

          if (data._id) {
            const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/provider/${data._id}`);
            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json();
              setReviews(reviewsData);
            }
          }
        } else {
          setError("Service not found");
        }
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Failed to load service details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && id !== 'demo') {
      fetchServiceDetails();
    } else {
      setService({
        name: "Michael Foster",
        title: "Expert Residential Electrician",
        category: "Electrical",
        price: 499,
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600",
        about: "I have over 10 years of experience in residential and commercial electrical systems.",
        location: "Mumbai, Maharashtra",
        rating: 4.9,
        phone: "9876543210"
      });
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser || currentUser.role !== 'customer') return;
      try {
        // FIXED: Now uses sessionStorage
        const token = sessionStorage.getItem('serviceFinderToken');
        const response = await fetch('http://localhost:5000/api/users/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFavoriteIds(data.map(fav => fav._id));
        }
      } catch (error) { console.error("Error fetching favorites:", error); }
    };
    fetchFavorites();
  }, [currentUser]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      alert("Please log in to save favorites.");
      navigate('/login');
      return;
    }
    if (currentUser.role === 'provider') {
      alert("Professionals cannot save favorites.");
      return;
    }
    try {
      // FIXED: Now uses sessionStorage
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch('http://localhost:5000/api/users/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ providerId: service._id })
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteIds(data.favorites);
      }
    } catch (error) {}
  };

  const handleInitiateBooking = async () => {
    if (!currentUser) {
      alert("Please log in or sign up to book a service.");
      navigate('/login');
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and a time for your appointment.");
      return;
    }
    if (!address.trim()) {
      alert("Please provide your full address so the professional can reach you.");
      return;
    }

    try {
      setIsProcessingBooking(true);
      // FIXED: Now uses sessionStorage to get the active token
      const token = sessionStorage.getItem('serviceFinderToken');

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: service.title || service.category || 'Service',
          provider: service.name || service.provider,
          providerId: service._id, 
          address: address.trim(), 
          date: selectedDate,
          time: selectedTime,
          price: service.price, 
          image: service.image
        })
      });

      if (response.ok) {
        alert("Booking request sent! The professional will confirm it shortly.");
        navigate('/dashboard'); 
      } else {
        alert("Failed to create booking request.");
      }
    } catch (error) {
      alert("A server error occurred while sending the request.");
    } finally {
      setIsProcessingBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f1117]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f1117]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
           <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">error</span>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Oops! {error}</h2>
           <Link to="/services" className="text-primary font-bold hover:underline">Browse other services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f1117] font-display">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <nav className="flex text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/services" className="hover:text-primary transition-colors">{service.category || 'Services'}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white font-bold">{service.name || service.provider}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <img 
                src={service.image || "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600"} 
                alt={service.name} 
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-md z-10"
              />
              <div className="flex-1 z-10 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{service.name || service.provider}</h1>
                    <p className="text-primary font-bold mt-1 text-lg">{service.title || service.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-xl border border-yellow-200 dark:border-yellow-700/50 shadow-sm">
                    <span className="material-symbols-outlined text-yellow-500 text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="font-black text-slate-900 dark:text-yellow-500">{service.rating || 'New'}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">location_on</span>
                    {service.location || 'Local Professional'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">call</span>
                    <span className="text-slate-900 dark:text-white font-bold">{service.phone || "Number Hidden"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-green-500">verified</span>
                    <span className="text-green-600 dark:text-green-400">Background Checked</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                About this Service
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {service.about || "This professional offers top-tier services in their field."}
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-full">
                            {review.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{review.customerName}</h4>
                            <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`material-symbols-outlined text-[18px] ${i < review.rating ? 'font-variation-settings-["FILL",1]' : 'text-slate-300 dark:text-slate-700'}`}
                              style={i < review.rating ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">"{review.text}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 font-medium">No reviews yet. Book this service to be the first!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between items-end mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Estimated Rate</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">₹{service.price}</span>
                  <span className="text-slate-500 text-sm ml-1">/ hr</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">1. Select Date</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">calendar_today</span>
                  <input 
                    type="date" 
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">2. Select Time</label>
                <div className="grid grid-cols-2 gap-3">
                  {["08:00 AM", "09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM", "06:00 PM"].map((time) => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 px-2 text-sm font-bold rounded-xl border-2 transition-all ${
                        selectedTime === time 
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">3. Your Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 material-symbols-outlined text-slate-400">home</span>
                  <textarea 
                    rows="3"
                    required
                    placeholder="Enter full address so the professional can find you..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={toggleFavorite}
                  className="px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-200 dark:hover:border-red-900/50 transition-colors flex items-center justify-center group"
                  title="Save to favorites"
                >
                  <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${favoriteIds.includes(service._id) ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`} style={favoriteIds.includes(service._id) ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                </button>
                
                <button 
                  onClick={handleInitiateBooking}
                  disabled={isProcessingBooking}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 text-lg ${
                    isProcessingBooking 
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-blue-600 shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98]'
                  }`}
                >
                  {isProcessingBooking ? (
                    <><span className="material-symbols-outlined animate-spin">autorenew</span> Requesting...</>
                  ) : "Send Request"}
                </button>
              </div>
              <p className="text-xs text-center text-slate-500 mt-4 font-medium">You will only be charged after the service is completed.</p>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServiceDetails;