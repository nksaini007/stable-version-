import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaChevronRight, FaCompass } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/api";
import Nev from "./Nev";
import Footer from "./Footer";

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
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="bg-[#0A0A0B] min-h-screen flex flex-col font-sans text-slate-200 selection:bg-amber-500/30 selection:text-amber-200">
            <Nev />

            {/* Background Texture/Gradient */}
            <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/40 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/30 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-900/20 blur-[100px]"></div>
            </div>

            <main className="flex-grow pt-40 pb-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Cinematic Header */}
                    <header className="mb-24 relative">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <span className="h-px w-12 bg-amber-500/60"></span>
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500/80">Premium Architecture</span>
                        </motion.div>

                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="max-w-3xl"
                            >
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.95] text-white">
                                    DESIGN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200">BEYOND</span> LIMITS
                                </h1>
                                <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-2xl border-l border-amber-500/30 pl-8">
                                    Browse our curated collection of elite architectural categories. Each blueprint is crafted for precision, elegance, and sustainable living.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="hidden lg:block pb-4"
                            >
                                <div className="flex items-center gap-4 text-slate-500 group cursor-default">
                                    <span className="text-sm tracking-widest uppercase">Scroll to explore</span>
                                    <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                                        <motion.div
                                            animate={{ y: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <FaChevronRight className="rotate-90 text-[10px]" />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </header>

                    {/* Categories Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 border border-amber-500/20 rounded-full"></div>
                                <div className="absolute inset-0 w-20 h-20 border-t-2 border-amber-500 rounded-full animate-spin"></div>
                            </div>
                            <span className="text-amber-500/60 tracking-widest uppercase text-xs font-bold animate-pulse">Loading Collection</span>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 xl:gap-12"
                        >
                            {categories.map((category, index) => (
                                <motion.div
                                    key={category._id}
                                    variants={itemVariants}
                                    className="group"
                                >
                                    <Link
                                        to={`/project-categories/${encodeURIComponent(category.name)}`}
                                        className="relative block aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 hover:border-amber-500/30 transition-all duration-700 shadow-2xl group/link"
                                    >
                                        {/* Image Container (80% Focus) */}
                                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                                            {category.image ? (
                                                <motion.img
                                                    src={getImageUrl(category.image)}
                                                    alt={category.name}
                                                    whileHover={{ scale: 1.1, filter: "brightness(0.6)" }}
                                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-800">
                                                    <FaBuilding className="text-[120px]" />
                                                </div>
                                            )}

                                            {/* Gradient Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        </div>

                                        {/* Content Overlay (Glassmorphic) */}
                                        <div className="absolute bottom-0 inset-x-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group/glass">
                                                {/* Flare Effect */}
                                                <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full group-hover:bg-amber-500/20 transition-colors"></div>

                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <FaCompass className="text-amber-500 text-xs" />
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
                                                            Architecture
                                                        </span>
                                                    </div>

                                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-amber-200 transition-colors">
                                                        {category.name}
                                                    </h3>

                                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                                                        <p className="text-slate-400 text-sm font-medium">
                                                            {category.planTypes ? `${category.planTypes.length} UNIQUE STYLES` : "REVEAL COLLECTION"}
                                                        </p>
                                                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black -mr-1 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-transform duration-300 group-hover:scale-110">
                                                            <FaChevronRight className="text-xs" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Badge */}
                                        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/40 border border-white/10 text-[10px] font-bold tracking-widest text-white uppercase">
                                                Premium
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!loading && categories.length === 0 && (
                        <div className="text-center py-40 border border-dashed border-zinc-800 rounded-[3rem]">
                            <h3 className="text-2xl font-bold text-slate-500">Catalog is currently private.</h3>
                            <p className="text-slate-600 mt-2">Please check back later or contact us for custom requests.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PlanCategoriesList;

