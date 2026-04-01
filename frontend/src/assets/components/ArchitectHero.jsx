import React from "react";
import { motion } from "framer-motion";
import { FaBuilding, FaMapMarkerAlt, FaChartLine, FaDraftingCompass } from "react-icons/fa";

const ArchitectHero = () => {
  return (
    <div className="relative w-full min-h-[60vh] md:min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-[#080808] rounded-[2.5rem] p-6 mb-12">
      
      {/* 🌟 Professional Background Text: STINCHAR 🌟 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[20vw] md:text-[25vw] font-black tracking-tighter text-white uppercase leading-none whitespace-nowrap"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            WebkitTextStroke: "1px rgba(255,255,255,0.2)",
            color: "transparent"
          }}
        >
          STINCHAR
        </motion.h1>
      </div>

      {/* Floating Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left: Content Area */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
              <FaDraftingCompass className="text-indigo-400" /> Professional Studio
            </span>
            <h2 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Design the <span className="text-gray-500">Future</span><br />
              of Living.
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience unparalleled architectural precision with our AI-driven design studio. 
              Visualize, manage, and execute your vision with state-of-the-art tools.
            </p>
            
            {/* Quick Actions / Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-2xl font-bold text-white">42+</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Sites</p>
              </div>
              <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-2xl font-bold text-white">₹1.2Cr</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Portfolio Value</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: The Luxury House Visualization */}
        <div className="flex-1 relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl group"
          >
            {/* Main House Image */}
            <img 
              src="/src/assets/images/architect_house_hero.png" 
              alt="Luxury Minimalist House" 
              className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-1000 ease-in-out cursor-pointer"
            />

            {/* Interactive Data Hotspots */}
            <Hotspot x="30%" y="40%" label="Main Suite" detail="Detailed view active" />
            <Hotspot x="70%" y="55%" label="Living Area" detail="Warm lighting config" />
            <Hotspot x="50%" y="20%" label="Roof Access" detail="Solar panel tracking" />

            {/* Reflection / Glow below house */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-white/5 rounded-full blur-3xl opacity-50"></div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

// Internal Component for Hotspots
const Hotspot = ({ x, y, label, detail }) => (
  <motion.div 
    className="absolute z-20 group/spot"
    style={{ left: x, top: y }}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 1.5, type: "spring" }}
  >
    <div className="relative">
      <div className="w-4 h-4 rounded-full bg-white/80 border-2 border-indigo-500 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse cursor-pointer"></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl opacity-0 group-hover/spot:opacity-100 translate-y-2 group-hover/spot:translate-y-0 transition-all duration-300 pointer-events-none">
        <p className="text-[10px] font-bold text-white uppercase tracking-widest">{label}</p>
        <p className="text-[9px] text-gray-400 mt-1 leading-tight">{detail}</p>
      </div>
    </div>
  </motion.div>
);

export default ArchitectHero;
