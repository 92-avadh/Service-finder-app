import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from '../components/FullPageLoader'; // <-- NEW

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  
  const [isLoading, setIsLoading] = useState(false); // <-- NEW

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // --- GOOGLE LOGIN (Communicates with your server) ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true); // <-- NEW
      try {
        const response = await fetch('https://service-finder-app.onrender.com/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenResponse.access_token}`
          },
          body: JSON.stringify({ role: userType })
        });

        const data = await response.json();

        if (response.ok) {
          login(data.user, data.token); 
          navigate('/dashboard');
        } else {
          setIsLoading(false); // <-- NEW
          alert(data.message || "Google Login failed on server.");
        }
      } catch (error) {
        setIsLoading(false); // <-- NEW
        console.error('Backend authentication failed:', error);
        alert('Server error during Google Login.');
      }
    },
    onError: error => console.error('Google Login Failed:', error)
  });

  // --- MANUAL LOGIN (Communicates with your server) ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // <-- NEW
    try {
      const response = await fetch('https://service-finder-app.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token); 
        navigate('/dashboard');
      } else {
        setIsLoading(false); // <-- NEW
        alert(data.message || "Invalid email or password.");
      }
    } catch (error) {
      setIsLoading(false); // <-- NEW
      console.error("Login request failed:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row font-display">
      
      {/* --- NEW: LOADER OVERLAY --- */}
      {isLoading && <FullPageLoader message="Authenticating..." />}

      {/* Left Side: Hero Image */}
      <div className="relative hidden lg:flex flex-1 flex-col justify-end bg-background-dark overflow-hidden p-12">
        <div 
          className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-60 transition-opacity duration-500 hover:opacity-70"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop')" }}
        >
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
        
        {/* Back to Home Button (Desktop) */}
        <div className="absolute top-10 left-10 z-30">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-colors bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md shadow-sm">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="relative z-20 max-w-lg">
          <Link to="/" className="mb-6 flex items-center gap-3 text-white hover:opacity-80 transition-opacity w-fit">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-2xl">handyman</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">ServiceFinder</h2>
          </Link>
          
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            Welcome back!
          </h1>
          <p className="text-lg text-gray-300">
            Log in to manage your bookings and connect with professionals.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-white dark:bg-background-dark px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        
        {/* Back to Home Button (Mobile) */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded-full backdrop-blur-md bg-white/80 dark:bg-background-dark/80 text-slate-900 dark:text-white shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
        >
           <span className="material-symbols-outlined text-[20px]">arrow_back</span>
           <span>Back</span>
        </Link>

        <div className="flex w-full max-w-sm flex-col gap-8 mt-16 lg:mt-0">
          
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-[#111218] dark:text-white mb-4 w-fit">
            <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined">handyman</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ServiceFinder</span>
          </Link>

          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-[#111218] dark:text-white">
              Log In
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button 
              type="button"
              onClick={() => setUserType('customer')}
              className={`flex items-center justify-center rounded-md py-2.5 text-sm font-bold transition-all ${
                userType === 'customer' 
                  ? 'bg-white dark:bg-background-dark text-[#111218] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#111218] dark:hover:text-white'
              }`}
            >
              Customer
            </button>
            <button 
              type="button"
              onClick={() => setUserType('provider')}
              className={`flex items-center justify-center rounded-md py-2.5 text-sm font-bold transition-all ${
                userType === 'provider' 
                  ? 'bg-white dark:bg-background-dark text-[#111218] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#111218] dark:hover:text-white'
              }`}
            >
              Professional
            </button>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleEmailLogin}>
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#111218] dark:text-white" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                </div>
                <input 
                  className="block w-full rounded-lg border-0 py-3 pl-10 text-[#111218] shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-background-dark dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6" 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                <input 
                  className="block w-full rounded-lg border-0 py-3 pl-10 text-[#111218] shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-background-dark dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6" 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="flex w-full items-center justify-center rounded-lg bg-primary py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors" type="submit">
              Sign in as {userType === 'customer' ? 'Customer' : 'Professional'}
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

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => handleGoogleLogin()}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800 py-2.5 px-3 text-sm font-semibold text-[#111218] dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
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