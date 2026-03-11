import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FavoritesTab = () => {
  const [favorites, setFavorites] = useState([]);
  const [isFetchingFavs, setIsFetchingFavs] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsFetchingFavs(true);
      try {
        const token = sessionStorage.getItem('serviceFinderToken');
        const response = await fetch('https://service-finder-app.onrender.com/api/users/favorites', { headers: { 'Authorization': `Bearer ${token}` }});
        if (response.ok) setFavorites(await response.json());
      } catch (error) { console.error(error); } finally { setIsFetchingFavs(false); }
    };
    fetchFavorites();
  }, []);

  const removeFavorite = async (providerId) => {
    try {
      const token = sessionStorage.getItem('serviceFinderToken');
      const response = await fetch('https://service-finder-app.onrender.com/api/users/favorites/toggle', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ providerId })
      });
      if (response.ok) setFavorites(favorites.filter(fav => fav._id !== providerId));
    } catch (error) {}
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Saved Professionals</h2>
        <p className="text-slate-500 dark:text-slate-400">Quickly access the providers you loved or want to book later.</p>
      </div>
      {isFetchingFavs ? (
        <div className="animate-pulse flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((provider) => (
            <div key={provider._id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src={provider.image || "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=600"} alt={provider.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <button onClick={() => removeFavorite(provider._id)} className="absolute top-4 right-4 size-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10">
                  <span className="material-symbols-outlined text-[18px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{provider.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-yellow-500">{provider.rating}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-4">{provider.title}</p>
                <div className="mt-auto flex gap-2">
                  <Link to={`/service-details/${provider._id}`} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold text-center">View Profile</Link>
                  <Link to={`/service-details/${provider._id}`} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold text-center">Book Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 text-sm mb-6">You haven't saved any professionals to your favorites.</p>
            <Link to="/services" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md">Browse Professionals</Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;