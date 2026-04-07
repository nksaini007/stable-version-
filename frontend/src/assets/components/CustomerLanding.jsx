import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaArrowRight, FaPlus, FaBox, FaTerminal, FaCodeBranch, FaCrosshairs, FaGlobe, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import heroImg from "../hero_vibe.png";
import API from "../api/api";

const CustomerLanding = ({ onSearch, searchQuery, setSearchQuery, onCategoryClick }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchLatestActivity = async () => {
      try {
        const response = await API.get("/posts");
        // Backend returns array directly, not an object with .posts
        const data = Array.isArray(response.data) ? response.data : [];
        setPosts(data.slice(0, 3)); 
      } catch (err) {
        console.error("Failed to fetch community logs", err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchLatestActivity();
  }, []);

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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 bg-black text-white px-3 py-1 self-start inline-flex">
                <FaTerminal size={12} />
                <span className="text-[10px] font-black tracking-widest uppercase">PROCEED_WITH_CAUTION</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-[#ff5c00] rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest">LIVE_FEED</span>
              </div>
            </div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[#ff5c00] font-black text-[8px] tracking-[0.3em]">// 00_STINCHAR_CORE_INIT</span>
                <h1 className="text-[3.5rem] md:text-[5rem] font-pixel text-lattice leading-[0.85] tracking-tighter">
                   STIN<br/>CHAR
                </h1>
              </div>
            </motion.div>
            
            {/* DYNAMIC COMMUNITY HUD */}
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                 <FaGlobe size={10} />
                 <span className="text-[10px] font-black tracking-[0.2em] uppercase">COMMUNITY_INTELLIGENCE_STREAM:</span>
              </div>

              <div className="space-y-4">
                {loadingPosts ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-6 bg-black/5 animate-pulse border-l-2 border-black/20"></div>
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <div 
                      key={post._id} 
                      className="group cursor-pointer border-l-2 border-[#ff5c00] pl-4 py-1 hover:bg-black hover:text-white transition-all"
                      onClick={() => navigate('/community')}
                    >
                       <div className="flex justify-between items-center text-[9px] font-black opacity-50 group-hover:opacity-100">
                          <span>LOG_00{index+1}</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-tight line-clamp-1">
                         {post.user?.name || "ANON"}: {post.title || "NEW_UPDATE"}
                       </p>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] font-mono opacity-30 italic">NO_RECENT_COMM_ACTIVITY_FOUND...</div>
                )}
              </div>

              <button 
                onClick={() => navigate('/community')}
                className="w-full py-4 bg-black text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff5c00] hover:text-black transition-all flex items-center justify-center gap-4 group"
              >
                <FaShieldAlt size={14} className="group-hover:rotate-12 transition-transform" />
                SECURE_COMM_ACCESS
              </button>
            </div>
          </div>

          <div className="mt-12">
            <div className="h-16 w-full mb-4 bg-black/5 flex items-end gap-1 p-2 border border-black/10">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="flex-1 bg-black/20 group-hover:bg-black transition-colors" style={{ height: `${Math.random() * 100}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[8px] font-black uppercase opacity-40">
              <span>REF: STIN_INTEL_V2.0.4</span>
              <span>LOC: IN_GLOBAL_NODE</span>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: FRAGMENTED HERO GALLERY */}
        <div className="md:col-span-8 flex flex-col min-h-[400px] md:min-h-[500px]">
          
          {/* Top Integrated Progress Bar */}
          <div className="h-10 bg-black flex items-center px-6 justify-between border-b border-white/10">
            <div className="flex gap-1 h-full items-center">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className={`w-8 h-1/2 -skew-x-[25deg] ${i < 3 ? 'bg-[#ff5c00]' : 'bg-white/10'}`}></div>
               ))}
            </div>
            <div className="text-white text-[9px] font-black tracking-[0.4em] flex items-center gap-2">
              <FaCrosshairs size={10} className="text-[#ff5c00]" />
              SECURE_DATA_FRAGMENT_01
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row border-b-4 border-black relative overflow-hidden bg-black">
            
            {/* FRAGMENT 002 (Small/Black) */}
            <div className="w-full md:w-[35%] bg-black relative border-r-2 border-white/10 flex items-center justify-center group overflow-hidden">
               <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800" 
                className="w-full h-full object-cover opacity-40 blur-[2px] group-hover:blur-0 transition-all duration-700"
                alt="Tech 002"
              />
              <div className="absolute top-4 left-4 h-full flex flex-col">
                 <span className="font-heading text-6xl text-white font-vertical opacity-10">002</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              {/* Metric HUD 002 */}
              <div className="absolute bottom-6 left-6 right-6 bg-glass-hud p-4">
                 <div className="flex justify-between items-center text-[8px] text-white/50 mb-2 font-mono">
                    <span>LKS: 1,628</span>
                    <span>MDL: STN_B</span>
                 </div>
                 <div className="h-1 w-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-white/40 w-[60%] animate-[pulse_2s_infinite]"></div>
                 </div>
              </div>
            </div>

            {/* FRAGMENT 001 (Main/Orange) */}
            <div className="flex-1 bg-[#ff5c00] relative group flex items-center justify-center overflow-hidden">
              <img 
                src={heroImg} 
                className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-[2s]"
                alt="Industrial Main"
              />
              
              {/* Vertical Label */}
              <div className="absolute top-8 right-8 flex flex-col items-center">
                 <span className="font-heading text-7xl md:text-9xl text-black font-vertical tracking-tight leading-none">001</span>
              </div>

              {/* Central Controller HUD */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-48 h-48 border-2 border-black/20 rounded-full animate-spin-slow"></div>
              </div>

              {/* Metric HUD 001 (Ref Image Style) */}
              <div className="absolute bottom-8 right-8 w-48 md:w-64 bg-glass-hud p-6 border-l-4 border-black shadow-2xl">
                 <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-black/50 tracking-widest uppercase">SCAN_INDEX</span>
                       <span className="text-3xl font-heading text-black leading-none">2,628</span>
                    </div>
                    <div className="w-12 h-1 bg-black/20"></div>
                 </div>
                 <div className="flex gap-1 h-4 items-end">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="flex-1 bg-black/40" style={{ height: `${Math.random() * 100}%` }}></div>
                    ))}
                 </div>
              </div>

              {/* Integrated Navigation HUD */}
              <button 
                onClick={() => document.getElementById('search-initialize').scrollIntoView({ behavior: 'smooth' })}
                className="absolute top-8 left-8 bg-glass-hud px-4 py-2 flex items-center gap-4 text-white hover:bg-white hover:text-black transition-all border border-white/20 pointer-events-auto"
              >
                <div className="flex flex-col items-start leading-none">
                   <span className="text-[7px] font-black opacity-50 uppercase">INIT_PROCEDURE</span>
                   <span className="text-[12px] font-black uppercase">NEXT_LOG_</span>
                </div>
                <FaArrowRight size={14} className="text-[#ff5c00]" />
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
