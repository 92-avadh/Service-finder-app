import React from 'react';

const DashboardTab = ({ 
  userName, bookings, filteredBookings, activeTab, setActiveTab, isLoading,
  handleStatusUpdate, actionLoading, setActiveChatBooking, setOtpBooking, 
  setBillingBooking, handleConfirmPayment, parsePrice
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-teal-700 dark:to-teal-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          {/* FIXED: Added optional chaining to userName in case it's missing */}
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome, {userName?.split(' ')[0] || 'Professional'}! 🚀</h1>
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
        {isLoading ? (
          <div className="animate-pulse flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{booking.service}</h3>
                      {/* FIXED: Safely fallback to 'Customer' if customerEmail is missing from old test data */}
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        Customer: <span className="text-slate-700 dark:text-slate-300">
                          {booking.customerEmail ? booking.customerEmail.split('@')[0] : 'Customer'}
                        </span>
                      </p>
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
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Confirmed')} 
                        disabled={actionLoading.id === booking._id}
                        className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                      >
                        {actionLoading.id === booking._id && actionLoading.action === 'Confirmed' ? (
                          <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Accepting...</>
                        ) : 'Accept Job'}
                      </button>

                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'Cancelled')} 
                        disabled={actionLoading.id === booking._id}
                        className="w-full px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                      >
                        {actionLoading.id === booking._id && actionLoading.action === 'Cancelled' ? (
                          <><svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Declining...</>
                        ) : 'Decline'}
                      </button>
                    </>
                  )}

                  {['Confirmed', 'In Progress', 'Payment Pending', 'Payment Verification'].includes(booking.status) && (
                    <button onClick={() => setActiveChatBooking(booking)} className="w-full px-4 py-2.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">chat</span> Message
                    </button>
                  )}
                  
                  {booking.status === 'Confirmed' && (
                    <button onClick={() => setOtpBooking(booking)} className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-700 animate-pulse whitespace-nowrap">
                      Start Job (Enter OTP)
                    </button>
                  )}

                  {booking.status === 'In Progress' && (
                    <button onClick={() => setBillingBooking(booking)} className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 whitespace-nowrap">
                      Complete & Bill
                    </button>
                  )}

                  {booking.status === 'Payment Pending' && (
                    <span className="w-full px-4 py-2.5 border-2 border-yellow-200 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-500 rounded-xl text-sm font-bold text-center whitespace-nowrap">
                      Waiting for Customer
                    </span>
                  )}

                  {booking.status === 'Payment Verification' && (
                    <button onClick={() => handleConfirmPayment(booking._id)} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md shadow-green-600/30 animate-bounce whitespace-nowrap">
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
  );
};

export default DashboardTab;