import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io('https://service-finder-app.onrender.com');

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('serviceFinderToken');
        const response = await fetch('https://service-finder-app.onrender.com/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setNotifications(await response.json());
      } catch (error) {}
    };
    fetchNotifications();

    socket.emit('join_notification_room', currentUser._id || currentUser.id);
    socket.on('receive_notification', (notif) => setNotifications((prev) => [notif, ...prev]));

    return () => socket.off('receive_notification');
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('serviceFinderToken');
      await fetch('https://service-finder-app.onrender.com/api/notifications/read-all', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {}
  };

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      localStorage.removeItem('serviceFinderUser');
      localStorage.removeItem('serviceFinderToken');
      navigate('/login');
    } catch (error) {}
  };

  return (
    <nav className={`sticky top-0 z-40 w-full transition-all duration-300 font-display ${
      isScrolled ? 'bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-md shadow-sm' : 'bg-white dark:bg-[#0f1117]'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between items-center relative">
          
          <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-white group z-50">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">handyman</span>
            </div>
            <span className="text-xl font-black tracking-tight">ServiceFinder</span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link to="/" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Home</Link>
            <Link to="/services" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Services</Link>
            <Link to="/about" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">About Us</Link>
            
            <button onClick={toggleTheme} className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors size-10 flex items-center justify-center">
              <span className={`material-symbols-outlined absolute transition-all duration-500 transform ${isDarkMode ? 'opacity-100 rotate-0 scale-100 text-yellow-400' : 'opacity-0 -rotate-90 scale-50'}`}>light_mode</span>
              <span className={`material-symbols-outlined absolute transition-all duration-500 transform ${!isDarkMode ? 'opacity-100 rotate-0 scale-100 text-slate-700' : 'opacity-0 rotate-90 scale-50'}`}>dark_mode</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-4 border-l pl-6 border-slate-200 dark:border-slate-800 relative">
                {/* Desktop Notification Bell */}
                <button onClick={() => { setIsNotifOpen(!isNotifOpen); if (unreadCount > 0) handleMarkAllRead(); }} className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors relative">
                  <span className="material-symbols-outlined text-2xl">notifications</span>
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f1117]"></span>}
                </button>
                <Link to="/dashboard">
                  <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                     <img src={currentUser.image || currentUser.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Profile" className="w-full h-full object-cover"/>
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l pl-6 border-slate-200 dark:border-slate-800">
                <Link to="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">Log in</Link>
                <Link to="/signup" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-600 transition-all">Sign up</Link>
              </div>
            )}
          </div>

          {/* --- MOBILE NAVIGATION TOGGLES --- */}
          <div className="flex items-center gap-2 md:hidden z-50">
             <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
               <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
             </button>
             {currentUser && (
               /* FIX: Now correctly toggles dropdown instead of navigating! */
               <button onClick={() => { setIsNotifOpen(!isNotifOpen); if (unreadCount > 0) handleMarkAllRead(); }} className="p-2 text-slate-600 dark:text-slate-300 relative">
                 <span className="material-symbols-outlined">notifications</span>
                 {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full"></span>}
               </button>
             )}
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
             </button>
          </div>

          {/* --- FIX: UNIFIED NOTIFICATION DROPDOWN (Now outside the hidden desktop div) --- */}
          {isNotifOpen && currentUser && (
            <div className="absolute right-4 md:right-32 top-16 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                   <div className="p-6 text-center text-sm text-slate-500">You're all caught up!</div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`p-4 border-b border-slate-100 dark:border-slate-800/50 flex gap-3 ${n.isRead ? 'opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
                      <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'message' ? 'bg-blue-100 text-blue-600' : n.type === 'status' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        <span className="material-symbols-outlined text-[18px]">{n.type === 'message' ? 'chat' : n.type === 'status' ? 'task_alt' : 'event_available'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{n.text}</p>
                        <span className="text-xs text-slate-400 mt-1 block">Just now</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col p-4 gap-4">
          <Link to="/" onClick={()=>setIsMobileMenuOpen(false)} className="text-base font-bold text-slate-900 dark:text-white">Home</Link>
          <Link to="/services" onClick={()=>setIsMobileMenuOpen(false)} className="text-base font-bold text-slate-900 dark:text-white">Services</Link>
          <Link to="/about" onClick={()=>setIsMobileMenuOpen(false)} className="text-base font-bold text-slate-900 dark:text-white">About Us</Link>
          
          <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-2"></div>
          
          {currentUser ? (
            <div className="flex flex-col gap-4">
              <Link to="/dashboard" onClick={()=>setIsMobileMenuOpen(false)} className="text-base font-bold text-primary flex items-center gap-2">
                 <img src={currentUser.image || currentUser.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Profile" className="size-8 rounded-full object-cover"/>
                 Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-base font-bold text-red-500 text-left">Logout</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={()=>setIsMobileMenuOpen(false)} className="w-full text-center py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold">Log In</Link>
              <Link to="/signup" onClick={()=>setIsMobileMenuOpen(false)} className="w-full text-center py-3 bg-primary text-white rounded-xl font-bold">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;