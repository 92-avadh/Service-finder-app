import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

const ProviderDashboard = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('requests');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Menu State
  const [bookings, setBookings] = useState([]);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

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
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch(`https://service-finder-app.onrender.com/api/bookings/provider`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache'}
      });
      if (response.ok) {
        setBookings(await response.json() || []);
      }
    } catch (error) { console.error(error); } 
  }, [proId]);

  useEffect(() => { fetchProviderBookings(); }, [fetchProviderBookings]);

  // --- 🔥 REAL TIME WEB-SOCKET LOGIC 🔥 ---
  useEffect(() => {
    if (!proId) return;
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const socket = io('https://service-finder-app.onrender.com');
    
    socket.emit('join_dashboard', String(proId));

    socket.on('new_booking_request', (newBooking) => {
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
      if (Notification.permission === 'granted') new Notification('New Job Request! 🚀', { body: `You have a new request for ${newBooking.service}!` });
      setBookings(prev => [newBooking, ...prev]);
    });

    socket.on('booking_status_updated', (updatedBooking) => {
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
    });

    return () => socket.disconnect();
  }, [proId]); 

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch(`https://service-finder-app.onrender.com/api/bookings/${bookingId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? updatedBooking : b));
      } 
    } catch (error) { console.error(error); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch(`https://service-finder-app.onrender.com/api/bookings/${otpBooking._id}/start`, {
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
    } catch (error) {}
  };

  const handleSendBill = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch(`https://service-finder-app.onrender.com/api/bookings/${billingBooking._id}/bill`, {
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
      const token = localStorage.getItem('serviceFinderToken');
      const response = await fetch(`https://service-finder-app.onrender.com/api/bookings/${bookingId}/confirm-payment`, {
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

  const chartData = getChartData();
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
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* --- MOBILE SIDEBAR TOGGLE BUTTON --- */}
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
                    onClick={() => { setActiveNav(item.id); setIsSidebarOpen(false); }} // Close on click!
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
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-teal-700 dark:to-teal-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome, {userName.split(' ')[0]}! 🚀</h1>
                    <p className="text-slate-300 dark:text-teal-100 text-sm">Review your new service requests and manage your schedule.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {[
                     { label: 'New Requests', value: bookings.filter(b => b.status === 'Pending' || !b.status).length, icon: 'mark_email_unread', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
                     { label: 'Active Jobs', value: bookings.filter(b => ['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(b.status)).length, icon: 'assignment_turned_in', color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
                     { label: 'Total Jobs', value: bookings.length, icon: 'work_history', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                   ].map((stat, idx) => (
                     <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col gap-3">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}><span className="material-symbols-outlined">{stat.icon}</span></div>
                        <div>
                           <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl inline-flex w-full sm:w-auto border border-slate-200/60 dark:border-slate-800 flex-wrap">
                  <button onClick={() => setActiveTab('requests')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'requests' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>New Requests</button>
                  <button onClick={() => setActiveTab('accepted')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'accepted' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Active Jobs</button>
                </div>

                <div className="space-y-4">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <div key={booking._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-1">
                             <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{booking.service}</h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">Customer: <span className="text-slate-700 dark:text-slate-300">{booking.customerEmail.split('@')[0]}</span></p>
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
                          
                          <div className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                              <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-teal-600">calendar_month</span>{booking.date}</div>
                              <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-teal-600">schedule</span>{booking.time}</div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white"><span className="material-symbols-outlined text-[18px] text-teal-600">payments</span>₹{parsePrice(booking.finalPrice || booking.price)}</div>
                            </div>
                            
                            {/* --- NEW: DISPLAY ADDRESS ON CARD --- */}
                            {booking.address && (
                              <div className="flex items-start gap-1.5 mt-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 w-full">
                                <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0">location_on</span>
                                <span className="text-slate-700 dark:text-slate-300 leading-tight text-sm">{booking.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-5">
                           
                           {(booking.status === 'Pending' || !booking.status) && (
                             <>
                               <button onClick={() => handleStatusUpdate(booking._id, 'Confirmed')} className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20">Accept Job</button>
                               <button onClick={() => handleStatusUpdate(booking._id, 'Cancelled')} className="w-full px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold">Decline</button>
                             </>
                           )}

                           {['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(booking.status) && (
                             <button onClick={() => setActiveChatBooking(booking)} className="w-full px-4 py-2.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1">
                               <span className="material-symbols-outlined text-[18px]">chat</span> Message
                             </button>
                           )}
                           
                           {booking.status === 'Confirmed' && (
                             <button 
                               onClick={() => setOtpBooking(booking)} 
                               className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-700 animate-pulse whitespace-nowrap"
                             >
                               Start Job (Enter OTP)
                             </button>
                           )}

                           {booking.status === 'In Progress' && (
                             <button 
                               onClick={() => { setBillingBooking(booking); setFinalAmount(parsePrice(booking.price)); }} 
                               className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 whitespace-nowrap"
                             >
                               Complete & Bill
                             </button>
                           )}

                           {booking.status === 'Payment Pending' && (
                             <span className="w-full px-4 py-2.5 border-2 border-yellow-200 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-500 rounded-xl text-sm font-bold text-center whitespace-nowrap">
                               Waiting for Customer
                             </span>
                           )}

                           {booking.status === 'Payment Verification' && (
                             <button 
                               onClick={() => handleConfirmPayment(booking._id)} 
                               className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md shadow-green-600/30 animate-bounce whitespace-nowrap"
                             >
                               Confirm Payment Received
                             </button>
                           )}

                           {booking.status === 'Completed' && (
                             <span className="w-full px-4 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-1">
                               <span className="material-symbols-outlined text-[18px]">check_circle</span> Paid
                             </span>
                           )}

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                       <p className="text-slate-500 font-medium">No {activeTab} jobs at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeNav === 'earnings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Earnings Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 rounded-2xl text-white shadow-lg"><p className="text-teal-100 text-sm mb-1 uppercase tracking-wide">Total Cleared</p><h3 className="text-4xl font-black">₹{totalEarnings.toLocaleString()}</h3></div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm"><p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Pending</p><h3 className="text-4xl font-black dark:text-white">₹{pendingEarnings.toLocaleString()}</h3></div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm"><p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Jobs Completed</p><h3 className="text-4xl font-black dark:text-white">{completedJobsCount}</h3></div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Earnings History</h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="Earnings" stroke="#0d9488" strokeWidth={3} fillOpacity={0.2} fill="#0d9488" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeNav === 'messages' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Customer Messages</h2>
                </div>
                <div className="space-y-4">
                  {bookings.filter(b => ['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(b.status)).map(booking => (
                    <div key={booking._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-2xl">{booking.customerEmail.charAt(0).toUpperCase()}</div>
                        <div><h3 className="font-bold dark:text-white text-lg">{booking.customerEmail.split('@')[0]}</h3><p className="text-slate-500 text-sm font-medium">{booking.service}</p></div>
                      </div>
                      <button onClick={() => setActiveChatBooking(booking)} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined">chat</span>Open Chat</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeNav === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Professional Profile</h2>
                  <p className="text-slate-500 dark:text-slate-400">Keep your details fresh to attract more customers.</p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const token = localStorage.getItem('serviceFinderToken');
                  const formData = new FormData(e.target);
                  const updates = Object.fromEntries(formData.entries());
                  
                  try {
                    const res = await fetch('https://service-finder-app.onrender.com/api/users/profile', {
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
                }} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                      <input name="name" type="text" defaultValue={currentUser?.name} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Professional Title</label>
                      <input name="title" type="text" defaultValue={currentUser?.title} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
                      <input name="phone" type="tel" defaultValue={currentUser?.phone} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Base Price (₹/hr)</label>
                      <input name="price" type="number" defaultValue={currentUser?.price} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                      <input name="location" type="text" defaultValue={currentUser?.location} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">About Your Services</label>
                    <textarea name="about" rows="4" defaultValue={currentUser?.about} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none"></textarea>
                  </div>

                  <button type="submit" className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-md">
                    Save Profile Updates
                  </button>
                </form>
              </div>
            )}

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
              <input 
                type="text" 
                maxLength="4" 
                required 
                value={otpInput} 
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} 
                className="w-full text-center text-4xl tracking-[0.5em] font-black py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white mb-6 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                placeholder="0000" 
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => {setOtpBooking(null); setOtpInput("");}} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-colors">Verify & Start</button>
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
                <input 
                  type="number" 
                  required 
                  value={finalAmount} 
                  onChange={(e) => setFinalAmount(e.target.value)} 
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xl font-bold transition-all" 
                />
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