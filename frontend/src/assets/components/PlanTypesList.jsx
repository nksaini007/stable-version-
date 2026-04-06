import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRulerCombined, FaCompass, FaChevronLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import API from "../api/api";
import Nev from "./Nev";
import Footer from "./Footer";

const PlanTypesList = () => {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const [planTypes, setPlanTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlanTypes = async () => {
            try {
                // Fetch all categories to locate the plan types for the current category
                const { data } = await API.get("/plan-categories");
                const currentCategory = data.categories.find(c => c.name === categoryName);
                if (currentCategory && currentCategory.planTypes) {
                    setPlanTypes(currentCategory.planTypes);
                }
            } catch (error) {
                console.error("Failed to load plan types", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlanTypes();
    }, [categoryName]);

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;
        const normalizedPath = img.replace(/\\/g, '/');
        return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex flex-col font-sans selection:bg-[#C5A059]/10 selection:text-[#C5A059] overflow-hidden relative">
            <Nev />

            {/* Subtle Grid Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
                 style={{ backgroundImage: 'radial-gradient(#1A1B1E 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <main className="flex-grow pt-32 pb-24 relative z-10 w-full px-4 md:px-10">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                    {/* Premium Header */}
                    <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="flex-1">
                            <button
                                onClick={() => navigate('/project-categories')}
                                className="group flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 hover:text-[#1A1B1E] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-[#1A1B1E] transition-colors">
                                    <FaChevronLeft className="text-[8px]" />
                                </div>
                                back to gallery
                            </button>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <span className="h-px w-10 bg-[#C5A059]"></span>
                                <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.6em]">Category / {categoryName}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-[#1A1B1E] tracking-tighter leading-none uppercase">
                                architectural.<span className="text-[#C5A059]">styles</span>
                            </h1>
                            <p className="mt-8 text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
                                Exploration of structural archetypes within the {categoryName} discipline. Each style represents a unique philosophical approach to space.
                            </p>
                        </div>
                        
                        <div className="hidden lg:block pb-2">
                            <div className="p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-white flex flex-col items-end shadow-sm">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Index capacity</span>
                                <span className="text-3xl font-black text-[#1A1B1E] font-mono">{planTypes.length.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center py-40 gap-6">
                            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#C5A059] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {planTypes.map((type, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={type._id}
                                    className="group"
                                >
                                    <Link
                                        to={`/project-categories/${encodeURIComponent(categoryName)}/${encodeURIComponent(type.name)}`}
                                        className="block bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(197,160,89,0.12)] transition-all duration-700 border border-white group-hover:border-[#C5A059]/20 p-3"
                                    >
                                        <div className="aspect-[5/4] bg-[#FAF9F6] rounded-[2rem] overflow-hidden relative">
                                            {type.image ? (
                                                <img
                                                    src={getImageUrl(type.image)}
                                                    alt={type.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <FaRulerCombined className="text-7xl" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-[#1A1B1E]/0 group-hover:bg-[#1A1B1E]/5 transition-colors duration-500"></div>
                                        </div>
                                        
                                        <div className="p-6 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-[#C5A059] uppercase tracking-widest mb-1 italic">Signature</span>
                                                <h3 className="text-xl font-extrabold text-[#1A1B1E] tracking-tight capitalize line-clamp-1 group-hover:text-[#C5A059] transition-colors">
                                                    {type.name}
                                                </h3>
                                            </div>
                                            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1B1E] group-hover:bg-[#1A1B1E] group-hover:text-[#C5A059] transition-all">
                                                <FaArrowLeft className="rotate-180 text-[10px]" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PlanTypesList;
