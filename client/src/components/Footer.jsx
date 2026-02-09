import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 px-4 md:px-10">
      <div className="mx-auto max-w-[960px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="flex items-center justify-center size-6 rounded bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[16px]">handyman</span>
              </div>
              <span className="text-lg font-bold">ServiceFinder</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Connecting homeowners with trusted local professionals since 2023.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">Company</h4>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">About Us</a>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Careers</a>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Press</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">Support</h4>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Help Center</a>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Safety</a>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Terms</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">For Pros</h4>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">How it Works</a>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Pricing</a>
            <a href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Sign Up</a>
          </div>
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2024 ServiceFinder Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;