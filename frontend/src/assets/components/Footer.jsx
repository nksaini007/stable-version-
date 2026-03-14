import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative bg-[#0a0f1c] text-gray-300 pt-16 pb-8 overflow-hidden border-t border-white/5">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Top Newsletter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 pb-12 border-b border-white/10">
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">
              Join the Stinchar Newsletter
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              Get weekly updates, new architecture plans, and exclusive discounts directly in your inbox.
            </p>
          </div>
          <div className="w-full md:w-1/2 flex m-0">
            <div className="relative w-full max-w-md ml-auto">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full px-5 py-4 pl-12 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
              />
              <FaEnvelope className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                S
              </div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-wider">
                STINCHAR
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Leading provider of comprehensive construction plans, professional services, and high-quality building materials. Turning dreams into reality.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 cursor-pointer">
                <FaFacebookF size={14} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-300 cursor-pointer">
                <FaTwitter size={14} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all duration-300 cursor-pointer">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all duration-300 cursor-pointer">
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold tracking-wide uppercase text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Explore
            </h3>
            <ul className="space-y-3">
              {['Home', 'Products', 'Services', 'Architect Plans', 'Community', 'Seller Store'].map((link) => (
                <li key={link}>
                  <Link to="#" className="group flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-300">
                    <FaArrowRight className="opacity-0 -ml-4 mr-1 text-blue-500 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-0 transition-all duration-300 text-[10px]" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-bold tracking-wide uppercase text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Support
            </h3>
            <ul className="space-y-3">
              {['Contact Us', 'Help Center', 'Track Order', 'Return Policy', 'Terms & Conditions', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <Link to="#" className="group flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-300">
                    <FaArrowRight className="opacity-0 -ml-4 mr-1 text-indigo-500 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-0 transition-all duration-300 text-[10px]" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold tracking-wide uppercase text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                  <FaMapMarkerAlt size={14} />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  123 Stinchar Tower, Tech Park,<br />
                  New Delhi, India 110001
                </p>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                  <FaPhoneAlt size={12} />
                </div>
                <p className="text-sm text-gray-400">
                  +91 98765 43210
                </p>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                  <FaEnvelope size={12} />
                </div>
                <p className="text-sm text-gray-400 hover:text-blue-400 transition-colors cursor-pointer">
                  support@stinchar.com
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Stinchar Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link to="#" className="hover:text-white transition-colors">Security</Link>
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
