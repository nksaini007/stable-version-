import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaTwitter, FaInstagram, FaFacebookF } from "react-icons/fa";
import cyberpunkImg from "../images/cyberpunk.png";

const CustomerLanding = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between" style={{ backgroundColor: "#ffc72c" }}>

            {/* --- BACKGROUND TYPOGRAPHY (Red VHMNS) --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                <h1
                    className="text-[#fc361d] font-black tracking-tighter leading-none select-none"
                    style={{ fontSize: "clamp(12rem, 30vw, 35rem)", whiteSpace: "nowrap" }}
                >
                    V H M N S
                </h1>
            </div>

            {/* --- CENTER CHARACTER --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pt-10">
                <img
                    src={cyberpunkImg}
                    alt="Cyberpunk Character"
                    className="max-h-[85vh] object-contain drop-shadow-2xl"
                />
            </div>

            {/* --- WHITE OVERLAY TEXT --- */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-20 mix-blend-overlay">
                <p
                    className="text-white font-bold tracking-[1em] text-center w-full px-4"
                    style={{ fontSize: "clamp(1rem, 2.5vw, 2.5rem)" }}
                >
                    W E &nbsp;&nbsp; D E L I V E R &nbsp;&nbsp; Y O U R &nbsp;&nbsp; N E E D S
                </p>
            </div>

            {/* --- CONTENT LAYER (z-30) --- */}
            <div className="relative z-30 flex flex-col h-screen p-6 md:p-12 justify-between">

                {/* TOP SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">

                    {/* LEFT NAV */}
                    <div className="flex flex-col space-y-8">
                        <span className="text-sm tracking-widest text-black/60 uppercase font-semibold">Menu</span>
                        <nav className="flex flex-col space-y-2 mt-4">
                            <Link to="/home" className="text-xl md:text-3xl font-medium text-black hover:text-white transition-colors">Featured</Link>
                            <Link to="/category/all" className="text-xl md:text-3xl font-medium text-white/70 hover:text-white transition-colors">Categories</Link>
                            <Link to="/community" className="text-xl md:text-3xl font-medium text-white/70 hover:text-white transition-colors">Community</Link>
                            <Link to="/contact" className="text-xl md:text-3xl font-medium text-white/70 hover:text-white transition-colors">Contact us</Link>
                        </nav>
                    </div>

                    {/* RIGHT NAV (Search + Stats) */}
                    <div className="flex flex-col items-end space-y-12 w-full md:w-auto">
                        {/* Modern Futuristic Search Bar */}
                        <div className="relative group w-full sm:w-auto">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-[#fc361d] blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>

                            <div className="relative flex items-center bg-white/20 border border-white/30 backdrop-blur-md rounded-full px-5 py-3 hover:bg-white/30 transition-all focus-within:bg-white/40 focus-within:w-full sm:focus-within:w-80 sm:w-72 duration-500 shadow-[0_8px_32px_0_rgba(252,54,29,0.2)]">
                                <FaSearch className="text-black/80 mr-3 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Search products, artists..."
                                    className="bg-transparent border-none outline-none text-black placeholder:text-black/60 w-full text-sm font-semibold tracking-wide"
                                />
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col items-end space-y-6 text-right">
                            <div>
                                <p className="text-sm font-semibold text-black/60 capitalize">Community</p>
                                <p className="text-black font-medium text-sm mt-1">Stinchar Connect</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-black/60 capitalize">Launch Date</p>
                                <p className="text-black font-medium text-sm mt-1">01.13.2026</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-black/60 capitalize">Orders</p>
                                <p className="text-black font-medium text-sm mt-1">2026</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center">

                    {/* Social Links Rotate */}
                    <div className="hidden md:flex flex-col items-center space-y-4">
                        <a href="#" className="text-black/60 hover:text-black transition-colors"><FaTwitter size={18} /></a>
                        <a href="#" className="text-black/60 hover:text-black transition-colors"><FaFacebookF size={18} /></a>
                        <a href="#" className="text-black/60 hover:text-black transition-colors"><FaInstagram size={18} /></a>
                        <span className="text-xs tracking-widest text-black/60 uppercase -rotate-90 origin-left mt-8 w-32 translate-x-3 whitespace-nowrap">Our Social Media</span>
                    </div>

                    {/* Bottom Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-5xl items-center pb-4 md:pl-16">

                        <div className="border-l-2 border-[#fc361d] pl-4">
                            <p className="text-[#fc361d] font-bold tracking-wider mb-1">STINCHAR HUB</p>
                            <p className="text-xs text-black/60 uppercase tracking-widest">ECOMMERCE</p>
                        </div>

                        <div className="border-l-2 border-[#fc361d] pl-4 col-span-1 md:col-span-1">
                            <p className="text-xs text-black/70 mb-2 leading-relaxed">
                                Born from dedication to providing everything you need in a modern, hyper-connected city. We are the next evolution of delivery.
                            </p>
                            <Link to="/home" className="text-sm font-semibold text-black hover:text-white transition-colors underline decoration-2 underline-offset-4">
                                Shop Now
                            </Link>
                        </div>

                        <div className="border-l-2 border-[#fc361d] pl-4">
                            <p className="text-3xl font-black text-black">10k+</p>
                            <p className="text-xs text-black/60 uppercase tracking-widest mt-1">Products Delivered</p>
                        </div>

                        <div className="border-l-2 border-[#fc361d] pl-4">
                            <p className="text-3xl font-black text-black">99%</p>
                            <p className="text-xs text-black/60 uppercase tracking-widest mt-1">Happy Customers</p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default CustomerLanding;
