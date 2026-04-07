import React from "react";
import { motion } from "framer-motion";
import { FaSearch, FaArrowRight, FaPlus, FaBox, FaTerminal, FaCodeBranch, FaCrosshairs } from "react-icons/fa";
import heroImg from "../hero_vibe.png";

const CustomerLanding = ({ onSearch, searchQuery, setSearchQuery, onCategoryClick }) => {
  return (
    <div className="relative min-h-screen bg-[#e5e5e5] text-black font-mono overflow-hidden flex flex-col pt-20">
      
      {/* 🏁 INDUSTRIAL GRID OVERLAY */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* 🏗️ MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col md:grid md:grid-cols-12 border-t-4 border-black">
        
        {/* LEFT PANEL: MASSIVE BRANDING & HUD */}
        <div className="md:col-span-4 border-r-4 border-black p-8 flex flex-col justify-between bg-white/50">
          <div>
            <div className="flex items-center gap-2 mb-8 bg-black text-white px-3 py-1 self-start inline-flex">
              <FaTerminal size={12} />
              <span className="text-[10px] font-bold tracking-widest uppercase">PROCEED_WITH_CAUTION</span>
            </div>
            
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
             <div className="flex flex-col gap-2">
             <span className="text-[#ff5c00] font-black text-xs tracking-[0.5em]">// 00_INITIALIZE_CORE</span>
             <h1 className="text-[6rem] md:text-[10rem] font-pixel text-lattice leading-[0.8] tracking-tighter">
                STIN<br/>CHAR
             </h1>
          </div>
            </motion.div>
            
            <div className="space-y-4 opacity-70 mt-8">
              <div className="flex justify-between border-b border-black/20 pb-2">
                <span className="text-[10px] font-black">REF_NUMBER:</span>
                <span className="text-[10px] font-mono">0923-ST-V2</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-2">
                <span className="text-[10px] font-black">LOCATION:</span>
                <span className="text-[10px] font-mono">IN_MH_01_77</span>
              </div>
              <div className="flex justify-between border-b border-black/20 pb-2">
                <span className="text-[10px] font-black">STATUS:</span>
                <span className="text-[10px] font-mono">DEPLOYED_ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="h-20 w-full mb-4 bg-black/5 flex items-end gap-1 p-2">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-1 bg-black" style={{ height: `${Math.random() * 100}%` }}></div>
              ))}
            </div>
            <p className="text-[9px] font-bold leading-tight uppercase opacity-50">
              Technical Supply Chain Interface // Ver 2.0.4 <br />
              All rights reserved to Stinchar Innovations
            </p>
          </div>
        </div>

        {/* CENTER PANEL: HERO & SEARCH */}
        <div className="md:col-span-8 flex flex-col">
          
          {/* Top Warning Bar */}
          <div className="h-14 bg-black flex items-center px-8 justify-between">
            <div className="flex gap-4">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-8 h-full skew-x-[30deg] border-r border-white/20"></div>
               ))}
            </div>
            <div className="text-white text-[12px] font-black tracking-[0.4em] flex items-center gap-3">
              <FaCrosshairs size={14} className="text-[#ff5c00]" />
              SEARCH_INITIALIZE
            </div>
          </div>

          {/* Hero Visual Area */}
          <div className="flex-1 flex flex-col md:flex-row border-b-4 border-black">
            
            <div className="flex-1 bg-[#ff5c00] relative overflow-hidden group">
              <img 
                src={heroImg} 
                className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-[2s]"
                alt="Industrial Vibe"
              />
              <div className="absolute top-8 left-8 bg-white px-6 py-4 border-4 border-black shadow-[10px_10px_0px_#000]">
                 <span className="text-3xl font-heading">001</span>
              </div>
            </div>

            <div className="w-full md:w-80 bg-black text-white p-8 flex flex-col justify-between">
              <div>
                <span className="text-[#ff5c00] text-[4rem] font-heading leading-none">V2.</span>
                <p className="text-xs mt-4 leading-relaxed opacity-60">
                  Engineered for scale. Stinchar provides a unified technical interface for modern construction and supply chain management.
                </p>
              </div>
            <button 
                onClick={() => document.getElementById('search-initialize').scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-6 bg-[#ff5c00] text-black font-black text-xl hover:bg-white transition-colors flex items-center justify-center gap-4 group"
              >
                NEXT
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Search Bar Grid Section */}
          <div id="search-initialize" className="p-8 md:p-12 bg-white flex flex-col items-start gap-8">
            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-[#ff5c00] text-black px-3 py-1 text-[10px] font-black uppercase">INITIALIZE SEARCH</span>
                <div className="flex-1 h-[1px] bg-black/20"></div>
              </div>

              <div className="relative flex border-2 md:border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.1)] md:shadow-[12px_12px_0px_rgba(0,0,0,0.1)]">
                <div className="p-3 md:p-6 bg-black text-white flex items-center justify-center">
                  <FaSearch className="text-xl md:text-2xl" />
                </div>
                <input 
                  type="text" 
                  placeholder="FIND_MATERIALS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  className="flex-1 bg-white px-4 md:px-8 text-lg md:text-2xl font-black placeholder-black/20 focus:outline-none uppercase min-w-0"
                />
              </div>

              <div className="flex gap-2 md:gap-4 mt-4 md:mt-8 flex-wrap">
                {["RAW_MATERIALS", "ARCHITECTS", "CONSTRUCTION"].map((cat, i) => (
                   <button 
                    key={i}
                    onClick={() => onCategoryClick(cat)}
                    className="px-3 md:px-6 py-1.5 md:py-2 border-2 border-black font-black text-[8px] md:text-xs hover:bg-black hover:text-white transition-all uppercase"
                   >
                     {cat}._
                   </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CustomerLanding;
