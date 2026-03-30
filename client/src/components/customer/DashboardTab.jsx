import React from 'react';
import { Link } from 'react-router-dom';

const DashboardTab = ({ 
  userName, 
  activeTab, 
  setActiveTab, 
  bookings = [], // Added default empty array just in case
  isLoading, 
  setActiveChatBooking, 
  setActivePaymentBooking, 
  setActiveReviewBooking, 
  setRescheduleBooking, 
  setNewDate, 
  setNewTime,
  handleDownloadInvoice 
}) => {
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return ['Confirmed', 'Pending', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(booking.status || 'Pending');
    if (activeTab === 'completed') return ['Completed', 'Cancelled', 'Paid'].includes(booking.status);
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-primary dark:to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {userName?.split(' ')[0]}! 👋</h1>
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
                
                {booking.status === 'Confirmed' && booking.startOtp && (
                  <div className="mt-4 mb-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-center justify-between">
                    <span className="text-indigo-800 dark:text-indigo-300 font-bold text-sm">Share Start Code with Pro:</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-[0.2em]">{booking.startOtp}</span>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>{booking.date}</div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">schedule</span>{booking.time}</div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">payments</span>{booking.finalPrice ? `₹${booking.finalPrice}` : booking.price}</div>
                  </div>
                  
                  {booking.address && (
                    <div className="flex items-start gap-1.5 mt-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 w-full">
                      <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0">location_on</span>
                      <span className="text-slate-700 dark:text-slate-300 leading-tight text-sm">{booking.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-5 justify-center">
                  
                  {['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(booking.status) && (
                    <button onClick={() => setActiveChatBooking(booking)} className="w-full px-4 py-2.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">chat</span> Message Pro
                    </button>
                  )}

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

                  {/* --- FIXED: Safe check for invoiceItems --- */}
                  {booking.status === 'Completed' && booking.invoiceItems && booking.invoiceItems.length > 0 && (
                    <button 
                      onClick={() => handleDownloadInvoice(booking._id || booking.id)} 
                      className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span> Invoice
                    </button>
                  )}

                  {booking.status === 'Completed' && (
                    <button onClick={() => setActiveReviewBooking(booking)} className="w-full px-4 py-2.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 rounded-xl text-sm font-bold hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">star</span> Leave Review
                    </button>
                  )}
                  
                  {['Pending', 'Confirmed'].includes(booking.status) && (
                    <button 
                      onClick={() => {
                        setRescheduleBooking(booking);
                        setNewDate(booking.date);
                        setNewTime(booking.time);
                      }} 
                      className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap"
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
  );
};

export default DashboardTab;