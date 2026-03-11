import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const categories = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Appliance Repair'];

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        let url = `http://localhost:5000/api/services?category=${activeCategory}`;
        if (searchTerm) url += `&search=${searchTerm}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch services");
      } finally {
        setIsLoading(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchServices();
      setSearchParams({ category: activeCategory, search: searchTerm });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchTerm, setSearchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1117] font-display transition-colors duration-500">
      <Navbar />

      {/* --- SLEEK SEARCH HEADER --- */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-10 pb-16 px-4 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Find a Professional</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Top-rated local experts, ready to help.</p>
          </div>
          
          <div className="w-full md:max-w-md relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search services or names..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- SCROLLABLE FILTER PILLS --- */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-4 snap-x">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 snap-center border-2 ${
                activeCategory === category 
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-white/10 scale-105' 
                  : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* --- PREMIUM GRID LAYOUT --- */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-[2rem] h-[400px] animate-pulse border border-slate-200 dark:border-slate-800 shadow-sm"></div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services.map(service => (
              <div key={service._id} className="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 flex flex-col relative">
                
                {/* Image Section */}
                <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  
                  {/* Glassmorphism Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-primary shadow-sm uppercase tracking-wide border border-white/20 dark:border-slate-700/50">
                    {service.category}
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{service.name}</h3>
                    
                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-700/30 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[16px] text-yellow-500" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span className="text-xs font-black text-slate-900 dark:text-yellow-500">{service.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4 line-clamp-1">{service.title}</p>
                  
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-semibold mb-6">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="truncate">{service.location}</span>
                  </div>
                  
                  {/* Action Footer */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Starting at</span>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">₹{service.price}</span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">/ {service.unit || 'hr'}</span>
                      </div>
                    </div>
                    
                    <Link to={`/service-details/${service._id}`} className="flex items-center justify-center size-12 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-700 group-hover:border-primary">
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-[2rem] pointer-events-none transition-colors duration-500"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
             <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
               <span className="material-symbols-outlined text-4xl">search_off</span>
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No professionals found</h3>
             <p className="text-slate-500 text-lg">Try adjusting your search or category filter to find what you need.</p>
             <button onClick={() => {setSearchTerm(''); setActiveCategory('All');}} className="mt-6 font-bold text-primary hover:underline">Clear Filters</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Services;