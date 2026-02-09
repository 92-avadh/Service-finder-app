import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';

const Services = () => {
  // Mock Data for Services
  const services = [
    {
      id: 1,
      name: "Michael Foster",
      category: "Electrician",
      rating: 4.9,
      reviews: 120,
      price: "499/hr",
      location: "Mumbai, MH",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      category: "House Cleaning",
      rating: 4.8,
      reviews: 85,
      price: "299/hr",
      location: "Bangalore, KA",
      image: "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 3,
      name: "David Ross",
      category: "Plumbing",
      rating: 5.0,
      reviews: 210,
      price: "599/hr",
      location: "Delhi, DL",
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 4,
      name: "Emma Wilson",
      category: "Painting",
      rating: 4.7,
      reviews: 45,
      price: "399/hr",
      location: "Pune, MH",
      image: "https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 5,
      name: "Raj Patel",
      category: "Carpentry",
      rating: 4.6,
      reviews: 32,
      price: "450/hr",
      location: "Ahmedabad, GJ",
      image: "https://images.unsplash.com/photo-1603796846097-b36976ea28b0?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 6,
      name: "Anita Desai",
      category: "Gardening",
      rating: 4.9,
      reviews: 67,
      price: "350/hr",
      location: "Chennai, TN",
      image: "https://images.unsplash.com/photo-1598958530438-6f7734ae1732?auto=format&fit=crop&q=80&w=400"
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Find Professionals</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {services.length} professionals available in your area
            </p>
          </div>
          
          {/* Sort Dropdown */}
          <select className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
            <option>Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Highest Rated</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            
            {/* Category Filter */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-3">
                {['All', 'Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'Gardening'].map((cat) => (
                  <div key={cat} className="flex items-center">
                    <input 
                      id={`cat-${cat}`} 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor={`cat-${cat}`} className="ml-2 text-sm font-medium text-slate-900 dark:text-gray-300 cursor-pointer">
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Price Range</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
                <span className="text-slate-500">-</span>
                <input type="number" placeholder="Max" className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
            </div>

             {/* Rating Filter */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3].map((star) => (
                   <div key={star} className="flex items-center gap-2 cursor-pointer group">
                     <input type="checkbox" className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary" />
                     <div className="flex text-yellow-500">
                       {[...Array(5)].map((_, i) => (
                         <span key={i} className={`material-symbols-outlined text-[18px] ${i < star ? 'filled' : 'text-gray-300'}`} style={{fontVariationSettings: i < star ? "'FILL' 1" : "'FILL' 0"}}>
                           star
                         </span>
                       ))}
                     </div>
                     <span className="text-sm text-slate-500">& Up</span>
                   </div>
                ))}
              </div>
            </div>

          </aside>

          {/* Service Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter(service => selectedCategory === 'All' || service.category === selectedCategory)
                .map((service, index) => (
                  <ServiceCard key={service.id} {...service} delay={index * 50} />
              ))}
            </div>
            
            {/* Empty State if no results */}
            {services.filter(service => selectedCategory === 'All' || service.category === selectedCategory).length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">No services found</h3>
                 <p className="text-slate-500">Try adjusting your filters or search for a different category.</p>
               </div>
            )}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;