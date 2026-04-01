import React from "react";
import { motion } from "framer-motion";
import { FaDraftingCompass } from "react-icons/fa";
import houseImg from "../images/architect_house_hero.png";

const ArchitectHero = () => {
  const brandName = "STINCHAR";

  return (
    <div className="relative w-full h-[85vh] md:h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505] rounded-[3rem] p-4 md:p-12 mb-12 group selection:bg-indigo-500/30">
      
      {/* 🌟 Layer 1: Professional Deep Background 🌟 */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        {/* Subtle Ambient Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,40,40,0.2)_0%,transparent_100%)]"></div>
        {/* Animated Particles or Grid could go here */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* 🌟 Layer 2: BEHIND Animated Branding (STINCHAR) 🌟 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
        <div className="flex w-full justify-center px-4 overflow-hidden">
          {brandName.split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={{ y: "150%", opacity: 0, rotateX: 90 }}
              animate={{ y: 0, opacity: 0.1, rotateX: 0 }}
              transition={{ 
                duration: 1.5, 
                delay: 0.3 + index * 0.1, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="text-[22vw] md:text-[25vw] font-black tracking-tighter text-white uppercase leading-none transform perspective-1000"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.2)",
                color: "transparent"
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* 🌟 Layer 3: FOREGROUND Centerpiece (The Luxury House) 🌟 */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
        className="absolute inset-0 z-20 flex items-center justify-center"
      >
        <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
            <motion.img 
                src={houseImg} 
                alt="Luxury House Foreground" 
                className="w-auto h-[60%] md:h-[80%] object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.8)] filter contrast-[1.1] saturate-[1.2]"
                animate={{ 
                    y: [0, -15, 0],
                }}
                transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            />
            
            {/* Soft Shadow below house */}
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-64 md:w-[400px] h-10 bg-black/40 blur-2xl rounded-full"></div>
        </div>
      </motion.div>

      {/* 🌟 Layer 4: Content & Interactive Controls 🌟 */}
      <div className="relative z-30 w-full h-full max-w-7xl mx-auto flex flex-col justify-between p-8 pointer-events-none">
        
        {/* Header Content */}
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1, delay: 2.2 }}
           className="max-w-xl pointer-events-auto mt-12"
        >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              <FaDraftingCompass className="animate-spin-slow" /> Professional_Studio_v2.0
            </span>
            <h2 className="text-4xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
              Crafting <span className="text-gray-400">Atmosphere.</span>
            </h2>
        </motion.div>

        {/* Footer Statistics */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 2.5 }}
           className="flex flex-wrap gap-8 pointer-events-auto mb-12"
        >
            <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-white leading-none">42+</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active High-Value Projects</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-white leading-none">₹1.2Cr</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Asset Portfolio</span>
            </div>
            <div className="hidden md:flex flex-col gap-1">
                <span className="text-3xl font-black text-white leading-none tracking-tight">98%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Satisfaction Index</span>
            </div>
        </motion.div>
      </div>

      {/* Hotspots Layer */}
      <div className="absolute inset-0 z-40 pointer-events-none hidden md:block">
        <Hotspot x="35%" y="45%" label="Panoramic Suite" detail="Living quarters integrated" />
        <Hotspot x="65%" y="55%" label="Eco Terrace" detail="Solar efficiency certified" />
      </div>

      {/* Background Ambience / Glows */}
      <div className="absolute top-1/4 -right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] z-5"></div>
      <div className="absolute -bottom-1/4 -left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] z-5"></div>
      
    </div>
  );
};

// Internal Component for Hotspots
const Hotspot = ({ x, y, label, detail }) => (
  <motion.div 
    className="absolute pointer-events-auto"
    style={{ left: x, top: y }}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 2.8, type: "spring" }}
  >
    <div className="relative group/spot">
      <div className="w-4 h-4 rounded-full bg-white/60 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse cursor-crosshair"></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl opacity-0 group-hover/spot:opacity-100 translate-y-3 group-hover/spot:translate-y-0 transition-all duration-500 pointer-events-none">
        <p className="text-[10px] font-black text-white uppercase tracking-widest">{label}</p>
        <p className="text-[9px] text-gray-400 mt-2 leading-relaxed uppercase tracking-wide italic">{detail}</p>
      </div>
    </div>
  </motion.div>
);

export default ArchitectHero;
