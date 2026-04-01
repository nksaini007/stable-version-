import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import cubeImg from "../images/cube1.png";
import { FaArrowRight } from "react-icons/fa";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const letterVariants = {
  hidden: { y: "100%", opacity: 0, rotateX: 90 },
  visible: { y: 0, opacity: 1, rotateX: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, delay: d, ease: [0.16, 1, 0.3, 1] } }),
};

const SellerHero = () => {
  const brand = "stinchar";
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f0d] font-['Inter',sans-serif] mb-0 select-none">

      {/* ── Layer 1: Professional Dark Commerce Background ── */}
      <div className="absolute inset-0 z-0 bg-[#0a0f0d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_80%)]"></div>
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* ── Layer 2: Animated Watermark (COMMERCE) ── */}
      {/* z-10: sits BEHIND the main visual (z-20) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          className="flex perspective-1000"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {brand.split("").map((ch, i) => (
            <motion.span
              key={i}
              variants={letterVariants}
              className="text-[20vw] md:text-[22vw] font-black tracking-tighter leading-none uppercase block"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px rgba(16,185,129,0.15)",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* ── Layer 3: Centerpiece - mdhouse.png ── */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <motion.img
            src={cubeImg}
            alt="Stinchar Merchant Hub"
            className="w-auto h-[65vh] md:h-[80vh] object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.8)] filter brightness-110 contrast-125"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Base Drop Shadow */}
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-8 bg-black/60 blur-3xl rounded-[100%] z-10 pointer-events-none" />
        </div>
      </motion.div>

      {/* ── Layer 4: UI & Metadata Overlay ── */}
      {/* Top-Left: Studio/Metadata */}
      <motion.div
        className="absolute top-10 left-8 md:top-14 md:left-14 z-30 pointer-events-auto"
        custom={1.4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-emerald-400 mb-3 drop-shadow-lg">
          Stinchar Logistics
        </p>
        <div className="h-px w-8 bg-emerald-500/50 mb-3" />
        <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 leading-loose">
          Global Merchant Hub
          <br />
          Trade & Supply Chain
          <br />
          Enterprise Version
        </p>
      </motion.div>

      {/* Top-Right: Sales Counter */}
      <motion.div
        className="absolute top-10 right-8 md:top-14 md:right-14 z-30 text-right pointer-events-auto"
        custom={1.6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/80 mb-1">Total Fulfillment</p>
        <p className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
          12.4K
        </p>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 mt-1">Orders Dispatched</p>
      </motion.div>

      {/* Bottom-Left: Title Block & CTA */}
      <motion.div
        className="absolute bottom-12 left-8 md:bottom-16 md:left-14 z-30 max-w-sm pointer-events-auto"
        custom={1.8}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tighter text-white mb-4 drop-shadow-xl">
          Scale your<br /><span className="text-emerald-400">Empire.</span>
        </h1>
        <p className="text-xs md:text-sm text-gray-400 font-medium tracking-wide leading-relaxed max-w-[280px] mb-8">
          Advanced inventory control, global distribution streams, and predictive sales analytics.
        </p>

        {/* Main Dashboard Access Button */}
        <button
          onClick={() => navigate('/seller')}
          className="group inline-flex items-center justify-between w-full max-w-[240px] px-6 py-4 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-none shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all duration-500 overflow-hidden relative"
        >
          <span className="relative z-10 drop-shadow-md">Enter Merchant Hub</span>
          <FaArrowRight className="relative z-10 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 drop-shadow-md" />
          <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[0.16,1,0.3,1] z-0"></div>
        </button>
      </motion.div>

      {/* Bottom-Right: Accent Stats */}
      <motion.div
        className="absolute bottom-12 right-8 md:bottom-16 md:right-14 z-30 text-right pointer-events-auto flex flex-col gap-6"
        custom={2.0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div>
          <p className="text-2xl md:text-4xl font-black text-white leading-none drop-shadow-md">98.4%</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80 mt-1">Delivery Success Date</p>
        </div>
        <div>
          <p className="text-2xl md:text-4xl font-black text-white leading-none drop-shadow-md">24/7</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80 mt-1">Global Trade Network</p>
        </div>
      </motion.div>

      {/* Interactive Global Nodes (Hotspots) */}
      <div className="hidden md:block">
        <Hotspot style={{ left: "45%", top: "40%" }} label="Supply Hub A" />
        <Hotspot style={{ left: "60%", top: "65%" }} label="Distribution Control" />
      </div>

    </section>
  );
};

const Hotspot = ({ style, label }) => (
  <motion.div
    className="absolute z-30 group pointer-events-auto"
    style={style}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
  >
    <div className="relative flex items-center gap-3">
      {/* Target Marker */}
      <div className="w-4 h-4 flex items-center justify-center border-2 border-emerald-500 rounded-full bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-crosshair hover:bg-emerald-500 hover:scale-125 transition-all duration-300 group">
        <div className="w-1.5 h-1.5 bg-white rounded-full group-hover:bg-black transition-colors"></div>
      </div>
      {/* Tooltip */}
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap drop-shadow-lg">
        {label}
      </p>
    </div>
  </motion.div>
);

export default SellerHero;
