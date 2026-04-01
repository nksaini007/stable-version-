import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import houseImg from "../images/architect_house_hero1.png";
import { FaArrowRight } from "react-icons/fa";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const letterVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: [0.16, 1, 0.3, 1] } }),
};

const ArchitectHero = () => {
  const brand = "STINCHAR";
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#f5f4f0] font-['Inter',sans-serif] mb-0 select-none">

      {/* ── Animated STINCHAR Watermark ─────────────────────────────── */}
      {/* z-10: sits BEHIND the house (z-20) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          className="flex"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {brand.split("").map((ch, i) => (
            <motion.span
              key={i}
              variants={letterVariants}
              className="text-[22vw] md:text-[21vw] font-black tracking-tighter leading-none uppercase block"
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(0,0,0,0.07)",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* ── Centerpiece: The House (z-20 = in front of text) ────────── */}
      <motion.div
        className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={houseImg}
          alt="Stinchar Architecture — Minimalist Concept"
          className="h-[75vh] md:h-[88vh] w-auto object-contain object-bottom"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Subtle ground shadow under house ─────────────────────────── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 md:w-96 h-8 bg-black/8 blur-2xl rounded-full z-20 pointer-events-none" />

      {/* ── Top-Left Studio Metadata (like 'P. HOUSE' reference) ─────── */}
      <motion.div
        className="absolute top-10 left-8 md:top-14 md:left-14 z-30 pointer-events-auto"
        custom={1.6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <motion.p className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-stone-800 mb-3">
          Stinchar Studio
        </motion.p>
        <div className="h-px w-8 bg-stone-400 mb-3" />
        <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.18em] text-stone-400 leading-loose">
          Architecture & Design
          <br />
          Est. Innovations Platform
          <br />
          India
        </p>
      </motion.div>

      {/* ── Top-Right Counter Badge ───────────────────────────────────── */}
      <motion.div
        className="absolute top-10 right-8 md:top-14 md:right-14 z-30 text-right pointer-events-auto"
        custom={1.9}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">Current Projects</p>
        <p className="text-4xl md:text-6xl font-black text-stone-800 leading-none">live 🟢</p>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400 mt-1">Active Sites</p>
      </motion.div>

      {/* ── Bottom-Left: Title Block ──────────────────────────────────── */}
      <motion.div
        className="absolute bottom-12 left-8 md:bottom-16 md:left-14 z-30 max-w-sm pointer-events-auto"
        custom={2.1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tighter text-stone-800 mb-4">
          Crafting<br />Atmosphere.
        </h1>
        <p className="text-xs md:text-sm text-stone-400 font-medium tracking-wide leading-relaxed max-w-[260px] mb-8">
          Precision-engineered spaces. From blueprint to breathable reality.
        </p>

        {/* Dashboard Access Button */}
        <button
          onClick={() => navigate('/architect')}
          className="group inline-flex items-center justify-between w-full max-w-[220px] px-6 py-4 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-none border border-stone-800 hover:bg-white hover:text-stone-900 transition-all duration-500 overflow-hidden relative"
        >
          <span className="relative z-10">Enter Studio CRM</span>
          <FaArrowRight className="relative z-10 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[0.16,1,0.3,1] z-0"></div>
        </button>
      </motion.div>

      {/* ── Bottom-Right: Accent Stats ────────────────────────────────── */}
      <motion.div
        className="absolute bottom-12 right-8 md:bottom-16 md:right-14 z-30 text-right pointer-events-auto flex flex-col gap-5"
        custom={2.3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div>
          <p className="text-2xl md:text-4xl font-black text-stone-800 leading-none">₹1.2Cr</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">Portfolio Value</p>
        </div>
        <div>
          <p className="text-2xl md:text-4xl font-black text-stone-800 leading-none">98%</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">Satisfaction Index</p>
        </div>
      </motion.div>

      {/* ── Scroll Hint ──────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-stone-400">Scroll</p>
        <motion.div
          className="w-px h-10 bg-stone-300"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Hotspots (minimal + mark) ─────────────────────────────────── */}
      <div className="hidden md:block">
        <Hotspot style={{ left: "52%", top: "38%" }} label="Vertical Garden" />
        <Hotspot style={{ left: "56%", top: "62%" }} label="Steel Terrace" />
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
    transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
  >
    <div className="relative flex items-center gap-3">
      {/* + Marker */}
      <div className="w-5 h-5 flex items-center justify-center text-stone-500 text-xs font-black border border-stone-300 rounded-full bg-white/80 backdrop-blur-sm cursor-crosshair hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all duration-300">
        +
      </div>
      {/* Tooltip */}
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {label}
      </p>
    </div>
  </motion.div>
);

export default ArchitectHero;
