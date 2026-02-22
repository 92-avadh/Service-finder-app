import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const developers = [
    {
      name: "Avadh",
      role: "Lead Full-Stack Developer",
      image: "/dev1.jpg",
      bio: "Architected the core platform, secure OTP workflow, and real-time socket integrations."
    },
    {
      name: "Zeel",
      role: "Frontend Engineer",
      image: "/dev4.jpg",
      bio: "Crafted the beautiful, responsive, and accessible user interfaces with Tailwind CSS."
    },
    {
      name: "Smit",
      role: "Backend Specialist",
      image: "/dev3.jpg",
      bio: "Ensured maximum database security, fast queries, and seamless Stripe payments."
    },
    {
      name: "Ravi",
      role: "UI/UX Designer",
      image: "/dev2.jpg",
      bio: "Designed the modern glassmorphism components and seamless user journey."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1117] font-display transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Building the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">Local Services</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            We are a passionate team of developers dedicated to making hiring local professionals safer, faster, and more transparent.
          </p>
        </div>
      </section>

      {/* --- MEET THE DEVELOPERS --- */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Meet the Creators</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">The brilliant minds behind ServiceFinder who turned a vision into reality.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {developers.map((dev, idx) => (
              <div key={idx} className="group bg-white dark:bg-slate-900 rounded-[2rem] p-6 text-center shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500">
                <div className="relative size-32 mx-auto mb-6 rounded-full p-1.5 bg-gradient-to-tr from-primary to-cyan-400 group-hover:rotate-6 transition-transform duration-500">
                  <img src={dev.image} alt={dev.name} className="w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{dev.name}</h3>
                <p className="text-sm font-black text-primary uppercase tracking-wide mb-4">{dev.role}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{dev.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SUPPORT & COMPLAINTS SECTION --- */}
      <section className="py-20 bg-slate-100 dark:bg-[#141721] border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center size-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-3xl mb-8 shadow-sm">
            <span className="material-symbols-outlined text-4xl">support_agent</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Need Help or Have a Complaint?</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Your safety and satisfaction are our top priorities. If a professional did not meet your expectations or you faced any issues, please reach out to our dedicated support team immediately.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Email Box */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col items-center hover:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">mail</span>
              <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm mb-1 uppercase tracking-wide">Email Us</h4>
              <a href="mailto:support@servicefinder.com" className="text-xl font-black text-slate-900 dark:text-white hover:text-primary transition-colors">
                support@servicefinder.com
              </a>
            </div>

            {/* Phone Box */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col items-center hover:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">call</span>
              <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm mb-1 uppercase tracking-wide">Call Helpline</h4>
              <a href="tel:+919876543210" className="text-xl font-black text-slate-900 dark:text-white hover:text-primary transition-colors">
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;