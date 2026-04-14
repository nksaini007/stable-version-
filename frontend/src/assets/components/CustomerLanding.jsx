import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaArrowRight, FaPlus, FaBox, FaTerminal, FaCodeBranch, FaCrosshairs, FaGlobe, FaShieldAlt, FaComments, FaFileContract, FaHardHat } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import heroImg from "../hero_vibe.jpg";
import API from "../api/api";

const CustomerLanding = ({ onSearch, searchQuery, setSearchQuery, onCategoryClick }) => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  useEffect(() => {
    const fetchAggregatedData = async () => {
      setLoadingUpdates(true);
      try {
        const token = localStorage.getItem("token");
        let aggregated = [];

        // 1. Fetch Posts
        try {
          const postRes = await API.get("/posts");
          const postsData = Array.isArray(postRes.data) ? postRes.data : [];
          aggregated.push(...postsData.slice(0, 2).map((p, i) => ({
            id: `post_${p._id || i}`,
            type: "POST",
            tag: "LOG",
            icon: <FaComments className="text-[#ff5c00] mt-0.5" />,
            title: p.user?.name || "ANON",
            detail: p.title || "NEW_UPDATE",
            date: new Date(p.createdAt),
            link: "/community"
          })));
        } catch (e) {
          console.error("Post fetch error", e);
        }

        // 2. Fetch User-specific data if logged in
        if (token) {
          // Quotations
          try {
            const qRes = await API.get("/quotations/my", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const quotesData = Array.isArray(qRes.data) ? qRes.data : [];
            aggregated.push(...quotesData.slice(0, 2).map((q, i) => ({
              id: `quote_${q._id || i}`,
              type: "QUOTE",
              tag: "QTE",
              icon: <FaFileContract className="text-cyan-500 mt-0.5" />,
              title: `Quote: ${q.status}`,
              detail: `Items: ${q.items?.length || 0} - Total: ₹${q.totalPrice?.toFixed(2) || 0}`,
              date: new Date(q.createdAt),
              link: "/dashboard/customer/quotations"
            })));
          } catch (e) {
            console.error("Quotation fetch error", e);
          }

          // Construction Projects
          try {
            const cRes = await API.get("/construction/customer/projects", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const projData = Array.isArray(cRes.data.projects) ? cRes.data.projects : [];
            aggregated.push(...projData.slice(0, 2).map((pr, i) => ({
              id: `const_${pr._id || i}`,
              type: "BUILD",
              tag: "BLD",
              icon: <FaHardHat className="text-emerald-500 mt-0.5" />,
              title: pr.name,
              detail: `Progress: ${pr.progressPercentage}%`,
              date: new Date(pr.createdAt),
              link: "/my-construction"
            })));
          } catch (e) {
            console.error("Construction fetch error", e);
          }
        }

        // Sort descending by date and take top 4
        aggregated.sort((a, b) => b.date - a.date);
        setUpdates(aggregated.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch intelligence stream", err);
      } finally {
        setLoadingUpdates(false);
      }
    };
    fetchAggregatedData();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#e5e5e5] text-black font-mono overflow-hidden flex flex-col pt-20">

      {/* 🏁 INDUSTRIAL GRID OVERLAY (SUBTLE) */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* 📺 SCAN LINE & BLUR */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan-slow {
          animation: scanline 12s linear infinite;
        }
        .bg-glass-premium {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        .blueprint-lines {
          background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* 🏗️ MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col md:grid md:grid-cols-12 border-t-4 border-black">

        {/* LEFT PANEL: MASSIVE BRANDING & HUD */}


        {/* CENTER PANEL: FRAGMENTED HERO GALLERY */}
        <div className="md:col-span-8 flex flex-col min-h-[400px] md:min-h-[400px]">

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

          <div className="flex-1 flex flex-col md:flex-row border-b-2 border-black/10 relative overflow-hidden bg-[#0a0a0a] group/hero">

            {/* Blueprint Grid Overlay */}
            <div className="absolute inset-0 blueprint-lines opacity-20 pointer-events-none"></div>

            {/* FRAGMENT 002 (Left/Technical Data) */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="w-full md:w-[30%] bg-black relative border-r border-white/5 flex items-center justify-center overflow-hidden group/f2"
            >
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"
                className="w-full h-full object-cover opacity-30 grayscale group-hover/f2:grayscale-0 group-hover/f2:scale-105 transition-all duration-1000"
                alt="Tech 002"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60"></div>

              {/* Data Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
                <span className="text-[8px] font-black text-[#ff5c00] tracking-[0.4em] opacity-50">NODE_ACCESS_POINT</span>
                <span className="text-4xl font-heading text-white/10 uppercase tracking-tighter">OS_VERSION_2.0</span>
              </div>

              {/* HUD 002 (Minimalist) */}
              <div className="absolute bottom-8 left-8 right-8 bg-black/40 backdrop-blur-md p-5 border border-white/5 group-hover/f2:border-[#ff5c00]/30 transition-colors">
                <div className="flex justify-between items-center text-[7px] text-white/40 mb-3 font-mono">
                  <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-[#ff5c00] rounded-full animate-pulse"></div> INTEL_FETCH_SUCCESS</span>
                  <span>REF: STN_32</span>
                </div>
                <div className="h-[1px] w-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="h-full bg-[#ff5c00]"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            {/* FRAGMENT 001 (Main Showcase) */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "circOut", delay: 0.1 }}
              className="flex-1 bg-black relative group/f1 flex items-center justify-center overflow-hidden"
            >
              <img
                src={heroImg}
                className="w-full h-full object-cover opacity-60 mix-blend-screen group-hover/f1:scale-110 transition-transform duration-[4s] ease-out"
                alt="Industrial Premium"
              />

              {/* Floating Blueprint Markers */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-[#ff5c00]/20"></div>
                <div className="absolute bottom-40 left-10 w-20 h-20 border-b border-l border-[#ff5c00]/20"></div>
                         {/* Brand Floating Label */}
              <div className="absolute top-12 left-12 flex flex-col pointer-events-none">
                <motion.span
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                   className="text-[10px] font-black text-[#ff5c00] tracking-[0.6em] mb-2 drop-shadow-lg"
                 >STINCHAR_INFRASTRUCTURE</motion.span>
                <h1 className="text-6xl md:text-8xl font-heading text-white leading-none tracking-tighter opacity-10 group-hover/f1:opacity-40 transition-opacity duration-1000">
                  COMPLETE<br />CONSTRUCTION &<br />INFRASTRUCTURE
                </h1>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

        {/* HUD SIDE PANEL - Refined "Intelligence Stream" */}
        <div className="md:col-span-4 border-l border-black/10 bg-[#0f0f0f] flex flex-col relative">

          {/* Panel Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#ff5c00] rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">STINCHAR_FOUNDER_VISION</span>
            </div>
          </div>

          <div className="px-8 py-4 border-b border-white/5 bg-white/5">
             <p className="text-[11px] font-bold text-white/90 leading-relaxed uppercase tracking-tighter">
               "Empowering the building industry through a unified ecosystem of construction and infrastructure excellence."
             </p>
             <p className="text-[9px] font-black text-[#ff5c00] mt-2 tracking-widest">— NEERAJ KUMAR SAINI, FOUNDER</p>
          </div>

          {/* Stream Content */}
          <div className="flex-1 overflow-y-auto scrollbar-tech p-8 space-y-6">
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">INTELLIGENCE_STREAM</span>
            </div>
            {loadingUpdates ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white/5 border border-white/5 animate-pulse"></div>
              ))
            ) : updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer border-b border-white/5 pb-6 hover:translate-x-1 transition-transform"
                onClick={() => navigate(update.link)}
              >
                <div className="flex justify-between items-center text-[7px] font-black text-[#ff5c00]/60 mb-2">
                  <span>{update.tag}_FRAGMENT_0{index + 1}</span>
                  <span>{update.date.toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-black text-white/90 group-hover:text-white mb-1 uppercase tracking-tight line-clamp-1">{update.title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 uppercase font-medium">{update.detail}</p>
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex-1 h-[1px] bg-white/10"></div>
                  <span className="text-[8px] font-black text-white">ACCESS_DATA</span>
                  <FaArrowRight size={10} className="text-[#ff5c00]" />
                </div>
              </motion.div>
          </div>

          {/* Quick Access Stats at Bottom */}
          <div className="p-8 bg-black/40 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Global_Index</span>
                <span className="text-2xl font-heading text-white tracking-widest">2.0</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Node_Status</span>
                <span className="text-[12px] font-black text-[#ff5c00] animate-pulse">OPTIMIZED</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 w-full py-4 bg-white text-black font-black text-[10px] tracking-[0.3em] hover:bg-[#ff5c00] transition-colors flex items-center justify-center gap-3 group"
            >
              ACCESS_FULL_SYSTEM
              <FaShieldAlt size={12} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* LEGACY SEARCH AREA (Streamlined for navigation) */}
        <div id="search-initialize" className="md:col-span-12 border-t-2 border-black/10 bg-white p-12 md:p-16 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 blueprint-lines opacity-[0.03] pointer-events-none"></div>
          <div className="w-full max-w-4xl mx-auto z-10 text-center">
            <h3 className="text-xs font-black text-black/40 uppercase tracking-[0.4em] mb-8">System_Discovery_Nodes</h3>
            <div className="flex gap-3 md:gap-5 flex-wrap justify-center">
              {["RAW_MATERIALS", "ARCHITECTS", "CONSTRUCTION", "LOGISTICS"].map((cat, i) => (
                <button
                  key={i}
                  onClick={() => onCategoryClick(cat)}
                  className="px-6 md:px-10 py-3 md:py-4 border-2 border-black font-black text-[10px] md:text-[12px] hover:bg-[#ff5c00] hover:text-black transition-all uppercase tracking-widest flex items-center gap-3 group/cat"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLanding;
