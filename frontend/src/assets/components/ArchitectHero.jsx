import React from "react";
import { motion } from "framer-motion";
import { FaDraftingCompass } from "react-icons/fa";
import houseImg from "../images/architect_house_hero.png";

const ArchitectHero = () => {
  const brandName = "STINCHAR";

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-[#050505] rounded-[3rem] mb-12 group">
      
      {/* 🏙️ Full Background Image with Parallax & Scale Effect 🏙️ */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0 flex items-center justify-center"
      >
        <img 
          src={houseImg} 
          alt="Luxury House Background" 
          className="w-full h-full object-cover lg:object-contain scale-125 lg:scale-110 opacity-60"
        />
        {/* Soft radial vignette to focus center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_80%)]"></div>
      </motion.div>

      {/* 🌟 Animated Brand Text: STINCHAR 🌟 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
        <div className="flex overflow-hidden">
          {brandName.split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 0.15 }}
              transition={{ 
                duration: 1, 
                delay: 0.5 + index * 0.1, 
                ease: [0.33, 1, 0.68, 1] 
              }}
              className="text-[18vw] md:text-[22vw] font-black tracking-tighter text-white uppercase leading-none"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.3)",
                color: "transparent"
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Floating Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* ✨ Main Content Layer ✨ */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            <FaDraftingCompass className="animate-spin-slow" /> Professional Studio
          </span>
          
          <h2 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tight">
            Design the <span className="text-gray-600">Future.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-medium">
            Immersive architectural visualization meets precision engineering. 
            Transform your sketches into breathable spaces.
          </p>
          
          {/* Quick Actions / Stats - Glassmorphic */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="px-8 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors duration-500 text-left min-w-[180px]">
              <p className="text-3xl font-black text-white">42+</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Active Projects</p>
            </div>
            <div className="px-8 py-5 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-xl hover:bg-white/20 transition-colors duration-500 text-left min-w-[180px]">
              <p className="text-3xl font-black text-white">₹1.2Cr</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Portfolio Cap</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Hotspots (Relocated to bottom or as floating particles) */}
      <div className="absolute bottom-10 left-10 z-30 hidden md:block">
        <Hotspot label="Main Suite" detail="Dynamic lighting ready" />
      </div>
      <div className="absolute top-20 right-10 z-30 hidden md:block">
        <Hotspot label="Solar Array" detail="Efficiency: 98.4%" />
      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};

// Internal Component for Hotspots
const Hotspot = ({ label, detail }) => (
  <motion.div 
    className="group/spot flex items-center gap-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2 }}
  >
    <div className="w-3 h-3 rounded-full bg-white/60 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse"></div>
    <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl opacity-0 group-hover/spot:opacity-100 transition-opacity duration-300">
      <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">{label}</p>
      <p className="text-[8px] text-gray-500 mt-1 uppercase">{detail}</p>
    </div>
  </motion.div>
);

export default ArchitectHero;
