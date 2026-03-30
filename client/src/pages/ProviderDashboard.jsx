import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { io } from 'socket.io-client';
import FullPageLoader from '../components/FullPageLoader'; 

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

  // Modals
  const [otpBooking, setOtpBooking] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  
  // ITEMIZED BILL STATE
  const [billingBooking, setBillingBooking] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([{ description: '', amount: '' }]);

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

  // --- ITEMIZED INVOICE LOGIC ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    setInvoiceItems(newItems);
  };
  const addItem = () => setInvoiceItems([...invoiceItems, { description: '', amount: '' }]);
  const removeItem = (index) => setInvoiceItems(invoiceItems.filter((_, i) => i !== index));

  const currentBillTotal = invoiceItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSendBill = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch(`http://localhost:5000/api/bookings/${billingBooking._id}/bill`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ invoiceItems })
      });
      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b._id === billingBooking._id ? updatedBooking : b));
        setBillingBooking(null);
        setInvoiceItems([{ description: '', amount: '' }]); // reset
        alert("Itemized Bill sent to customer!");
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
                handleConfirmPayment={handleConfirmPayment}
                parsePrice={parsePrice}
              />
            )}
            {activeNav === 'earnings' && <EarningsTab totalEarnings={totalEarnings} pendingEarnings={pendingEarnings} completedJobsCount={completedJobsCount} chartData={getChartData()} />}
            {activeNav === 'messages' && <MessagesTab bookings={bookings} setActiveChatBooking={setActiveChatBooking} />}
            {activeNav === 'profile' && <ProfileTab currentUser={currentUser} />}
          </main>
        </div>
      </div>

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
              <input type="text" maxLength="4" required value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} disabled={isVerifyingOtp} className="w-full text-center text-4xl tracking-[0.5em] font-black py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white mb-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 disabled:opacity-60" placeholder="0000" />
              <div className="flex gap-3">
                <button type="button" onClick={() => {setOtpBooking(null); setOtpInput("");}} disabled={isVerifyingOtp} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={isVerifyingOtp} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  {isVerifyingOtp ? 'Verifying...' : 'Verify & Start'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW ITEMIZED BILL MODAL --- */}
      {billingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Finalize Itemized Bill</h3>
            <p className="text-sm text-slate-500 mb-6">List the individual charges for this service. This will generate an invoice PDF for the customer.</p>
            
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {invoiceItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    required
                    placeholder="Item (e.g. Labor, Parts)" 
                    className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex-1 outline-none focus:border-teal-500 dark:text-white"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                  <div className="relative w-28">
                    <span className="absolute left-3 top-3 text-slate-400">₹</span>
                    <input 
                      type="number" 
                      required
                      className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 pl-8 rounded-xl w-full outline-none focus:border-teal-500 dark:text-white"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    />
                  </div>
                  {invoiceItems.length > 1 && (
                    <button onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addItem} className="text-teal-600 dark:text-teal-400 text-sm font-bold flex items-center gap-1 hover:underline mb-6">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Another Item
            </button>

            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
              <div className="flex flex-col">
                <span className="text-slate-500 text-sm font-medium">Total Amount</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{currentBillTotal}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setBillingBooking(null)} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleSendBill} disabled={currentBillTotal === 0 || invoiceItems.some(i => !i.description || !i.amount)} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-colors disabled:opacity-50">
                  Send Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeChatBooking && <ChatBox booking={activeChatBooking} onClose={() => setActiveChatBooking(null)} />}
    </div>
  );
};

export default ProviderDashboard;