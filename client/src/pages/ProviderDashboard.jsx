import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { io } from 'socket.io-client';
import FullPageLoader from '../components/FullPageLoader'; 

// Import Tabs
import DashboardTab from '../components/provider/DashboardTab';
import EarningsTab from '../components/provider/EarningsTab';
import MessagesTab from '../components/provider/MessagesTab';
import ProfileTab from '../components/provider/ProfileTab';

const ProviderDashboard = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('requests');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [bookings, setBookings] = useState([]);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  const [isLoading, setIsLoading] = useState(true); 
  const [actionLoading, setActionLoading] = useState({ id: null, action: null });
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Billing & OTP Modals
  const [billingBooking, setBillingBooking] = useState(null);
  const [finalAmount, setFinalAmount] = useState("");
  const [otpBooking, setOtpBooking] = useState(null);
  const [otpInput, setOtpInput] = useState("");

  const userName = currentUser?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || "Professional";
  const userImage = currentUser?.image || currentUser?.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const proId = currentUser?._id || currentUser?.id;

  const fetchProviderBookings = useCallback(async () => {
    if (!proId) return; 
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/provider`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache'}
      });
      if (response.ok) {
        setBookings(await response.json() || []);
      }
    } catch (error) { 
      console.error(error); 
    } finally {
      setIsLoading(false);
    }
  }, [proId]);

  useEffect(() => { fetchProviderBookings(); }, [fetchProviderBookings]);

  useEffect(() => {
    if (!proId) return;
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const socket = io('http://localhost:5000');    
    socket.emit('join_dashboard', String(proId));

    socket.on('new_booking_request', (newBooking) => {
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
      if (Notification.permission === 'granted') new Notification('New Job Request! 🚀', { body: `You have a new request for ${newBooking.service}!` });
      setBookings(prev => [newBooking, ...prev]);
    });

    socket.on('booking_status_updated', (updatedBooking) => {
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
    });

    // --- ADDED: NEW CHAT NOTIFICATION LISTENER ---
    socket.on('receive_notification', (notif) => {
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
      if (Notification.permission === 'granted') {
        new Notification('New Message! 💬', { body: notif.text });
      }
    });

    return () => socket.disconnect();
  }, [proId]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setActionLoading({ id: bookingId, action: newStatus }); 
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? updatedBooking : b));
      } 
    } catch (error) { console.error(error); } 
    finally { setActionLoading({ id: null, action: null }); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true); 
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${otpBooking._id}/start`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ otp: otpInput })
      });
      if (response.ok) {
        setBookings(prev => prev.map(b => b._id === otpBooking._id ? { ...b, status: 'In Progress' } : b));
        setOtpBooking(null);
        setOtpInput("");
        alert("OTP Verified! Job has successfully started.");
      } else {
        const data = await response.json();
        alert(data.message || "Invalid OTP. Please check with the customer.");
      }
    } catch (error) { console.error(error); } 
    finally { setIsVerifyingOtp(false); }
  };

  const handleSendBill = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${billingBooking._id}/bill`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ finalPrice: Number(finalAmount) })
      });
      if (response.ok) {
        setBookings(prev => prev.map(b => b._id === billingBooking._id ? { ...b, status: 'Payment Pending', finalPrice: Number(finalAmount) } : b));
        setBillingBooking(null);
        alert("Bill sent to customer!");
      }
    } catch (error) {}
  };

  const handleConfirmPayment = async (bookingId) => {
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/confirm-payment`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Completed' } : b));
        alert("Payment Confirmed! The job is officially completed.");
      }
    } catch (error) {}
  };

  const parsePrice = (priceStr) => parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
  
  // Data calculations for Earnings Tab
  const totalEarnings = bookings.filter(b => b.status === 'Completed').reduce((acc, b) => acc + parsePrice(b.finalPrice || b.price), 0);
  const pendingEarnings = bookings.filter(b => ['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(b.status)).reduce((acc, b) => acc + parsePrice(b.finalPrice || b.price), 0);
  const completedJobsCount = bookings.filter(b => b.status === 'Completed').length;

  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(month => ({ name: month, Earnings: 0 }));
    bookings.forEach(booking => {
      if (booking.status === 'Completed' && booking.date) {
        const date = new Date(booking.date);
        if (!isNaN(date)) data[date.getMonth()].Earnings += parsePrice(booking.finalPrice || booking.price);
      }
    });
    const currentMonthIndex = new Date().getMonth();
    return data.slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1);
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'requests') return booking.status === 'Pending' || !booking.status;
    if (activeTab === 'accepted') return ['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification', 'Completed'].includes(booking.status);
    return true;
  });

  const sidebarNav = [
    { id: 'dashboard', label: 'My Jobs', icon: 'work' },
    { id: 'earnings', label: 'Earnings', icon: 'payments' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'profile', label: 'Pro Profile', icon: 'person' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] font-display transition-colors duration-300 relative">
      {isLoading && <FullPageLoader message="Fetching Your Jobs..." />}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden w-full flex items-center justify-between p-4 mb-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-teal-600">menu_open</span>
             <span className="font-bold text-slate-900 dark:text-white">Dashboard Menu</span>
          </div>
          <span className="material-symbols-outlined text-slate-500">{isSidebarOpen ? 'expand_less' : 'expand_more'}</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`w-full lg:w-72 flex-shrink-0 transition-all duration-300 origin-top ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden lg:sticky lg:top-24">
              <div className="p-8 text-center relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-500 to-teal-500 opacity-10 dark:opacity-20"></div>
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-white dark:bg-slate-900 shadow-md">
                   <img src={userImage} alt={userName} className="w-full h-full object-cover rounded-full" />
                   <div className="absolute bottom-1 right-1 size-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{userName}</h2>
                <span className="inline-block mt-1 px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs font-bold rounded-full uppercase tracking-wide">Professional</span>
              </div>
              <nav className="p-4 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800">
                {sidebarNav.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                      activeNav === item.id ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                bookings={bookings}
                filteredBookings={filteredBookings}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoading={isLoading}
                handleStatusUpdate={handleStatusUpdate}
                actionLoading={actionLoading}
                setActiveChatBooking={setActiveChatBooking}
                setOtpBooking={setOtpBooking}
                setBillingBooking={setBillingBooking}
                setFinalAmount={setFinalAmount}
                handleConfirmPayment={handleConfirmPayment}
                parsePrice={parsePrice}
              />
            )}
            {activeNav === 'earnings' && (
              <EarningsTab 
                totalEarnings={totalEarnings} 
                pendingEarnings={pendingEarnings} 
                completedJobsCount={completedJobsCount} 
                chartData={getChartData()} 
              />
            )}
            {activeNav === 'messages' && <MessagesTab bookings={bookings} setActiveChatBooking={setActiveChatBooking} />}
            {activeNav === 'profile' && <ProfileTab currentUser={currentUser} />}
          </main>
        </div>
      </div>

      {/* --- MODALS --- */}
      {otpBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center text-center mb-6">
               <div className="size-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-3xl">verified_user</span>
               </div>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Start Service</h3>
               <p className="text-sm text-slate-500">Ask the customer for their 4-digit Start Code to verify your arrival.</p>
            </div>
            
            <form onSubmit={handleVerifyOtp}>
              <input 
                type="text" maxLength="4" required value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} disabled={isVerifyingOtp}
                className="w-full text-center text-4xl tracking-[0.5em] font-black py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white mb-6 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed" placeholder="0000" 
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => {setOtpBooking(null); setOtpInput("");}} disabled={isVerifyingOtp} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
                <button type="submit" disabled={isVerifyingOtp} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isVerifyingOtp ? <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Verifying...</> : 'Verify & Start'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {billingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Finalize Bill</h3>
            <p className="text-sm text-slate-500 mb-6">Enter the final amount for this service. This will notify the customer to pay.</p>
            <form onSubmit={handleSendBill}>
              <div className="relative mb-8">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">₹</span>
                <input type="number" required value={finalAmount} onChange={(e) => setFinalAmount(e.target.value)} className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xl font-bold transition-all" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setBillingBooking(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-teal-600 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-colors">Send Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {activeChatBooking && <ChatBox booking={activeChatBooking} onClose={() => setActiveChatBooking(null)} />}
    </div>
  );
};

export default ProviderDashboard;