import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("User logged in:", user);
      // Success! Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row font-display">
      
      {/* Left Side: Hero Image */}
      <div className="relative hidden lg:flex flex-1 flex-col justify-end bg-background-dark overflow-hidden p-12">
        <div 
          className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-60 transition-opacity duration-500 hover:opacity-70"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop')" }}
        >
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
        
        <div className="relative z-20 max-w-lg">
          <div className="mb-6 flex items-center gap-3 text-white">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-2xl">handyman</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">ServiceFinder</h2>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            Welcome back!
          </h1>
          <p className="text-lg text-gray-300">
            Log in to manage your bookings and connect with professionals.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-background-dark px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="flex w-full max-w-sm flex-col gap-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 text-[#111218] dark:text-white mb-4">
            <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined">handyman</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ServiceFinder</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-[#111218] dark:text-white">
              Log In
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to access your account.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#111218] dark:text-white" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                </div>
                <input className="block w-full rounded-lg border-0 py-3 pl-10 text-[#111218] shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-background-dark dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6" id="email" type="email" placeholder="name@example.com"/>
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#111218] dark:text-white" htmlFor="password">
                  Password
                </label>
                <a className="text-sm font-semibold text-primary hover:text-blue-700" href="/">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                </div>
                <input className="block w-full rounded-lg border-0 py-3 pl-10 text-[#111218] shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-background-dark dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6" id="password" type="password" placeholder="Enter your password"/>
              </div>
            </div>

            <button className="flex w-full items-center justify-center rounded-lg bg-primary py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors" type="submit">
              Sign in
            </button>
          </form>

          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-white dark:bg-background-dark px-4 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <div>
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800 py-2.5 px-3 text-sm font-semibold text-[#111218] dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.5833-.0667-1.15-.1667-1.7h-8.2833v3.2167h4.8333c-.2333 1.15-.9 2.1167-1.8833 2.7667l2.9667 2.3c1.7833-1.65 2.8167-4.0833 2.8167-6.9167 0-6.6333-5.3667-12-12-12s-12 5.3667-12 12 5.3667 12 12 12z" fill="#4285F4" fillRule="evenodd"></path>
                <path d="M12.0003 20.45c-2.4333 0-4.6333-1.0167-6.1833-2.65l2.9167-2.3167c.9667.65 2.1667 1.05 3.2667 1.05 3.0333 0 5.5833-2.05 6.5-4.8333h3.1833v2.5333c-1.6167 3.2167-4.9333 5.4167-8.6833 5.4167z" fill="#34A853" fillRule="evenodd"></path>
                <path d="M5.5003 14.6167c-.2333-.7167-.3667-1.4833-.3667-2.2833s.1333-1.5667.3833-2.2833l-3.1833-2.55c-.65 1.3-1.0167 2.7667-1.0167 4.3167s.3667 3.0167 1.0167 4.3333l3.1667-2.5333z" fill="#FBBC05" fillRule="evenodd"></path>
                <path d="M12.0003 3.5833c1.6667 0 3.1667.5833 4.35 1.55l3.1333-3.1333c-2-1.8667-4.6667-3-7.4833-3-4.3167 0-8.0833 2.45-9.8833 6.1l3.1833 2.4833c.9167-2.7333 3.4667-4.75 6.5-4.75z" fill="#EA4335" fillRule="evenodd"></path>
              </svg>
              <span className="text-sm">Sign in with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
             Don't have an account? 
             <Link to="/signup" className="font-bold text-primary hover:text-blue-700 transition-colors ml-1">
               Sign up for free
             </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;