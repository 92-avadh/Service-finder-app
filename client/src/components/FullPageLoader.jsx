import React from 'react';
import { motion } from 'framer-motion';

const FullPageLoader = ({ message = "Loading..." }) => {
  // Animation config for the bouncing dots
  const containerVariants = {
    start: { transition: { staggerChildren: 0.2 } },
    end: { transition: { staggerChildren: 0.2 } },
  };

  const dotVariants = {
    start: { y: 0, opacity: 0.3, scale: 0.8 },
    end: { y: -12, opacity: 1, scale: 1.1 },
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-xl dark:bg-[#0f1117]/80 transition-all duration-300">
      
      {/* 1. App Logo / Brand Element */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10 relative flex items-center justify-center size-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 shadow-xl shadow-blue-500/30"
      >
        <span className="material-symbols-outlined text-white text-4xl">handyman</span>
        
        {/* Rotating Dashed Ring around the logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 rounded-[2rem] border-2 border-dashed border-blue-500/40 dark:border-blue-400/30"
        />
        {/* Reverse Rotating Solid Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-6 rounded-[2.5rem] border border-blue-500/10 dark:border-blue-400/10"
        />
      </motion.div>

      {/* 2. Bouncing Glowing Dots */}
      <motion.div 
        variants={containerVariants}
        initial="start"
        animate="end"
        className="flex gap-3 mb-6"
      >
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            variants={dotVariants}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            }}
            className="size-3.5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.8)]"
          />
        ))}
      </motion.div>

      {/* 3. Message with Shimmer/Sweep Effect */}
      <div className="relative overflow-hidden px-4 py-1">
        <p className="text-sm font-bold tracking-[0.25em] text-slate-500 dark:text-slate-400 uppercase">
          {message}
        </p>
        
        {/* The sweeping light glare across the text */}
        <motion.div 
          animate={{ x: ['-100%', '250%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
          className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-slate-800 dark:via-white to-transparent opacity-20 skew-x-12"
        />
      </div>

    </div>
  );
};

export default FullPageLoader;