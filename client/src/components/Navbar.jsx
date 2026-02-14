import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-10">
      <div className="flex items-center gap-3 text-slate-900 dark:text-white">
        <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[20px]">handyman</span>
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">ServiceFinder</h2>
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
        <nav className="flex items-center gap-8">
          <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium">Home</Link>
          <Link to="/services" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium">Services</Link>
          <Link to="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium">How it Works</Link>
        </nav>
        <div className="flex gap-3">
          {currentUser ? (
            <>
              <Link to="/dashboard">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 transition-colors text-sm font-bold">
                  Dashboard
                </button>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white hover:bg-blue-700 transition-colors text-sm font-bold shadow-lg shadow-primary/30">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 transition-colors text-sm font-bold">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white hover:bg-blue-700 transition-colors text-sm font-bold shadow-lg shadow-primary/30">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden flex items-center">
        <button className="text-slate-900 dark:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;