import React from 'react';
import { motion } from 'framer-motion';

const FullPageLoader = ({ message = "Loading Dashboard..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md dark:bg-[#0f1117]/80">
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-24 w-24 rounded-full border-4 border-blue-500/20"
        />
        
        {/* Spinning Gradient Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-t-4 border-r-4 border-blue-600 border-transparent shadow-lg"
        />
        
        {/* Center Glow */}
        <div className="absolute h-4 w-4 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-sm font-medium tracking-widest text-slate-600 uppercase dark:text-slate-400"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default FullPageLoader;