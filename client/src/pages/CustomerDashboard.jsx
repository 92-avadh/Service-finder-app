import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import ReviewModal from '../components/ReviewModal'; 
import CheckoutModal from '../components/CheckoutModal'; 
import { io } from 'socket.io-client'; 

const CustomerDashboard = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [bookings, setBookings] = useState([]);
  
  const [favorites, setFavorites] = useState([]);
  const [isFetchingFavs, setIsFetchingFavs] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [activeChatBooking, setActiveChatBooking] = useState(null); 
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);
  
  // --- NEW: RESCHEDULE STATES ---
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const userName = currentUser?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || "User";
  const userImage = currentUser?.image || currentUser?.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const userEmail = currentUser?.email;

  const fetchMyBookings = useCallback(async () => {
    if (!userEmail) return;
    try {
      setIsLoading(true);
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings?email=${userEmail}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      if (response.ok) setBookings(await response.json() || []);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }, [userEmail]);

  useEffect(() => { fetchMyBookings(); }, [fetchMyBookings]);

  useEffect(() => {
    if (!userEmail) return;
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const socket = io('http://localhost:5000');
    socket.emit('join_dashboard', String(userEmail));
    socket.on('booking_status_updated', (updatedBooking) => {
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
      if (Notification.permission === 'granted') new Notification('Booking Update! 🔔', { body: `Your job status is now: ${updatedBooking.status}` });
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
    });
    return () => socket.disconnect();
  }, [userEmail]);

  useEffect(() => {
    if (activeNav === 'favorites') {
      const fetchFavorites = async () => {
        setIsFetchingFavs(true);
        try {
          const token = localStorage.getItem('serviceFinderToken');
          const response = await fetch('http://localhost:5000/api/users/favorites', { headers: { 'Authorization': `Bearer ${token}` }});
          if (response.ok) setFavorites(await response.json());
        } catch (error) {} finally { setIsFetchingFavs(false); }
      };
      fetchFavorites();
    }
  }, [activeNav]);

  const removeFavorite = async (providerId) => {
    try {
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch('http://localhost:5000/api/users/favorites/toggle', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ providerId })
      });
      if (response.ok) setFavorites(favorites.filter(fav => fav._id !== providerId));
    } catch (error) {}
  };

  // --- SUBMIT RESCHEDULE ---
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if(!newDate || !newTime) return alert("Please select both a new date and time.");
    
    try {
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${rescheduleBooking._id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: newDate, time: newTime })
      });
      if (response.ok) {
        alert("Booking rescheduled successfully! Waiting for Professional to confirm the new time.");
        setRescheduleBooking(null);
        fetchMyBookings();
      }
    } catch (error) {
      alert("Failed to reschedule.");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return ['Confirmed', 'Pending', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(booking.status || 'Pending');
    if (activeTab === 'completed') return ['Completed', 'Cancelled'].includes(booking.status);
    return true;
  });

  const sidebarNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'favorites', label: 'Favorites', icon: 'favorite' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] font-display transition-colors duration-300 relative">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden w-full flex items-center justify-between p-4 mb-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">menu_open</span>
             <span className="font-bold text-slate-900 dark:text-white">Dashboard Menu</span>
          </div>
          <span className="material-symbols-outlined text-slate-500">{isSidebarOpen ? 'expand_less' : 'expand_more'}</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className={`w-full lg:w-72 flex-shrink-0 transition-all duration-300 origin-top ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden lg:sticky lg:top-24">
              <div className="p-8 text-center relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-primary opacity-10 dark:opacity-20"></div>
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-white dark:bg-slate-900 shadow-md">
                   <img src={userImage} alt={userName} className="w-full h-full object-cover rounded-full" />
                   <div className="absolute bottom-1 right-1 size-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{userName}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{currentUser?.email}</p>
              </div>

              <nav className="p-4 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800">
                {sidebarNav.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); setIsSidebarOpen(false); }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                      activeNav === item.id 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 space-y-8">
            
            {activeNav === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-primary dark:to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                  <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {userName.split(' ')[0]}! 👋</h1>
                    <p className="text-slate-300 dark:text-blue-100 text-sm">Ready to check off your to-do list? Manage your appointments here.</p>
                  </div>
                  <Link to="/services" className="relative z-10 w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 dark:text-primary rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      Book Service
                    </button>
                  </Link>
                </div>

                <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl inline-flex w-full sm:w-auto border border-slate-200/60 dark:border-slate-800 flex-wrap">
                  <button onClick={() => setActiveTab('upcoming')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'upcoming' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upcoming</button>
                  <button onClick={() => setActiveTab('completed')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'completed' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>History</button>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="animate-pulse flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    </div>
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <div key={booking._id || booking.id} className="group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="relative overflow-hidden rounded-xl size-20 sm:size-24 flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                          <img src={booking.image || "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=200"} alt={booking.provider} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-1">
                             <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight leading-none">{booking.service}</h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">by {booking.provider}</p>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                               booking.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                               ['Payment Pending', 'Payment Verification'].includes(booking.status) ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' :
                               booking.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                               booking.status === 'Pending' || !booking.status ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                               'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                             }`}>
                               {booking.status || 'Pending'}
                             </span>
                          </div>
                          
                          {/* OTP DISPLAY BANNER */}
                          {booking.status === 'Confirmed' && booking.startOtp && (
                            <div className="mt-4 mb-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-center justify-between">
                              <span className="text-indigo-800 dark:text-indigo-300 font-bold text-sm">Share Start Code with Pro:</span>
                              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-[0.2em]">{booking.startOtp}</span>
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>{booking.date}</div>
                            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">schedule</span>{booking.time}</div>
                            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">payments</span>{booking.finalPrice ? `₹${booking.finalPrice}` : booking.price}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-5 justify-center">
                           
                           {/* Chat Button */}
                           {['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(booking.status) && (
                             <button onClick={() => setActiveChatBooking(booking)} className="w-full px-4 py-2.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
                               <span className="material-symbols-outlined text-[18px]">chat</span> Message Pro
                             </button>
                           )}

                           {/* Payment Action Buttons */}
                           {booking.status === 'Payment Pending' && (
                             <button onClick={() => setActivePaymentBooking(booking)} className="w-full px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold shadow-md animate-pulse whitespace-nowrap">
                               Pay ₹{booking.finalPrice} Now
                             </button>
                           )}
                           
                           {booking.status === 'Payment Verification' && (
                             <span className="w-full px-4 py-2.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 rounded-xl text-sm font-bold text-center border border-yellow-200 dark:border-yellow-700/50 whitespace-nowrap">
                               Verifying Payment...
                             </span>
                           )}

                           {/* Review Button */}
                           {booking.status === 'Completed' && (
                             <button 
                               onClick={() => setActiveReviewBooking(booking)}
                               className="w-full px-4 py-2.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 rounded-xl text-sm font-bold hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1"
                             >
                               <span className="material-symbols-outlined text-[18px]">star</span> Leave a Review
                             </button>
                           )}
                           
                           {/* --- RESCHEDULE BUTTON --- */}
                           {['Pending', 'Confirmed'].includes(booking.status) && (
                             <button 
                               onClick={() => {
                                  setRescheduleBooking(booking);
                                  setNewDate(booking.date);
                                  setNewTime(booking.time);
                               }} 
                               className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                             >
                               Reschedule
                             </button>
                           )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                       <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><span className="material-symbols-outlined text-3xl text-slate-400">event_busy</span></div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No bookings found</h3>
                       <p className="text-slate-500 text-sm max-w-sm">You don't have any {activeTab} bookings at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other tabs remain identical... */}
            {activeNav === 'favorites' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Saved Professionals</h2>
                  <p className="text-slate-500 dark:text-slate-400">Quickly access the providers you loved or want to book later.</p>
                </div>
                {isFetchingFavs ? (
                  <div className="animate-pulse flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                      <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((provider) => (
                      <div key={provider._id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <img src={provider.image || "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=600"} alt={provider.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <button onClick={() => removeFavorite(provider._id)} className="absolute top-4 right-4 size-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10">
                            <span className="material-symbols-outlined text-[18px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                          </button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{provider.name}</h3>
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-yellow-500">{provider.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-500 mb-4">{provider.title}</p>
                          <div className="mt-auto flex gap-2">
                            <Link to={`/service-details/${provider._id}`} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold text-center">View Profile</Link>
                            <Link to={`/service-details/${provider._id}`} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold text-center">Book Now</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                     <p className="text-slate-500 text-sm mb-6">You haven't saved any professionals to your favorites.</p>
                     <Link to="/services" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md">Browse Professionals</Link>
                  </div>
                )}
              </div>
            )}

            {activeNav === 'messages' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Conversations</h2>
                  <p className="text-slate-500 dark:text-slate-400">Chat with professionals for your confirmed bookings.</p>
                </div>
                <div className="space-y-4">
                  {bookings.filter(b => ['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(b.status)).length > 0 ? (
                    bookings.filter(b => ['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(b.status)).map(booking => (
                      <div key={booking._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <img src={booking.image || "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=200"} alt="Service" className="size-16 rounded-xl object-cover shadow-sm" />
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{booking.provider}</h3>
                            <p className="text-slate-500 text-sm font-medium">{booking.service} • {booking.date}</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveChatBooking(booking)} className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">chat</span> Open Chat
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                       <p className="text-slate-500 text-sm">You can chat with professionals once your booking is confirmed.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeNav === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Settings</h2>
                  <p className="text-slate-500 dark:text-slate-400">Update your personal information and contact details.</p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const token = localStorage.getItem('serviceFinderToken');
                  const formData = new FormData(e.target);
                  const updates = { name: formData.get('name'), phone: formData.get('phone') };
                  
                  try {
                    const res = await fetch('http://localhost:5000/api/users/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(updates)
                    });
                    
                    const data = await res.json();
                    if (res.ok) {
                       localStorage.setItem('serviceFinderUser', JSON.stringify(data.user)); 
                       alert("Profile updated successfully!");
                       window.location.reload(); 
                    }
                  } catch (err) { alert("Error saving profile"); }
                }} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                      <input name="name" type="text" defaultValue={currentUser?.name} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
                      <input name="phone" type="tel" defaultValue={currentUser?.phone} placeholder="Add your phone number" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email (Cannot be changed)</label>
                      <input type="email" value={currentUser?.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>

                  <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 shadow-md">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* --- RESCHEDULE MODAL --- */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Reschedule Booking</h3>
            <p className="text-sm text-slate-500 mb-6">Select a new date and time for your service with {rescheduleBooking.provider}.</p>
            
            <form onSubmit={handleRescheduleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">1. New Date</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">calendar_today</span>
                  <input 
                    type="date" 
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">2. New Time</label>
                <div className="grid grid-cols-2 gap-3">
                  {["08:00 AM", "09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM", "06:00 PM"].map((time) => (
                    <button 
                      key={time}
                      type="button"
                      onClick={() => setNewTime(time)}
                      className={`py-3 px-2 text-sm font-bold rounded-xl border-2 transition-all ${
                        newTime === time 
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setRescheduleBooking(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/30 hover:bg-blue-600 transition-colors">Confirm New Time</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeChatBooking && <ChatBox booking={activeChatBooking} onClose={() => setActiveChatBooking(null)} />}
      
      {activePaymentBooking && (
        <CheckoutModal 
          booking={activePaymentBooking} 
          onClose={() => setActivePaymentBooking(null)} 
          onSuccess={() => {
            setActivePaymentBooking(null);
            fetchMyBookings();
            alert("Payment recorded! Waiting for professional to confirm receipt.");
          }} 
        />
      )}

      {activeReviewBooking && (
        <ReviewModal 
          booking={activeReviewBooking} 
          onClose={() => setActiveReviewBooking(null)}
          onSuccess={() => {
            alert("Thank you for your review!");
            setActiveReviewBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;