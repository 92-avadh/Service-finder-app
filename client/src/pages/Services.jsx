import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/services');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setServices(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not load services. Is the server running?");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Derive categories dynamically from fetched data + always include 'All'
  const categories = ['All', ...new Set(services.map(s => s.category))];

  const filteredServices = services.filter(
    service => selectedCategory === 'All' || service.category === selectedCategory
  );

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Find Professionals</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {loading ? 'Loading...' : `${filteredServices.length} professionals available`}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center">
                    <input 
                      id={`cat-${cat}`} 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 text-primary"
                    />
                    <label htmlFor={`cat-${cat}`} className="ml-2 text-sm font-medium text-slate-900 dark:text-gray-300 cursor-pointer">
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Service Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading services...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No services found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service._id || service.id} service={service} />
                ))}
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