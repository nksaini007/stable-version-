import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { FaMap, FaSearch, FaRulerCombined, FaTag, FaChevronLeft, FaCompass, FaCubes } from "react-icons/fa";
import Nev from "./Nev";
import Footer from "./Footer";
import blueprintBg from "../images/blueprint_bg.png"; 

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

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;
        const normalizedPath = img.replace(/\\/g, '/');
        return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    };

    return (
        <div className="bg-[#0B0C10] min-h-screen flex flex-col font-sans selection:bg-[#66FCF1]/20 selection:text-[#66FCF1] overflow-hidden relative">
            <Nev />

            {/* Fixed Depth Technical Overlay */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-[0.12] mix-blend-screen z-0 grayscale"
                style={{ 
                    backgroundImage: `url(${blueprintBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            ></div>
            
            {/* Structural Grid Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
                 style={{ backgroundImage: 'radial-gradient(#66FCF1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            <main className="flex-grow pt-32 pb-10 relative z-10 w-full px-4 md:px-10">
                <div className="h-full flex flex-col">
                    {/* Minimalist Floating Status Bar */}
                    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1A1B1E]/60 backdrop-blur-xl border border-[#1F2833] p-5 rounded-2xl">
                        <div className="flex items-center gap-5">
                            <button 
                                onClick={() => navigate(-1)}
                                className="w-12 h-12 rounded-xl bg-[#0B0C10] border border-[#1F2833] flex items-center justify-center text-[#66FCF1] hover:bg-[#66FCF1] hover:text-[#0B0C10] transition-all shadow-xl"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8px] font-bold text-[#45A29E] uppercase tracking-[0.4em]">{categoryName}</span>
                                    <span className="text-[8px] text-gray-700">/</span>
                                    <span className="text-[8px] font-bold text-[#66FCF1] uppercase tracking-[0.4em]">{planTypeName}</span>
                                </div>
                                <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Blueprint <span className="text-[#45A29E]">Catalog</span></h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 md:max-w-2xl">
                            <div className="relative w-full">
                                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#45A29E] text-sm" />
                                <input 
                                    type="text" 
                                    placeholder="PARSING BLUEPRINTS BY TITLE OR SPEC..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#0B0C10]/40 border border-[#1F2833] rounded-2xl px-14 py-3.5 text-[11px] font-bold text-white tracking-[0.2em] placeholder:text-gray-700 focus:border-[#66FCF1] outline-none transition-all uppercase" 
                                />
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">
                            <div className="flex flex-col items-end">
                                <span className="text-[#66FCF1]">CATALOG STATUS</span>
                                <span>{filteredPlans.length} SPECIFICATIONS FOUND</span>
                            </div>
                        </div>
                    </header>

                    {/* Full-Screen Project Grid */}
                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center gap-8">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-2 border-[#1F2833] border-t-[#66FCF1] rounded-full animate-spin"></div>
                                <div className="absolute inset-4 border border-[#1F2833] border-b-[#45A29E] rounded-full animate-spin-slow"></div>
                            </div>
                            <span className="text-[#66FCF1] tracking-[0.6em] uppercase text-[10px] font-bold animate-pulse">Scanning Structural Ledger</span>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-[#1F2833] rounded-3xl bg-[#1A1B1E]/10">
                            <FaCubes className="text-6xl text-[#1F2833] mb-6" />
                            <h3 className="text-[#45A29E] tracking-[0.4em] uppercase text-[10px] font-bold">No active blueprints matching query.</h3>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto pr-3 no-scrollbar pb-10"
                            style={{ maxHeight: 'calc(100vh - 280px)' }}
                        >
                            {filteredPlans.map((plan, idx) => (
                                <motion.div
                                    key={plan._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    <Link to={`/project-plans/${plan._id}`} className="group block">
                                        <div className="bg-[#1A1B1E] rounded-3xl border border-[#1F2833] group-hover:border-[#66FCF1] shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full relative">
                                            {/* Media Container */}
                                            <div className="relative aspect-[4/3] overflow-hidden p-2 bg-[#0B0C10]">
                                                {plan.images && plan.images.length > 0 ? (
                                                    <img 
                                                        src={getImageUrl(plan.images[0])} 
                                                        alt={plan.title} 
                                                        className="w-full h-full object-cover rounded-2xl grayscale brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-700" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#1F2833]">
                                                        <FaMap className="text-6xl opacity-30" />
                                                    </div>
                                                )}
                                                
                                                <div className="absolute top-6 left-6 flex gap-2">
                                                    <span className="bg-[#0B0C10]/80 backdrop-blur-md text-[#66FCF1] border border-[#66FCF1]/20 px-3 py-1 text-[8px] font-bold uppercase tracking-widest shadow-2xl">
                                                        SPEC: {plan._id.substring(0,4).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Details Container */}
                                            <div className="p-8 flex flex-col h-full bg-gradient-to-b from-[#1A1B1E] to-[#0B0C10]">
                                                <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase line-clamp-1 group-hover:text-[#66FCF1] transition-colors">{plan.title}</h3>
                                                <p className="text-gray-500 text-[10px] line-clamp-2 leading-relaxed mb-8 uppercase tracking-widest font-bold">{plan.description}</p>

                                                <div className="mt-auto flex justify-between items-end border-t border-[#1F2833] pt-6">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <FaRulerCombined className="text-[#66FCF1] text-xs" /> 
                                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{plan.area}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <FaCompass className="text-[#45A29E] text-xs" /> 
                                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Global Ref</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-1">Project Value</p>
                                                        <span className="text-2xl font-black text-[#66FCF1] tracking-tighter">₹{plan.estimatedCost?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Technical Design Overlay */}
                                            <div className="absolute inset-0 border-[0.5px] border-[#66FCF1]/0 group-hover:border-[#66FCF1]/10 pointer-events-none transition-all"></div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* High-End Technical Indicator */}
                    <div className="mt-auto pt-6 flex flex-col md:flex-row justify-between items-center border-t border-[#1F2833]/50">
                        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-gray-700">
                            <span className="text-[#66FCF1] animate-pulse">●</span> CATALOG STREAMING
                            <span className="w-10 h-px bg-[#1F2833]"></span>
                            OFFSET: {filteredPlans.length} MODS
                        </div>
                        <div className="hidden md:block text-[9px] font-black text-[#45A29E] tracking-[0.4em] uppercase mt-4 md:mt-0">
                            STINCHAR / ARCHITECTURAL LEDGER / GEN-3
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default ProjectPlansCatalog;
