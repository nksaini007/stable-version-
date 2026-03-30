import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaCode, FaChartLine, FaFlag } from "react-icons/fa";
import Nev from "../Nev";
import nkSainiImage from "../../img/nk-saini.png";

const Contact = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const contributors = [
    { name: "Team Stinchar", role: "Core Developers", icon: <FaCode /> },
    { name: "Innovation Leads", role: "Product Strategy", icon: <FaChartLine /> },
    { name: "Supply Partners", role: "Logistics Experts", icon: <FaFlag /> },
  ];

  return (
    <div className="bg-[#0a0a0b] text-white min-h-screen font-sans selection:bg-amber-500/30">
      <Nev />

      {/* Hero Section - Full Background */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Layer with Zoom-In Animation */}
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0 h-[110%] w-full"
          style={{
            backgroundImage: `url(${nkSainiImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
          }}
        >
          {/* Advanced Gradient Overlay: Ensures readability from left, and blends to bottom */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full">
          {/* Bio Content - Precisely Aligned */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="max-w-2xl text-left space-y-8"
          >
            <div className="space-y-4">
              <motion.p variants={fadeIn} className="text-amber-500 font-medium tracking-[0.3em] uppercase text-sm">
                Visionary & Founder
              </motion.p>
              <motion.h1
                variants={fadeIn}
                className="text-6xl sm:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 leading-[0.9]"
              >
                NK Saini
              </motion.h1>
            </div>

            <motion.div variants={fadeIn} className="relative pl-8 border-l-2 border-amber-500/50">
              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-light">
                A mission-driven entrepreneur focused on revitalizing the Indian manufacturing landscape.
                Through Stinchar, I am dedicated to rebuilding the lost Indian supply chain and removing dependency
                on foreign markets.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="flex gap-4 pt-4">
              {/* <a href="#" className="flex items-center gap-3 px-6 py-3 bg-amber-500 text-[#0a0a0b] font-bold rounded-full hover:bg-white transition-all transform hover:scale-105">
                Learn More <FaFlag />
              </a> */}
              <div className="flex gap-4 items-center pl-4 border-l border-white/10">
                <a href="#" className="text-white/40 hover:text-amber-500 transition-colors">
                  <FaGithub size={24} />
                </a>
                <a href="#" className="text-white/40 hover:text-amber-500 transition-colors">
                  <FaLinkedin size={24} />
                </a>
                <a href="#" className="text-white/40 hover:text-amber-500 transition-colors">
                  <FaTwitter size={24} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll Down</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-amber-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* Contributors Section */}
      <section className="py-24 bg-[#0d0d0f] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight">The Architects of Stinchar</h2>
            <p className="text-slate-500">The brilliant minds helping us build the future of Indian commerce.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contributors.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all group hover:-translate-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  {member.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-slate-400">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision & Story Section */}
      <section className="relative py-24 px-6 sm:px-10 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)", backgroundSize: "4rem 4rem" }}></div>

        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="px-4 py-2 rounded-full border border-amber-500/30 text-amber-500 text-sm font-medium tracking-widest uppercase bg-amber-500/5">
              Future Vision
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Rebuilding the <span className="text-amber-500 italic">Indian Backbone.</span>
            </h2>
            <div className="space-y-6 text-xl text-slate-300 leading-relaxed font-light">
              <p>
                Stinchar was born out of a stark realization: the Indian supply chain, once the envy of the world,
                has become fragmented and overly dependent on foreign superpowers like China.
              </p>
              <p className="bg-white/5 p-6 rounded-2xl border-l-4 border-amber-500 italic text-white/90">
                "Our goal is not just to build a marketplace, but to recreate the ecosystem where Indian creators
                and manufacturers thrive without external chains."
              </p>
              <p>
                We are on a mission to remove this dependency. By empowering local vendors, digitizing artisan talent,
                and securing our logistics, we are reclaiming the Indian market for Indians. This is our story,
                and this is our future.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info (Compact) */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Stinchar. All rights reserved.</p>
          <div className="flex justify-center gap-8 text-slate-400 text-sm">
            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
            <a href="mailto:contact@stinchar.com" className="hover:text-amber-500 transition-colors">contact@stinchar.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
