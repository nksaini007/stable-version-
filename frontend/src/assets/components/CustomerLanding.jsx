import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaArrowRight, FaShapes, FaHammer, FaDraftingCompass, FaTruckMoving, FaPlus } from "react-icons/fa";
import heroImg from "../hero_vibe.png";

const CustomerLanding = ({ onSearch, searchQuery, setSearchQuery, onCategoryClick }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const categories = [
    { name: "RAW MATERIALS", icon: <FaShapes />, count: "12k+" },
    { name: "PREACH ARCHITECTS", icon: <FaDraftingCompass />, count: "480" },
    { name: "WOLF FORCE", icon: <FaHammer />, count: "2.4k" },
    { name: "NEO LOGISTICS", icon: <FaTruckMoving />, count: "90+" },
  ];

  // Mouse tracking for parallax glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white">
      
      {/* 🚀 Dynamic Background - Cyber Vibe */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={heroImg} 
          alt="Cyber Hero" 
          className="w-full h-full object-cover grayscale-[0.5] contrast-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
        
        {/* Parallax Radial Glow */}
        <div 
          className="fixed w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate(${cursorPos.x - 300}px, ${cursorPos.y - 300}px)` }}
        ></div>
      </div>

      {/* 🔮 Hero Container */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        
        {/* Tech Header Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-2"
        >
          <div className="h-[2px] w-12 bg-lime-400"></div>
          <span className="text-[12px] font-bold tracking-[0.4em] text-lime-400">
            SYSTEM_STINCHAR_V2.0
          </span>
        </motion.div>

        {/* Aggressive Headline */}
        <div className="relative mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "anticipate" }}
            className="text-7xl sm:text-8xl md:text-[10rem] font-heading leading-[0.85] mb-2"
          >
            THE<br />FUTURE
          </motion.h1>
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "anticipate" }}
            className="text-7xl sm:text-8xl md:text-[10rem] font-heading leading-[0.85] text-outline opacity-60"
          >
            OF_BUILD
          </motion.h1>
        </div>

        {/* 📟 CYBER SEARCH MODULE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-4xl relative group"
        >
          {/* Scanner Line Animation */}
          <div className={`absolute top-0 left-0 w-full h-[1px] bg-lime-400 shadow-[0_0_10px_#bef264] z-20 transition-all duration-700 ${isFocused ? 'opacity-100 top-full translate-y-0' : 'opacity-0 top-0 animate-none'}`}></div>

          <div className={`relative flex items-center bg-[#0d0d11]/80 backdrop-blur-3xl border transition-all duration-500 rounded-2xl p-2 sm:p-3 
            ${isFocused ? 'border-lime-400/50 glow-accent' : 'border-white/5 shadow-2xl'}`}
          >
            <div className={`pl-6 transition-colors ${isFocused ? 'text-lime-400' : 'text-white/20'}`}>
              <FaSearch className="text-2xl" />
            </div>
            
            <input
              type="text"
              placeholder="SEARCH_MARKETPLACE:MATERIALS_ARCHITECTS_MODELS"
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="flex-1 bg-transparent px-6 py-6 text-white text-xl font-medium tracking-widest placeholder-white/10 focus:outline-none uppercase"
            />

            <button
              onClick={onSearch}
              className="group/btn relative px-10 py-5 bg-lime-400 hover:bg-lime-300 text-black font-black rounded-lg flex items-center gap-3 transition-all active:scale-95"
            >
              <span className="relative z-10">INITIALIZE</span>
              <FaArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Tech Grid Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {categories.map((cat, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                onClick={() => onCategoryClick(cat.name)}
                className="group relative flex flex-col p-4 bg-white/5 border border-white/5 hover:border-lime-400/30 hover:bg-lime-400/5 transition-all text-left rounded-xl"
              >
                <div className="text-lime-400 text-xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="text-[11px] font-black tracking-widest text-white/40 mb-1 group-hover:text-lime-400 transition-colors uppercase">{cat.name}</div>
                <div className="text-lg font-bold tracking-tighter">{cat.count}</div>
                <div className="absolute top-3 right-3 text-white/10 group-hover:text-lime-400/40">
                  <FaPlus size={10} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Matrix UI elements */}
      <div className="absolute bottom-12 right-12 hidden lg:flex flex-col gap-2 items-end opacity-20 pointer-events-none">
        <div className="h-[1px] w-32 bg-white"></div>
        <div className="text-[10px] font-mono tracking-tighter">COORDS: 28.6139° N, 77.2090° E</div>
        <div className="text-[10px] font-mono tracking-tighter uppercase font-bold text-cyan-400">STATUS: OPTIMIZED_V2</div>
      </div>
    </div>
  );
};

export default CustomerLanding;
