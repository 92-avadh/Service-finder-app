import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// 1. Import AOS and its CSS
import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [featuredPros, setFeaturedPros] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 2. Initialize AOS
    AOS.init({
      duration: 800,      // Animation duration
      once: true,         // Only animate once when scrolling down
      offset: 100,        // Offset trigger point
      easing: 'ease-out-cubic',
    });

    const fetchFeatured = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/services/featured');
        if (res.ok) setFeaturedPros(await res.json());
      } catch (error) { console.error("Error fetching featured pros", error); }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${searchQuery}`);
    }
  };

  const categories = [
    { name: 'Cleaning', icon: 'cleaning_services', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Plumbing', icon: 'plumbing', color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { name: 'Electrical', icon: 'electric_bolt', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { name: 'Carpentry', icon: 'carpenter', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { name: 'Painting', icon: 'format_paint', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
    { name: 'Appliance Repair', icon: 'kitchen', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1117] font-display transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-4xl mx-auto" data-aos="zoom-in" data-aos-duration="1000">
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-300 font-bold text-sm mb-6 border border-blue-200 dark:border-blue-800 shadow-sm">
            🚀 The #1 Local Service Finder App
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            Book Trusted <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">Professionals</span> Instantly.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            From emergency repairs to regular home cleaning, connect with highly-rated local experts who get the job done right.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-2 sm:rounded-full rounded-2xl shadow-2xl shadow-primary/10 border border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-primary/20">
            <div className="flex-1 flex items-center pl-4">
              <span className="material-symbols-outlined text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="What service do you need?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-4 py-3 sm:py-4 bg-transparent text-slate-900 dark:text-white outline-none font-medium placeholder:text-slate-400"
              />
            </div>
            <button type="submit" className="bg-gradient-to-r from-primary to-blue-600 hover:to-cyan-500 text-white px-8 py-3 sm:py-4 rounded-xl sm:rounded-full font-bold text-lg shadow-md transition-all hover:scale-[1.02] active:scale-95">
              Search
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400 flex-wrap" data-aos="fade-up" data-aos-delay="400">
            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-green-500">verified</span> Verified Pros</div>
            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-primary">security</span> OTP Protected Jobs</div>
            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-yellow-500">star</span> Genuine Reviews</div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Your safety and satisfaction are our top priorities. Here is our secure workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700 z-0"></div>

            {[
              { title: "Book a Pro", desc: "Browse categories, read reviews, and request a booking without paying upfront.", icon: "touch_app", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
              { title: "Share Start OTP", desc: "When the pro arrives, share your secure 4-digit code to officially start the job.", icon: "pin", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
              { title: "Pay & Review", desc: "Pay only after the job is done and the professional sends you the final bill.", icon: "task_alt", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center group" data-aos="fade-up" data-aos-delay={idx * 200}>
                <div className={`size-24 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 ${step.bg} ${step.color}`}>
                  <span className="material-symbols-outlined text-4xl">{step.icon}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full text-sm font-black text-slate-400 dark:text-slate-500 mb-4 tracking-widest uppercase">
                  STEP 0{idx + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-12 gap-4 text-center sm:text-left" data-aos="fade-right">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Explore Categories</h2>
              <p className="text-slate-500 dark:text-slate-400">Find exactly what you need.</p>
            </div>
            <Link to="/services" className="flex items-center gap-1 text-primary font-bold hover:underline px-6 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-colors">
              View All <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat, idx) => (
              <Link key={idx} to={`/services?category=${cat.name}`} className="group bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-sm border border-slate-200/50 dark:border-slate-800 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-300" data-aos="zoom-in" data-aos-delay={idx * 100}>
                <div className={`size-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${cat.bg} ${cat.color}`}>
                  <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-20 bg-slate-100 dark:bg-[#11131a] relative z-10 border-y border-slate-200 dark:border-slate-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8" data-aos="fade-right">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Why Choose ServiceFinder?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">We take the stress out of hiring local help. Our platform is built on transparency, security, and quality.</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { title: "Transparent Pricing", desc: "No hidden fees. Professionals set their hourly rates, and you only pay for the work done.", icon: "price_check" },
                  { title: "Verified Reviews", desc: "Only customers who have completed a job with a professional can leave a review.", icon: "rate_review" },
                  { title: "Real-Time Chat", desc: "Communicate directly with your professional in the app to discuss project details.", icon: "forum" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4" data-aos="fade-up" data-aos-delay={idx * 150}>
                    <div className="size-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                      <span className="material-symbols-outlined">{feature.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800" data-aos="fade-left">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" alt="Professional Worker" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white" data-aos="fade-up" data-aos-delay="300">
                <div className="flex items-center gap-2 mb-2 text-yellow-400">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                </div>
                <p className="font-medium">"The plumber arrived exactly on time, used the start code, and fixed my sink in under an hour. Incredible service!"</p>
                <p className="font-bold mt-2 text-primary dark:text-blue-300">- Sarah Jenkins</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED PROFESSIONALS --- */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Top Rated Professionals</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Hire local experts who consistently deliver outstanding results and 5-star experiences.</p>
          </div>

          {featuredPros.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPros.map((pro, index) => (
                <div key={pro._id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-md border border-slate-200/60 dark:border-slate-800 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500" data-aos="fade-up" data-aos-delay={index * 150}>
                  <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={pro.image || "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=600"} alt={pro.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-primary shadow-sm uppercase tracking-wide">
                      {pro.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col relative">
                    <div className="absolute -top-6 right-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black px-4 py-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-yellow-500 text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      {pro.rating}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{pro.name}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">{pro.title}</p>
                    
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold mb-6">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      {pro.location}
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">₹{pro.price}</span>
                        <span className="text-slate-500 text-xs font-bold ml-1">/ hr</span>
                      </div>
                      <Link to={`/service-details/${pro._id}`} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all shadow-sm">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 animate-pulse">Loading top professionals...</div>
          )}
        </div>
      </section>

      {/* --- CALL TO ACTION (BECOME A PRO) --- */}
      <section className="py-20 relative z-10 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 dark:from-primary dark:to-blue-900 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden" data-aos="zoom-in-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary opacity-20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Are you a professional?</h2>
            <p className="text-lg text-slate-300 dark:text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of experts who are growing their business with ServiceFinder. Set your own hours, name your price, and get booked instantly.
            </p>
            <Link to="/signup" className="inline-flex items-center justify-center bg-white text-slate-900 dark:text-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
              Become a Provider Today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;