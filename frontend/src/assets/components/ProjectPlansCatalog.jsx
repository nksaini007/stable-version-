import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { motion } from "framer-motion";
import { FaMap, FaSearch, FaRulerCombined, FaTag, FaChevronLeft } from "react-icons/fa";
import Nev from "./Nev";
import Footer from "./Footer";

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
                // Use the updated API filtering for better performance
                const { data } = await API.get("/construction-plans", {
                    params: {
                        category: categoryName,
                        planType: planTypeName
                    }
                });

                // Fallback filtering if the backend doesn't support query params yet (local dev vs prod sync)
                const finalPlans = data.plans || [];
                setPlans(finalPlans);
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
        <div className="bg-[#FAF9F6] min-h-screen selection:bg-slate-200">
            <Nev />

            {/* Header Hero - Minimalist Industrial Style */}
            <div className="bg-white border-b border-slate-200 pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-3xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="flex items-center gap-3 mb-6"
                        >
                            <Link to={`/project-categories/${encodeURIComponent(categoryName)}`} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                <FaChevronLeft className="text-[10px]" />
                            </Link>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{categoryName} / {planTypeName}</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1 }} 
                            className="text-4xl md:text-6xl font-light text-slate-900 tracking-tight mb-4"
                        >
                            DESIGN <span className="font-bold">SPECIFICATIONS</span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: 0.2 }} 
                            className="text-slate-500 max-w-xl text-sm md:text-base font-normal leading-relaxed"
                        >
                            Explore our technical blueprints for {planTypeName}. 
                            Each plan is engineered for performance and architectural excellence.
                        </motion.p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Find specific blueprint..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 block pl-12 h-14 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-12 h-[1px] bg-slate-100 overflow-hidden relative">
                            <motion.div 
                                className="absolute inset-0 bg-slate-900"
                                animate={{ left: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Loading Registry</span>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                        <FaMap className="text-3xl text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">No active blueprints found</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Adjust your parameters and try again</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredPlans.map((plan, index) => (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/project-plans/${plan._id}`} className="group block h-full">
                                    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 hover:border-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                                            {plan.images && plan.images.length > 0 ? (
                                                <img 
                                                    src={getImageUrl(plan.images[0])} 
                                                    alt={plan.title} 
                                                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200"><FaMap className="text-4xl" /></div>
                                            )}
                                            
                                            <div className="absolute top-6 left-6">
                                                <span className="bg-slate-900 text-white px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest shadow-lg">
                                                    Ref: {plan._id.substring(0,4).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-slate-600 transition-colors uppercase tracking-tight">{plan.title}</h3>
                                            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-6 font-normal">{plan.description}</p>

                                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center mt-auto">
                                                <div className="flex items-center gap-3">
                                                    <FaRulerCombined className="text-slate-300 text-[10px]" /> 
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{plan.area}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Est. Project</p>
                                                    <span className="text-xs font-black text-slate-900">₹{plan.estimatedCost?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default ProjectPlansCatalog;
