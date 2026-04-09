import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import ReviewModal from '../components/ReviewModal'; 
import CheckoutModal from '../components/CheckoutModal'; 
import { io } from 'socket.io-client'; 
import FullPageLoader from '../components/FullPageLoader'; 

import DashboardTab from '../components/customer/DashboardTab';
import FavoritesTab from '../components/customer/FavoritesTab';
import MessagesTab from '../components/customer/MessagesTab';
import SettingsTab from '../components/customer/SettingsTab';

const CustomerDashboard = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  // FIXED: Corrected the useState syntax error here
  const [activeNav, setActiveNav] = useState('dashboard'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [activeChatBooking, setActiveChatBooking] = useState(null); 
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);
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
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings?email=${userEmail}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      if (response.ok) setBookings(await response.json() || []);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  }, [userEmail]);

  useEffect(() => { fetchMyBookings(); }, [fetchMyBookings]);

  // --- SOCKET LOGIC WITH UNIVERSAL MP3 ---
  useEffect(() => {
    if (!userEmail) return;
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const socket = io('http://localhost:5000');
    socket.emit('join_dashboard', String(userEmail));
    
    socket.on('booking_status_updated', (updatedBooking) => {
      try { 
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3');
        audio.play().catch(() => {}); 
      } catch(e){}

      if (Notification.permission === 'granted') new Notification('Booking Update! 🔔', { body: `Your job status is now: ${updatedBooking.status}` });
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
    });

    socket.on('receive_notification', (notif) => {
      try { 
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3');
        audio.play().catch(() => {}); 
      } catch(e){}

      if (Notification.permission === 'granted') {
        new Notification('New Message! 💬', { body: notif.text });
      }
    });

    return () => socket.disconnect();
  }, [userEmail]);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if(!newDate || !newTime) return alert("Please select both a new date and time.");
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
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

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Could not fetch PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error downloading invoice.");
      console.error(error);
    }
  };

  const sidebarNav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'favorites', label: 'Favorites', icon: 'favorite' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] font-display transition-colors duration-300 relative">
      {isLoading && <FullPageLoader message="Fetching Your Dashboard..." />}
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
              <DashboardTab 
                userName={userName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                bookings={bookings}
                isLoading={isLoading}
                setActiveChatBooking={setActiveChatBooking}
                setActivePaymentBooking={setActivePaymentBooking}
                setActiveReviewBooking={setActiveReviewBooking}
                setRescheduleBooking={setRescheduleBooking}
                setNewDate={setNewDate}
                setNewTime={setNewTime}
                handleDownloadInvoice={handleDownloadInvoice}
              />
            )}
            {activeNav === 'favorites' && <FavoritesTab />}
            {activeNav === 'messages' && <MessagesTab bookings={bookings} setActiveChatBooking={setActiveChatBooking} />}
            {activeNav === 'settings' && <SettingsTab currentUser={currentUser} />}
          </main>
        </div>
      </div>

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
                  <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"/>
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">2. New Time</label>
                <div className="grid grid-cols-2 gap-3">
                  {["08:00 AM", "09:30 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM", "06:00 PM"].map((time) => (
                    <button key={time} type="button" onClick={() => setNewTime(time)} className={`py-3 px-2 text-sm font-bold rounded-xl border-2 transition-all ${newTime === time ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50'}`}>
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
      {activePaymentBooking && <CheckoutModal booking={activePaymentBooking} onClose={() => setActivePaymentBooking(null)} onSuccess={() => { setActivePaymentBooking(null); fetchMyBookings(); alert("Payment recorded!"); }} />}
      {activeReviewBooking && <ReviewModal booking={activeReviewBooking} onClose={() => setActiveReviewBooking(null)} onSuccess={() => { alert("Thank you!"); setActiveReviewBooking(null); }} />}
    </div>
  );
};

export default CustomerDashboard;