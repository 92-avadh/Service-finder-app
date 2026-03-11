import React from 'react';

const MessagesTab = ({ bookings, setActiveChatBooking }) => {
  return (
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
  );
};

export default MessagesTab;