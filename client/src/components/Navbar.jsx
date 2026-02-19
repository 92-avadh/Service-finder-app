import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import AuthContext

const Navbar = () => {
  const { currentUser, logout } = useAuth(); // Get real user state
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // For mobile menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // For user dropdown

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-900 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">handyman</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                ServiceFinder
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex md:space-x-8 items-center">
            <Link to="/" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Home</Link>
            <Link to="/services" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Services</Link>
            
            {/* CONDITIONAL RENDERING: Show Dashboard only if logged in */}
            {currentUser && (
              <Link to="/dashboard" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Dashboard</Link>
            )}
          </div>

          {/* Right Side: Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              // --- STATE 1: LOGGED IN (Show User Avatar) ---
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <span>{currentUser.email?.charAt(0).toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {currentUser.displayName?.split(' ')[0] || "User"}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 ring-1 ring-black ring-opacity-5 animate-fade-up">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm text-slate-900 dark:text-white font-bold truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // --- STATE 2: LOGGED OUT (Show Login/Signup) ---
              <>
                <Link to="/login" className="text-sm font-bold text-slate-700 dark:text-white hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              <span className="material-symbols-outlined text-3xl">
                {isOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Simplified) */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-1 px-4 py-6">
            <Link to="/" className="block py-2 text-base font-medium text-slate-900 dark:text-white">Home</Link>
            <Link to="/services" className="block py-2 text-base font-medium text-slate-900 dark:text-white">Services</Link>
            {currentUser ? (
               <>
                 <Link to="/dashboard" className="block py-2 text-base font-medium text-primary">My Dashboard</Link>
                 <button onClick={handleLogout} className="block w-full text-left py-2 text-base font-medium text-red-600">Log out</button>
               </>
            ) : (
               <div className="mt-4 flex flex-col gap-3">
                 <Link to="/login" className="w-full text-center py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">Log in</Link>
                 <Link to="/signup" className="w-full text-center py-3 rounded-lg bg-primary text-white font-bold">Sign up</Link>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;