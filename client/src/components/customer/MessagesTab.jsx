import React from 'react';

const MessagesTab = ({ bookings, setActiveChatBooking }) => {
  return (
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
  );
};

export default MessagesTab;