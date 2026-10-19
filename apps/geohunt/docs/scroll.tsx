import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedScrollProps {
  children?: ReactNode;
  isOpen: boolean; // Managed by parent or Zustand for game state
  onToggle?: () => void;
}

const AnimatedScroll: React.FC<AnimatedScrollProps> = ({ children, isOpen, onToggle }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Scroll Container */}
      <div className="relative flex flex-col items-center w-full max-w-sm">
        
        {/* 1. TOP ROLLER */}
        <div className="w-[105%] h-10 bg-gradient-to-b from-[#5d4037] to-[#3e2723] rounded-full z-20 shadow-xl border-b border-black/30 flex items-center justify-between px-2">
           <div className="w-3 h-8 bg-[#8d6e63] rounded-sm shadow-inner" /> 
           <div className="w-3 h-8 bg-[#8d6e63] rounded-sm shadow-inner" />
        </div>

        {/* 2. PARCHMENT CONTAINER */}
        <motion.div
          initial={false}
          animate={{ 
            height: isOpen ? 'auto' : 0,
            minHeight: isOpen ? 250 : 0,
            opacity: isOpen ? 1 : 0 
          }}
          transition={{ 
            duration: 0.7, 
            ease: [0.23, 1, 0.32, 1] 
          }}
          className="w-full bg-[#f3e5ab] z-10 overflow-hidden shadow-inner border-x-[1px] border-amber-900/20"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/paper-fibers.png')`, // Subtle texture
          }}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 text-[#3e2723] font-serif"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 3. BOTTOM ROLLER */}
        <motion.div 
          animate={{ y: isOpen ? 0 : -5 }} // Slight tuck when closed
          className="w-[105%] h-10 bg-gradient-to-t from-[#5d4037] to-[#3e2723] rounded-full z-20 shadow-xl border-t border-black/30 flex items-center justify-between px-2 -mt-1"
        >
           <div className="w-3 h-8 bg-[#8d6e63] rounded-sm shadow-inner" />
           <div className="w-3 h-8 bg-[#8d6e63] rounded-sm shadow-inner" />
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedScroll;
