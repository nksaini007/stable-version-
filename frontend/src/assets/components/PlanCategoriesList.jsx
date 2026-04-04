import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaArrowRight, FaDraftingCompass } from "react-icons/fa";
import { motion } from "framer-motion";
import API from "../api/api";
import Nev from "./Nev";
import Footer from "./Footer";
import blueprintBg from "../images/blueprint_bg.png"; // Importing the new background

const PlanCategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            transition: { duration: 0.5, ease: "easeOut" } 
        }
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex flex-col font-sans text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900 overflow-x-hidden relative">
            <Nev />

            {/* Technical Blueprint Background */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply z-0"
                style={{ 
                    backgroundImage: `url(${blueprintBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            ></div>
            
            {/* Subtle Grid Pattern Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <main className="flex-grow pt-44 pb-20 relative z-10 w-full px-4 sm:px-6 lg:px-12">
                <div className="max-w-[1800px] mx-auto">
                    {/* Minimalist Tech Header */}
                    <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-10">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 mb-4"
                            >
                                <span className="w-8 h-px bg-zinc-400"></span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Bureau Index / V2.0</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-zinc-900"
                            >
                                PROJECT <span className="font-bold">ARCHIVE</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-zinc-500 text-sm md:text-base max-w-lg leading-relaxed font-normal"
                            >
                                Technical blueprints for modern architecture. 
                                High-precision engineering and aesthetic integrity in every design.
                            </motion.p>
                        </div>
                        
                        <div className="hidden md:flex flex-col items-end gap-1 font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-6 md:mt-0">
                            <span>Lat: 28.6139° N</span>
                            <span>Lon: 77.2090° E</span>
                            <span>Ref: STIN-001</span>
                        </div>
                    </header>

                    {/* Full-Width Grid (4 columns) */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-48 gap-8">
                            <div className="w-16 h-[1px] bg-zinc-200 overflow-hidden relative">
                                <motion.div 
                                    className="absolute inset-0 bg-zinc-800"
                                    animate={{ left: ['-100%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                />
                            </div>
                            <span className="text-zinc-400 tracking-[0.3em] uppercase text-[9px] font-bold">Synchronizing Data</span>
                        </div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8"
                        >
                            {categories.map((category) => (
                                <motion.div
                                    key={category._id}
                                    variants={itemVariants}
                                    className="group"
                                >
                                    <Link
                                        to={`/project-categories/${encodeURIComponent(category.name)}`}
                                        className="relative block aspect-[3/4] bg-white border border-zinc-200 hover:border-zinc-800 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl group/card"
                                    >
                                        {/* Main Project Image - Maximum Visibility */}
                                        <div className="absolute inset-0 w-full h-full p-1">
                                            <div className="relative w-full h-full overflow-hidden">
                                                {category.image ? (
                                                    <img
                                                        src={getImageUrl(category.image)}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 brightness-[1.02] group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-200">
                                                        <FaBuilding className="text-6xl" />
                                                    </div>
                                                )}
                                                
                                                {/* Technical Grid Overlay on Image */}
                                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay border-[5px] border-zinc-900 group-hover:border-zinc-400 transition-all"></div>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                                            </div>
                                        </div>

                                        {/* Minimalist Info Label */}
                                        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-zinc-100 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="relative">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                                                            Project / {category.name.substring(0, 3).toUpperCase()}
                                                        </span>
                                                        <h3 className="text-xl font-medium text-zinc-900 tracking-tight leading-none">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                    <div className="w-8 h-8 flex items-center justify-center text-zinc-300 group-hover:text-zinc-900 transition-colors">
                                                        <FaDraftingCompass className="text-xs" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-zinc-50 pt-4 mt-2">
                                                    <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                                                        {category.planTypes ? `${category.planTypes.length} Variants` : "0 Variants"}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <span className="text-[9px] font-bold tracking-tighter">VIEW SPEC</span>
                                                        <FaArrowRight className="text-[10px]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Design Index Tag */}
                                        <div className="absolute top-6 left-6 z-20 origin-left">
                                            <div className="bg-zinc-900 text-white text-[8px] font-bold px-3 py-1.5 uppercase tracking-[0.2em] shadow-lg">
                                                Active
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Technical Footer Message */}
                    {!loading && categories.length > 0 && (
                        <div className="mt-20 border-t border-zinc-100 pt-8 flex items-center justify-center text-zinc-300 gap-4">
                            <span className="w-4 h-[1px] bg-zinc-200"></span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.5em]">End of Archive Registry</span>
                            <span className="w-4 h-[1px] bg-zinc-200"></span>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && categories.length === 0 && (
                        <div className="text-center py-48 border border-dashed border-zinc-200">
                            <h3 className="text-sm font-bold text-zinc-400 tracking-[0.2em] uppercase">No active projects matching parameters.</h3>
                            <button className="mt-6 px-8 py-3 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <div className="relative z-20">
                <Footer />
            </div>
        </div>
    );
};

export default PlanCategoriesList;


