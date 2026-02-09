import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  // Data for the Featured Professionals cards (Updated to INR)
  const featuredPros = [
    {
      id: 1,
      name: "Michael Foster",
      category: "Electrician",
      rating: 4.9,
      reviews: 120,
      price: "499/hr",
      location: "Mumbai, MH",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      category: "House Cleaning",
      rating: 4.8,
      reviews: 85,
      price: "299/hr",
      location: "Bangalore, KA",
      image: "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 3,
      name: "David Ross",
      category: "Plumbing",
      rating: 5.0,
      reviews: 210,
      price: "599/hr",
      location: "Delhi, DL",
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 4,
      name: "Emma Wilson",
      category: "Painting",
      rating: 4.7,
      reviews: 45,
      price: "399/hr",
      location: "Pune, MH",
      image: "https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?auto=format&fit=crop&q=80&w=400"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Custom Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; animation-delay: 1s; }
        .animate-fade-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
      `}</style>

      <Navbar />
      
      <main className="flex-1 overflow-x-hidden">
        
        {/* --- Hero Section --- */}
        <div className="relative bg-slate-900 pb-24 pt-16 sm:pt-24 lg:pb-32 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#444cf7 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Column: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-sm font-medium mb-6 animate-fade-up backdrop-blur-sm border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Available in your area
              </div>
              
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                Expert services, <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  on demand.
                </span>
              </h1>
              
              <p className="mt-4 text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                Don't waste time calling around. Book trusted professionals for cleaning, repair, and maintenance instantly.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <button className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95">
                  Book a Service
                </button>
                <button className="w-full sm:w-auto rounded-full bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all hover:border-white/20">
                  How it Works
                </button>
              </div>
            </div>

            {/* Right Column: Floating 3D Cards */}
            <div className="flex-1 relative w-full max-w-[500px] hidden md:block perspective-1000">
              {/* Floating Status Card 1 */}
              <div className="absolute top-0 right-10 z-20 animate-float">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-4 w-64 backdrop-blur-xl bg-opacity-95">
                  <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Service Completed</p>
                    <p className="text-xs text-slate-500">Just now • Plumbing</p>
                  </div>
                </div>
              </div>

              {/* Floating Status Card 2 */}
              <div className="absolute top-32 right-0 z-10 animate-float-delayed">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-4 w-64 backdrop-blur-xl bg-opacity-95">
                  <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                    <span className="material-symbols-outlined">star</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Top Rated Pro</p>
                    <p className="text-xs text-slate-500">4.9/5 Average Rating</p>
                  </div>
                </div>
              </div>
              
              {/* Hero Image Blob */}
              <div className="relative mt-12 ml-10 z-0 opacity-80 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                 <img 
                   src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600" 
                   alt="Worker" 
                   className="rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 border-4 border-slate-800/50 w-80 h-auto object-cover"
                 />
              </div>
            </div>
          </div>
        </div>

        {/* --- Featured Professionals Section --- */}
        <section className="relative z-20 -mt-20 px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8 px-2 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-2 px-4 rounded-lg inline-block shadow-sm">
                Featured Professionals
              </h2>
              <Link to="/services" className="group flex items-center gap-1 text-sm font-bold text-white hover:text-primary transition-colors">
                See All 
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            
            {/* Grid of ServiceCards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPros.map((pro, index) => (
                <ServiceCard key={pro.id} {...pro} delay={index * 100 + 600} />
              ))}
            </div>
          </div>
        </section>

        {/* --- Categories Section --- */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { title: 'Plumbing', icon: 'plumbing', color: 'bg-blue-100 text-blue-600' },
                { title: 'Electrical', icon: 'bolt', color: 'bg-amber-100 text-amber-600' },
                { title: 'Cleaning', icon: 'cleaning_services', color: 'bg-green-100 text-green-600' },
                { title: 'Moving', icon: 'local_shipping', color: 'bg-purple-100 text-purple-600' },
                { title: 'Painting', icon: 'format_paint', color: 'bg-rose-100 text-rose-600' },
                { title: 'Gardening', icon: 'yard', color: 'bg-emerald-100 text-emerald-600' },
              ].map((cat, idx) => (
                <div 
                  key={cat.title} 
                  className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1"
                  style={{ animation: 'fadeInUp 0.6s ease-out forwards', opacity: 0, animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`size-14 rounded-full flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{cat.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Why Choose Us Section --- */}
        <section className="py-24 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Why homeowners trust ServiceFinder</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">We're not just a directory. We're the safest way to hire local professionals.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { title: 'Vetted Professionals', desc: 'Every pro passes a strict background check and skills assessment before joining.', icon: 'verified_user', color: 'text-blue-500' },
                { title: 'Upfront Pricing', desc: 'See the price before you book. No hidden fees or last-minute surprises.', icon: 'payments', color: 'text-green-500' },
                { title: 'Happiness Guarantee', desc: 'If you are not satisfied with the work, we will make it right or give your money back.', icon: 'sentiment_satisfied_alt', color: 'text-purple-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6">
                  <div className={`mb-6 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-md ${item.color}`}>
                    <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- NEW: "Join as a Professional" Section (Replaces App Download) --- */}
        <section className="relative py-24 px-4 overflow-hidden">
           {/* Dark Background */}
           <div className="absolute inset-0 bg-slate-900"></div>
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#444cf7 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
           
           <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
             <div className="bg-primary/10 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="grid lg:grid-cols-2 gap-12 items-center p-8 md:p-12 lg:p-16">
                  
                  {/* Left: Text */}
                  <div className="text-left space-y-6">
                    <div className="inline-block px-4 py-1 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30">
                      Join Our Community
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                      Grow your business with ServiceFinder.
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      Join 10,000+ professionals who use our platform to find consistent work, manage bookings, and get paid instantly. No subscription fees.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                      <Link to="/signup">
                        <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-xl">
                          Register as a Professional
                        </button>
                      </Link>
                      <button className="px-8 py-4 rounded-xl font-bold text-white border border-white/20 hover:bg-white/10 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>

                  {/* Right: Visual */}
                  <div className="relative hidden lg:block h-full min-h-[400px]">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000" 
                          alt="Professional checking schedule" 
                          className="rounded-2xl shadow-2xl border-4 border-slate-800/50 rotate-2 hover:rotate-0 transition-transform duration-500 object-cover w-full max-w-md"
                        />
                        {/* Floating Stats Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-4 animate-float-delayed">
                          <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                             <span className="material-symbols-outlined">payments</span>
                          </div>
                          <div>
                             <p className="text-xs text-slate-500 uppercase font-bold">Average Earnings</p>
                             <p className="text-xl font-black text-slate-900 dark:text-white">₹85,000<span className="text-sm font-medium text-slate-400">/mo</span></p>
                          </div>
                        </div>
                     </div>
                  </div>

                </div>
             </div>
           </div>
        </section>

        {/* --- Recent Activity Feed --- */}
        <section className="py-16 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
           <div className="mx-auto max-w-7xl px-6 lg:px-8">
             <div className="flex flex-col md:flex-row gap-12 items-center">
               
               {/* Feed Text */}
               <div className="flex-1">
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Don't just take our word for it.</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">See what your neighbors are getting done right now. Real bookings, real reviews.</p>
                 <div className="flex gap-4">
                    <div className="flex flex-col p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="text-3xl font-black text-primary">12k+</span>
                      <span className="text-sm text-slate-500">Bookings</span>
                    </div>
                    <div className="flex flex-col p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="text-3xl font-black text-primary">4.8</span>
                      <span className="text-sm text-slate-500">Avg Rating</span>
                    </div>
                 </div>
               </div>
               
               {/* Feed Cards */}
               <div className="flex-1 w-full grid gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4 items-center hover:shadow-md transition-shadow">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="size-10 rounded-full ring-2 ring-primary/20" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white"><strong>Jessica M.</strong> booked a <strong>Deep Clean</strong></p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        2 minutes ago in Mumbai, MH
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4 items-center hover:shadow-md transition-shadow">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="size-10 rounded-full ring-2 ring-primary/20" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white"><strong>Mark T.</strong> left a 5-star review for <strong>Mike's Plumbing</strong></p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-yellow-500">star</span>
                        15 minutes ago in Delhi, DL
                      </p>
                    </div>
                  </div>
               </div>
             </div>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Home;