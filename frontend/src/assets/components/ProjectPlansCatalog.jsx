import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { FaMap, FaSearch, FaRulerCombined, FaTag, FaChevronLeft, FaCompass, FaCubes, FaArrowRight, FaGem } from "react-icons/fa";
import Nev from "./Nev";
import Footer from "./Footer";
import blueprintBg from "../images/blueprint_bg.png"; 
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";

const ProjectPlansCatalog = () => {
    const { categoryName, planTypeName } = useParams();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await API.get("/construction-plans", {
                    params: {
                        category: categoryName,
                        planType: planTypeName
                    }
                });
                setPlans(data.plans || []);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categoryName, planTypeName]);

    const filteredPlans = plans.filter(plan => {
        const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Removed local getImageUrl in favor of global utility

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex flex-col font-sans selection:bg-[#C5A059]/10 selection:text-[#C5A059] overflow-hidden relative">
            <Nev />

            {/* Subtle Technical Overlay */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-[0.02] grayscale mix-blend-multiply z-0"
                style={{ 
                    backgroundImage: `url(${blueprintBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            ></div>
            
            {/* Elegant Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0" 
                 style={{ backgroundImage: 'linear-gradient(#1A1B1E 1px, transparent 1px), linear-gradient(90deg, #1A1B1E 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>

            <main className="flex-grow pt-32 pb-16 relative z-10 w-full px-4 md:px-10">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                    {/* Premium Status Header */}
                    <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-sm">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => navigate(-1)}
                                className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1A1B1E] hover:bg-[#1A1B1E] hover:text-white transition-all shadow-sm"
                            >
                                <FaChevronLeft className="text-[10px]" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">{categoryName}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                    <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-[0.4em]">{planTypeName}</span>
                                </div>
                                <h1 className="text-3xl font-black text-[#1A1B1E] tracking-tighter leading-none uppercase">blueprint.<span className="text-[#C5A059]">catalog</span></h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 flex-1 md:max-w-2xl">
                            <div className="relative w-full group">
                                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C5A059] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="filter specifications..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/40 border border-gray-50 rounded-2xl px-16 py-4 text-sm font-medium text-[#1A1B1E] placeholder:text-gray-300 focus:border-[#C5A059]/20 focus:bg-white outline-none transition-all shadow-sm" 
                                />
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-10">
                            <div className="h-10 w-px bg-gray-100"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-[#1A1B1E] uppercase tracking-widest mb-1">spec count</span>
                                <span className="text-[14px] font-bold text-[#C5A059] font-mono">{filteredPlans.length.toString().padStart(3, '0')}</span>
                            </div>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center gap-6 py-40">
                            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#C5A059] rounded-full animate-spin"></div>
                            <span className="text-gray-400 tracking-[0.6em] uppercase text-[9px] font-black animate-pulse">scanning structural ledger</span>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[3rem] bg-white/30 backdrop-blur-sm min-h-[400px]">
                            <FaCubes className="text-7xl text-gray-100 mb-6" />
                            <h3 className="text-gray-400 tracking-[0.4em] uppercase text-[10px] font-black">No specifications found matching query.</h3>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto pr-3 no-scrollbar pb-20"
                            style={{ maxHeight: 'calc(100vh - 350px)' }}
                        >
                            {filteredPlans.map((plan, idx) => (
                                <motion.div
                                    key={plan._id}
                                    initial={{ opacity: 0, scale: 0.98, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    <Link to={`/project-plans/${plan._id}`} className="group block h-full">
                                        <div className="bg-white rounded-[2.5rem] border border-white group-hover:border-[#C5A059]/20 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(197,160,89,0.12)] transition-all duration-700 overflow-hidden flex flex-col h-full relative p-3">
                                            {/* Media Container */}
                                            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-50">
                                                {plan.images && plan.images.length > 0 ? (
                                                    <img 
                                                        src={getOptimizedImage(plan.images[0], 800)} 
                                                        alt={plan.title} 
                                                        {...lazyImageProps}
                                                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                        <FaMap className="text-7xl" />
                                                    </div>
                                                )}
                                                
                                                <div className="absolute top-6 left-6">
                                                    <span className="bg-white/90 backdrop-blur-md text-[#1A1B1E] border border-white px-4 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-xl rounded-full">
                                                        {plan._id.substring(0,4).toUpperCase()} / MOD
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-6 right-6">
                                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1A1B1E] shadow-xl transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                                        <FaArrowRight className="text-xs" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details Container */}
                                            <div className="p-8 flex flex-col h-full">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <FaGem className="text-[#C5A059] text-[10px]" />
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Premium Specification</span>
                                                </div>
                                                <h3 className="text-xl font-extrabold text-[#1A1B1E] mb-3 tracking-tight capitalize line-clamp-1 group-hover:text-[#C5A059] transition-colors">{plan.title}</h3>
                                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-10 font-medium">{plan.description}</p>

                                                <div className="mt-auto pt-8 border-t border-gray-50 flex justify-between items-end">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                                                                <FaRulerCombined className="text-[#C5A059] text-[8px]" /> 
                                                            </div>
                                                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Area: {plan.area}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                                                                <FaCompass className="text-gray-300 text-[8px]" /> 
                                                            </div>
                                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Geo-Ref</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Value</p>
                                                        <span className="text-2xl font-black text-[#1A1B1E] tracking-tighter">₹{plan.estimatedCost?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* High-End Refined Footer */}
                    <div className="mt-auto pt-10 flex flex-col md:flex-row justify-between items-center border-t border-gray-100">
                        <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">
                            <div className="flex items-center gap-3 text-[#1A1B1E]">
                                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                                Live Feed
                            </div>
                            <span className="w-12 h-px bg-gray-100"></span>
                            Ref: 0x{planTypeName?.substring(0,3).toUpperCase() || "GEN"}
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-[9px] font-black text-[#1A1B1E] tracking-[0.2em] uppercase mt-4 md:mt-0">
                            <span>stinchar.studio</span>
                            <span className="text-gray-200">/</span>
                            <span>A-Class Documentation</span>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default ProjectPlansCatalog;
