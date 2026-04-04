import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaArrowRight, FaDraftingCompass, FaLayerGroup, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/api";
import Nev from "./Nev";
import Footer from "./Footer";
import blueprintBg from "../images/blueprint_bg.png"; 

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

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;
        const normalizedPath = img.replace(/\\/g, '/');
        return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#0B0C10] min-h-screen flex flex-col font-sans selection:bg-[#66FCF1]/20 selection:text-[#66FCF1] overflow-hidden relative">
            <Nev />

            {/* Premium Technical Overlay */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-[0.1] mix-blend-screen z-0"
                style={{ 
                    backgroundImage: `url(${blueprintBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            ></div>
            
            {/* Dynamic Grid Background Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0" 
                 style={{ backgroundImage: 'linear-gradient(#1F2833 1px, transparent 1px), linear-gradient(90deg, #1F2833 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            <main className="flex-grow pt-32 pb-10 relative z-10 w-full px-4 md:px-10">
                <div className="h-full flex flex-col">
                    {/* Minimalist Floating Status Bar */}
                    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1A1B1E]/40 backdrop-blur-md border border-[#1F2833] p-4 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#66FCF1] to-[#45A29E] flex items-center justify-center shadow-[0_0_20px_rgba(102,252,241,0.2)]">
                                <FaLayerGroup className="text-[#0B0C10] text-lg" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight uppercase">Archive <span className="text-[#45A29E]">Registry</span></h1>
                                <p className="text-[9px] font-bold text-[#45A29E] uppercase tracking-[0.4em]">Stinchar / Systems / V2.0</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 md:max-w-md">
                            <div className="relative w-full">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#45A29E] text-xs" />
                                <input 
                                    type="text" 
                                    placeholder="SCANNING CATEGORIES..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#0B0C10]/60 border border-[#1F2833] rounded-xl px-12 py-2.5 text-[10px] font-bold text-white tracking-widest placeholder:text-gray-600 focus:border-[#66FCF1] outline-none transition-all uppercase" 
                                />
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">
                            <div className="flex flex-col items-end">
                                <span className="text-[#66FCF1]">ACTIVE NODES</span>
                                <span>{filteredCategories.length} OF {categories.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* High-Impact Full-Screen Grid */}
                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center gap-8">
                            <div className="w-20 h-20 border-2 border-[#1F2833] border-t-[#66FCF1] rounded-full animate-spin"></div>
                            <span className="text-[#66FCF1] tracking-[0.5em] uppercase text-[10px] font-bold">Initializing Catalog Interface</span>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pr-2 no-scrollbar"
                            style={{ maxHeight: 'calc(100vh - 250px)' }}
                        >
                            {filteredCategories.map((category, idx) => (
                                <motion.div
                                    key={category._id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    <Link
                                        to={`/project-categories/${encodeURIComponent(category.name)}`}
                                        className="relative block aspect-[4/5] bg-[#1A1B1E] border border-[#1F2833] rounded-2xl overflow-hidden group/card shadow-2xl hover:border-[#66FCF1] transition-all duration-500"
                                    >
                                        {/* Dynamic Image Layer */}
                                        <div className="absolute inset-0 w-full h-full p-2">
                                            <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#0B0C10]">
                                                {category.image ? (
                                                    <img
                                                        src={getImageUrl(category.image)}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 brightness-[0.8] group-hover:brightness-100 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#1F2833]">
                                                        <FaBuilding className="text-8xl opacity-20" />
                                                    </div>
                                                )}
                                                
                                                {/* Technical Grid on Card */}
                                                <div className="absolute inset-0 opacity-10 pointer-events-none border border-[#66FCF1] group-hover:border-[4px] transition-all"></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent opacity-80"></div>
                                            </div>
                                        </div>

                                        {/* Bottom Data Overlay */}
                                        <div className="absolute bottom-6 inset-x-6 z-20">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-[8px] font-bold text-[#66FCF1] uppercase tracking-[0.4em] block mb-2 transition-all group-hover:tracking-[0.6em]">
                                                        CAT / {category.name.substring(0, 3).toUpperCase()}
                                                    </span>
                                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-[#66FCF1] transition-colors">
                                                        {category.name}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 rounded-full border border-[#1F2833] flex items-center justify-center text-[#66FCF1] group-hover:bg-[#66FCF1] group-hover:text-[#0B0C10] transition-all shadow-xl">
                                                    <FaArrowRight className="text-sm" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#1F2833]">
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">Specifications</span>
                                                    <span className="text-[10px] text-white font-bold tracking-widest uppercase">
                                                        {category.planTypes ? `${category.planTypes.length} Types` : "0 Types"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col text-right ml-auto">
                                                    <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">Index Status</span>
                                                    <span className="text-[10px] text-[#66FCF1] font-bold tracking-widest uppercase">Verified</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating ID Tag */}
                                        <div className="absolute top-6 right-6 z-20">
                                            <div className="bg-[#0B0C10]/80 backdrop-blur-md border border-[#1F2833] text-gray-500 text-[7px] font-bold px-3 py-1.5 uppercase tracking-widest group-hover:text-[#66FCF1] group-hover:border-[#66FCF1] transition-all">
                                                ID: {category._id.substring(0,6)}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* High-End Technical Indicator */}
                    <div className="mt-auto pt-6 flex flex-col md:flex-row justify-between items-center bg-[#1A1B1E]/20 p-4 rounded-xl border border-[#1F2833]/50">
                        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-gray-600">
                            <span className="text-[#66FCF1] animate-pulse">●</span> SYSTEM READY
                            <span className="w-10 h-px bg-[#1F2833]"></span>
                            CATALOG CACHED / 100%
                        </div>
                        <div className="hidden md:block text-[8px] font-mono text-[#45A29E] tracking-widest uppercase mt-4 md:mt-0">
                            COORD: 28.6139N / 77.2090E | REF: ARCH-INDEX-GLOBAL
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
