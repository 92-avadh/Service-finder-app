import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock Data for Bookings
  const bookings = [
    {
      id: 1,
      service: "Home Cleaning",
      provider: "Sarah Jenkins",
      date: "Oct 24, 2024",
      time: "10:00 AM",
      price: "₹899",
      status: "Confirmed",
      image: "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: 2,
      service: "Electrical Repair",
      provider: "Michael Foster",
      date: "Oct 28, 2024",
      time: "02:00 PM",
      price: "₹499",
      status: "Pending",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: 3,
      service: "Plumbing Fix",
      provider: "David Ross",
      date: "Sep 15, 2024",
      time: "11:30 AM",
      price: "₹1,200",
      status: "Completed",
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=200"
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return booking.status === 'Confirmed' || booking.status === 'Pending';
    if (activeTab === 'completed') return booking.status === 'Completed' || booking.status === 'Cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" alt="User" className="w-full h-full object-cover" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white">Alex Johnson</h2>
                <p className="text-xs text-slate-500">alex.j@example.com</p>
              </div>
              <nav className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">dashboard</span>
                  Dashboard
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined">favorite</span>
                  Favorites
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined">chat</span>
                  Messages
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined">settings</span>
                  Settings
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
                <p className="text-slate-500 text-sm">Manage your upcoming and past appointments</p>
              </div>
              <Link to="/services">
                <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                  + New Booking
                </button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
               {[
                 { label: 'Total Bookings', value: '12', icon: 'list_alt', color: 'text-blue-500 bg-blue-50' },
                 { label: 'Pending', value: '1', icon: 'schedule', color: 'text-orange-500 bg-orange-50' },
                 { label: 'Completed', value: '11', icon: 'check_circle', color: 'text-green-500 bg-green-50' },
               ].map((stat, idx) => (
                 <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className={`size-12 rounded-full flex items-center justify-center ${stat.color}`}>
                       <span className="material-symbols-outlined">{stat.icon}</span>
                    </div>
                    <div>
                       <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                       <p className="text-xs text-slate-500 uppercase font-semibold">{stat.label}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'upcoming' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Upcoming
              </button>
              <button 
                 onClick={() => setActiveTab('completed')}
                 className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'completed' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                History
              </button>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:shadow-md transition-shadow">
                    <img 
                      src={booking.image} 
                      alt={booking.provider} 
                      className="size-16 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{booking.service}</h3>
                            <p className="text-slate-500 text-sm">with {booking.provider}</p>
                         </div>
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                           booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                           booking.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                           'bg-gray-100 text-gray-700'
                         }`}>
                           {booking.status}
                         </span>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">schedule</span>
                          {booking.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                          {booking.price}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                       {booking.status !== 'Completed' && (
                         <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                           Cancel
                         </button>
                       )}
                       <button className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                         View Details
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300">
                   <p className="text-slate-500">No bookings found in this category.</p>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;