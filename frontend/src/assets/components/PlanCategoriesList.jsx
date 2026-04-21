import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaArrowRight, FaLayerGroup, FaSearch, FaProjectDiagram } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/api";
import Nev from "./Nev";
import Footer from "./Footer";
import blueprintBg from "../images/blueprint_bg.png"; 
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";

const PlanCategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get("/plan-categories");
                setCategories(data.categories || []);
            } catch (error) {
                console.error("Failed to load plan categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Simplified getImageUrl to use global utility

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex flex-col font-sans selection:bg-[#C5A059]/20 selection:text-[#C5A059] overflow-hidden relative">
            <Nev />

            {/* Subtle Texture Overlay */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale mix-blend-multiply z-0"
                style={{ 
                    backgroundImage: `url(${blueprintBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            ></div>
            
            {/* Elegant Grid Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
                 style={{ backgroundImage: 'linear-gradient(#1A1B1E 1px, transparent 1px), linear-gradient(90deg, #1A1B1E 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
            </div>

            <main className="flex-grow pt-32 pb-16 relative z-10 w-full px-4 md:px-10">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                    {/* Premium Floating Header */}
                    <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#1A1B1E] flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                                <FaLayerGroup className="text-[#C5A059] text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-[#1A1B1E] tracking-tight uppercase">archive.<span className="text-[#C5A059]">registry</span></h1>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">curated collections / stinchar v2.0</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 flex-1 md:max-w-xl">
                            <div className="relative w-full group">
                                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C5A059] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="search categories..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/50 border border-gray-100 rounded-2xl px-16 py-4 text-sm font-medium text-[#1A1B1E] placeholder:text-gray-300 focus:border-[#C5A059]/30 focus:bg-white outline-none transition-all shadow-sm" 
                                />
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-10">
                            <div className="h-10 w-px bg-gray-100"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-[#1A1B1E] uppercase tracking-widest leading-none mb-1">active indices</span>
                                <span className="text-[14px] font-bold text-[#C5A059] font-mono">{filteredCategories.length.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center gap-6">
                            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#C5A059] rounded-full animate-spin"></div>
                            <span className="text-gray-400 tracking-[0.4em] uppercase text-[9px] font-black animate-pulse">synchronizing catalog</span>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 overflow-y-auto pr-2 no-scrollbar pb-10"
                            style={{ maxHeight: 'calc(100vh - 300px)' }}
                        >
                            {filteredCategories.map((category, idx) => (
                                <motion.div
                                    key={category._id}
                                    initial={{ opacity: 0, scale: 0.98, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="group"
                                >
                                    <Link
                                        to={`/project-categories/${encodeURIComponent(category.name)}`}
                                        className="relative block aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(197,160,89,0.12)] transition-all duration-700 border border-white group-hover:border-[#C5A059]/20"
                                    >
                                        {/* Image Section */}
                                        <div className="absolute inset-x-3 top-3 bottom-1/3 overflow-hidden rounded-[2rem] bg-gray-50">
                                            {category.image ? (
                                                <img
                                                    src={getOptimizedImage(category.image, 600)}
                                                    alt={category.name}
                                                    {...lazyImageProps}
                                                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <FaBuilding className="text-7xl" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="absolute bottom-10 inset-x-8">
                                            <span className="inline-block px-3 py-1 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest rounded-full mb-4 group-hover:bg-[#C5A059]/10 group-hover:text-[#C5A059] transition-colors">
                                                Collection 0{idx + 1}
                                            </span>
                                            <h3 className="text-2xl font-extrabold text-[#1A1B1E] tracking-tight group-hover:translate-x-2 transition-transform duration-500 capitalize">
                                                {category.name}
                                            </h3>
                                            
                                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] text-gray-400 font-black uppercase tracking-widest mb-1">Architecture</span>
                                                    <span className="text-[11px] text-[#1A1B1E] font-bold uppercase tracking-wider">
                                                        {category.planTypes ? `${category.planTypes.length} Styles` : "Bespoke"}
                                                    </span>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-gray-50 flex items-center justify-center text-[#1A1B1E] group-hover:bg-[#1A1B1E] group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700">
                                                    <FaArrowRight className="text-xs" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Premium Floating Tag */}
                                        <div className="absolute top-8 right-8 mix-blend-difference">
                                            <FaProjectDiagram className="text-white text-xs opacity-40" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Refined Technical Footer Indicator */}
                    <div className="mt-auto pt-8 flex flex-col md:flex-row justify-between items-center bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-sm">
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
                            <span className="text-[#C5A059] animate-ping">●</span> system idle
                            <span className="w-12 h-[1px] bg-gray-100"></span>
                            data stream verified
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-[8px] font-bold text-gray-300 tracking-[0.3em] uppercase">
                            <span>stn-res-lx-21</span>
                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                            <span>lat: 28.6139 | lng: 77.2090</span>
                        </div>
                    </div>
                </div>
            </main>

            <div className="relative z-20">
                <Footer />
            </div>
        </div>
    );
};

export default PlanCategoriesList;
