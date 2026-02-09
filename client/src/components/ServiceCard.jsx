import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ image, name, category, rating, reviews, price, location, delay }) => {
  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2"
      style={{ 
        animation: `fadeInUp 0.6s ease-out forwards`,
        animationDelay: `${delay}ms`,
        opacity: 0 // Start invisible so it fades in
      }}
    >
      {/* Card Image with Zoom Effect */}
      <div className="relative h-48 overflow-hidden">
        {/* Placeholder background while loading */}
        <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
        
        <img 
          src={image} 
          alt={name} 
          className="relative z-10 h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" 
          loading="lazy"
        />
        
        {/* Floating Badges */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 backdrop-blur-md shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
          {rating} ({reviews})
        </div>
        <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {category}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mt-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {location}
            </div>
          </div>
        </div>

        {/* Price and Action Button */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">Starting at</span>
            {/* UPDATED TO INR */}
            <span className="text-lg font-black text-primary">₹{price}</span>
          </div>
          <Link to="/service-details">
            <button className="relative overflow-hidden rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-95 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary dark:group-hover:text-white">
              Book Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;