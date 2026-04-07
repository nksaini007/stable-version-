import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaArrowRight, FaShapes, FaHammer, FaDraftingCompass, FaTruckMoving } from "react-icons/fa";
import heroImg from "../assets/hero_vibe.png";

const CustomerLanding = ({ onSearch, searchQuery, setSearchQuery, onCategoryClick }) => {
  const [isFocused, setIsFocused] = useState(false);

  const categories = [
    { name: "Raw Materials", icon: <FaShapes /> },
    { name: "Architects", icon: <FaDraftingCompass /> },
    { name: "Construction", icon: <FaHammer /> },
    { name: "Logistics", icon: <FaTruckMoving /> },
  ];

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0b]">
      
      {/* 🌌 Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroImg} 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/40 via-[#0a0a0b]/20 to-[#0a0a0b]"></div>
      </div>

      {/* 🏗️ Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-6 sm:px-12 flex flex-col items-center text-center">
        
        {/* Badge Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/70">
            India's Leading Construction Ecosystem
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl md:text-8xl font-heading text-white mb-6 leading-[1.1] tracking-tight"
        >
          Build with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">
            Absolute Precision
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl text-lg sm:text-xl text-white/50 mb-12 font-light leading-relaxed"
        >
          Connecting architects, materials, and workforce in one unified, high-performance platform. Professional scale construction, simplified.
        </motion.p>

        {/* 🔍 THE ULTIMATE SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-3xl relative"
        >
          <div 
            className={`group relative flex items-center transition-all duration-500 rounded-3xl p-1.5 border backdrop-blur-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] 
            ${isFocused ? 'bg-white/10 border-white/20 ring-4 ring-white/5' : 'bg-white/5 border-white/10'}`}
          >
            <div className="pl-6 text-white/30 group-hover:text-white/60 transition-colors">
              <FaSearch className="text-xl" />
            </div>
            
            <input
              type="text"
              placeholder="Find materials, premium architects, or site services..."
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="flex-1 bg-transparent px-6 py-5 text-white text-lg placeholder-white/20 focus:outline-none"
            />

            <button
              onClick={onSearch}
              className="px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-[#f5f5f7] transition-all transform hover:scale-[1.02] active:scale-95"
            >
              Explore
              <FaArrowRight size={14} />
            </button>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 opacity-60 hover:opacity-100 transition-opacity">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => onCategoryClick(cat.name)}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
              >
                <span className="text-orange-500 text-sm">{cat.icon}</span>
                <span className="text-white text-[13px] font-medium tracking-wide">{cat.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Accents */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0b] to-transparent"></div>
    </div>
  );
};

export default CustomerLanding;
