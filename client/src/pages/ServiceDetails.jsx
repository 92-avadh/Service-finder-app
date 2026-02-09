import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ServiceDetails = () => {
  // Mock Data for a single provider
  const provider = {
    name: "Michael Foster",
    title: "Expert Residential Electrician",
    rating: 4.9,
    reviews: 124,
    location: "Mumbai, Maharashtra",
    price: 499,
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600",
    about: "I have over 10 years of experience in residential and commercial electrical systems. I specialize in troubleshooting, panel upgrades, and lighting installations. My goal is to provide safe and reliable electrical solutions for your home.",
    services: [
      "Wiring & Rewiring",
      "Lighting Installation",
      "Panel Upgrades",
      "Outlet Repair",
      "Circuit Breaker Replacement"
    ]
  };

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2">/</span>
          <a href="/services" className="hover:text-primary">Electricians</a>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white font-medium">{provider.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Provider Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-6 items-start">
              <img 
                src={provider.image} 
                alt={provider.name} 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{provider.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{provider.title}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                    <span className="material-symbols-outlined text-yellow-500 text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="font-bold text-slate-900">{provider.rating}</span>
                    <span className="text-xs text-slate-500">({provider.reviews} reviews)</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {provider.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Background Checked
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About {provider.name}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {provider.about}
              </p>
            </div>

            {/* Services List */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Services Offered</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="size-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Preview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {[
                  { user: "Rahul K.", date: "2 days ago", text: "Excellent work! Arrived on time and fixed the issue quickly.", rating: 5 },
                  { user: "Priya S.", date: "1 week ago", text: "Very professional and polite. Explained everything clearly.", rating: 5 }
                ].map((review, idx) => (
                  <div key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{review.user}</h4>
                      <span className="text-xs text-slate-500">{review.date}</span>
                    </div>
                    <div className="flex text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Booking Widget (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 dark:text-slate-400">Price per hour</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{provider.price}</span>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-primary"
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {["09:00", "11:00", "14:00", "16:00", "18:00"].map((time) => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-1 text-sm rounded-lg border transition-all ${
                        selectedTime === time 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-primary text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold dark:text-white">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="font-bold dark:text-white">{selectedTime}</span>
                  </div>
                </div>
              )}

              <button className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-primary dark:hover:bg-slate-200 transition-colors shadow-lg shadow-primary/20">
                Book Appointment
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-4">You won't be charged yet</p>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServiceDetails;