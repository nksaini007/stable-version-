import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaComments, FaFileContract, FaHardHat, FaChevronRight, FaPlay, FaCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import heroImg from "../villa.jpg";
import API from "../api/api";

const CustomerLanding = () => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  useEffect(() => {
    const fetchAggregatedData = async () => {
      setLoadingUpdates(true);
      try {
        const token = localStorage.getItem("token");
        let aggregated = [];

        try {
          const postRes = await API.get("/posts");
          const postsData = Array.isArray(postRes.data) ? postRes.data : [];
          aggregated.push(...postsData.slice(0, 3).map((p, i) => ({
            id: `post_${p._id || i}`,
            tag: "COMMUNITY",
            icon: <FaComments />,
            title: p.user?.name || "Member",
            detail: p.title || "New Community Post",
            date: new Date(p.createdAt),
            link: "/community"
          })));
        } catch (e) { console.error(e); }

        if (token) {
          try {
            const qRes = await API.get("/quotations/my", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const quotesData = Array.isArray(qRes.data) ? qRes.data : [];
            aggregated.push(...quotesData.slice(0, 2).map((q, i) => ({
              id: `quote_${q._id || i}`,
              tag: "QUOTATION",
              icon: <FaFileContract />,
              title: `Status: ${q.status}`,
              detail: `Items: ${q.items?.length || 0} — Total: ₹${q.totalPrice?.toFixed(2) || 0}`,
              date: new Date(q.createdAt),
              link: "/dashboard/customer/quotations"
            })));
          } catch (e) { console.error(e); }

          try {
            const cRes = await API.get("/construction/customer/projects", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const projData = Array.isArray(cRes.data.projects) ? cRes.data.projects : [];
            aggregated.push(...projData.slice(0, 2).map((pr, i) => ({
              id: `const_${pr._id || i}`,
              tag: "CONSTRUCTION",
              icon: <FaHardHat />,
              title: pr.name,
              detail: `Current Progress: ${pr.progressPercentage}%`,
              date: new Date(pr.createdAt),
              link: "/my-construction"
            })));
          } catch (e) { console.error(e); }
        }

        aggregated.sort((a, b) => b.date - a.date);
        setUpdates(aggregated.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUpdates(false);
      }
    };
    fetchAggregatedData();
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif !important; }
        
        .blueprint-grid {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .mask-gradient {
          mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }

        .text-glow {
          text-shadow: 0 0 20px rgba(255,255,255,0.5);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>

      {/* 🏗️ BACKGROUND CANVAS */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.4] pointer-events-none z-0"></div>

      <main className="relative z-10">
        {/* 🎬 HERO SECTION - FULL IMMERSIVE SPLIT */}
        <div className="flex flex-col lg:flex-row min-h-screen">

          {/* LEFT: TEXT CONTENT */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 bg-white/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-20 left-20 w-64 h-64 bg-zinc-100 rounded-full blur-[100px] opacity-60"></div>

            <div className="relative z-10 max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-zinc-900 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-200 rounded-full"></div>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5em]">Stinchar V2.0 / Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
                className="text-6xl sm:text-7xl lg:text-8xl font-thin tracking-tighter leading-[0.9] text-zinc-950 mb-8"
              >
                THE NEW <br />
                <span className="font-medium italic">STANDARD</span> <br />
                OF BUILD.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
                className="text-zinc-500 text-lg sm:text-xl font-light leading-relaxed max-w-md mb-12"
              >
                A unified ecosystem designed for the visionaries of construction and infrastructure. Minimal. Powerful. Precise.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap gap-5"
              >
                <button
                  onClick={() => navigate('/project-categories')}
                  className="group px-10 py-5 bg-zinc-900 text-white rounded-full font-medium text-sm hover:bg-black transition-all flex items-center gap-4 shadow-2xl shadow-zinc-400/20 active:scale-95"
                >
                  Initiate Project <FaArrowRight size={10} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-5 border border-zinc-200 text-zinc-900 rounded-full font-medium text-sm hover:bg-zinc-50 transition-all active:scale-95"
                >
                  Dashboard
                </button>
              </motion.div>
            </div>

            {/* Bottom HUD Stat */}
            <div className="absolute bottom-12 left-12 sm:left-20 flex gap-12">
              <div>
                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Architecture_Status</p>
                <p className="text-xl font-light text-zinc-900">Optimized</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Platform_Node</p>
                <p className="text-xl font-light text-zinc-900">Global.2.0</p>
              </div>
            </div>
          </div>

          {/* RIGHT: ANIMATED HERO IMAGE / STREAM */}
          <div className="w-full lg:w-[30%] relative flex items-center justify-center bg-zinc-950 overflow-hidden lg:rounded-[2rem] shadow-[-20px_0_50px_rgba(0,0,0,0.2)]">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }} transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <img src={heroImg} className="w-full h-full object-cover grayscale opacity-50 contrast-125" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
            </motion.div>

            {/* FLOATING ACTIVITY STREAM - The "Animated Card" */}
            <div className="relative z-10 w-full max-w-xl px-6 py-1 lg:py-0">
              <div className="flex items-center gap-1 mb-10">
                <div className="w-3 h-1  bg-zinc-100 animate-pulse"></div>
                <h3 className="text-zinc-100 text-[10px] font-bold uppercase tracking-[0.5em] text-glow">Live_Activity_Feed</h3>
              </div>

              <div className="space-y-2">
                {loadingUpdates ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 border border-white/5 rounded-3xl animate-pulse"></div>
                  ))
                ) : updates.map((update, idx) => (
                  <motion.div
                    key={update.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: -10 }}
                    className="group bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/20 hover:border-white/20 transition-all cursor-pointer flex items-center gap-6"
                    onClick={() => navigate(update.link)}
                  >
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white text-xl shadow-inner group-hover:bg-white group-hover:text-zinc-950 transition-all duration-500">
                      {update.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{update.tag}</span>
                        <span className="text-[8px] font-medium text-zinc-500">{update.date.toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-[15px] font-medium text-white truncate group-hover:text-white">{update.title}</h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{update.detail}</p>
                    </div>
                    <div className="w-8 h-8  bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaChevronRight size={10} className="text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View Full Dashboard Call to action */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                className="mt-10 flex justify-center"
              >
                <Link to="/dashboard" className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
                  Enter Command Center <FaArrowRight size={8} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 🏔️ SECONDARY SECTION: FEATURES / SERVICES */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-32 border-t border-zinc-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">01 / Foundation</h5>
              <h3 className="text-3xl font-light text-zinc-900 mb-6 leading-tight">Unified <br />Construction <br />Ecosystem.</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Everything you need to build, track, and scale projects in one high-precision platform.</p>
            </div>
            <div>
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">02 / Community</h5>
              <h3 className="text-3xl font-light text-zinc-900 mb-6 leading-tight">Collaborate <br />with Master <br />Builders.</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Access a global network of architects, engineers, and construction experts in real-time.</p>
            </div>
            <div>
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">03 / Precision</h5>
              <h3 className="text-3xl font-light text-zinc-900 mb-6 leading-tight">Advanced <br />Quotation <br />Intelligence.</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Zero guesswork. Real-time cost estimation and supply chain transparency for every brick.</p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default CustomerLanding;
