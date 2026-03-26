import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';

const Footer = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="w-full bg-[#0d1117] border-t border-white/5 relative z-50">
      {/* Minimal Strip (Always Visible) */}
      <div 
        className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white font-bold text-sm border border-white/10">
            S
          </div>
          <span className="text-sm font-black tracking-widest text-white uppercase">Stinchar</span>
          <span className="text-[10px] text-gray-500 font-bold hidden sm:block">© {new Date().getFullYear()} — All Rights Reserved</span>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white">
            {isExpanded ? 'Show Less' : 'More Info'}
          </span>
          {isExpanded ? (
            <FaChevronDown className="text-gray-500 group-hover:text-white text-xs" />
          ) : (
            <FaChevronUp className="text-gray-500 group-hover:text-white text-xs" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {/* Brand Section */}
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Leading provider of comprehensive construction plans, professional services, and high-quality building materials.
                </p>
                <div className="flex gap-3">
                  {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                    <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 border border-white/5 transition-all">
                      <Icon size={12} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Explore</h4>
                <ul className="space-y-2">
                  {['Home', 'Products', 'Services', 'Community'].map((link) => (
                    <li key={link}>
                      <Link to="#" className="text-xs text-gray-500 hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Support</h4>
                <ul className="space-y-2">
                  {['Contact Us', 'Help Center', 'Terms', 'Privacy'].map((link) => (
                    <li key={link}>
                      <Link to="#" className="text-xs text-gray-500 hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 pt-4 md:pt-0">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-gray-600 text-xs" />
                  <p className="text-[11px] text-gray-500">shivaji park, Alwar, Rajasthan 301001</p>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-gray-600 text-xs" />
                  <p className="text-[11px] text-gray-500">+916377011413</p>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-600 text-xs" />
                  <p className="text-[11px] text-gray-500">Email Unavailable</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
