import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { motion } from "framer-motion";
import { FaMap, FaSearch, FaRulerCombined, FaTag } from "react-icons/fa";
import Nev from "./Nev";

const ProjectPlansCatalog = () => {
    const { categoryName, planTypeName } = useParams();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plansRes] = await Promise.all([
                    API.get("/construction-plans")
                ]);

                // Filter plans strictly by category and planType from URL
                const filteredByParams = plansRes.data.plans.filter(p =>
                    p.category === categoryName && p.planType === planTypeName
                );

                setPlans(filteredByParams);
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
        <div className="bg-slate-50 min-h-screen">
            <Nev />

            {/* Header Hero */}
            <div className="bg-slate-900 text-white pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-6">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{categoryName} &middot; {planTypeName}</span>
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold mb-5 text-white tracking-tight">
                        Curated Blueprints
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                        Browse our exclusive catalog of professional architectural plans and exceptional designs to find the perfect foundation for your next project.
                    </motion.p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
                <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex flex-col md:flex-row gap-3 items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate(`/project-categories/${encodeURIComponent(categoryName)}`)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0"
                            title="Back to plan types"
                        >
                            <FaMap className="rotate-180" />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold text-gray-800">{planTypeName}</h2>
                            <p className="text-xs text-gray-500">Under {categoryName}</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg focus:ring-1 focus:ring-slate-800 focus:border-slate-800 block pl-9 p-2.5 transition-colors outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-slate-800 rounded-full animate-spin"></div>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <FaMap className="text-4xl text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800">No plans found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                        {filteredPlans.map((plan, index) => (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/project-plans/${plan._id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-500 transition-all duration-300 group flex flex-col h-full cursor-pointer relative block">
                                    <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden bg-gray-50 border-b border-gray-100 flex items-center justify-center p-2">
                                        {plan.images && plan.images.length > 0 ? (
                                            <img src={getImageUrl(plan.images[0])} alt={plan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><FaMap className="text-2xl md:text-4xl" /></div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 md:px-3 md:py-1 rounded text-[9px] md:text-[10px] font-bold text-slate-700 border border-gray-200 shadow-sm uppercase tracking-wider line-clamp-1 max-w-[85%]">
                                            {plan.planType}
                                        </div>
                                    </div>

                                    <div className="p-3.5 sm:p-5 flex-1 flex flex-col bg-white">
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">{plan.title}</h3>
                                        <p className="text-slate-500 text-[10px] sm:text-[11px] md:text-sm line-clamp-2 leading-relaxed flex-1 mb-3">{plan.description}</p>

                                        <div className="pt-3 md:pt-4 border-t border-gray-100 flex flex-col xl:flex-row justify-between xl:items-center mt-auto gap-2">
                                            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] sm:text-[11px] md:text-xs text-slate-600 font-medium whitespace-nowrap overflow-hidden">
                                                <FaRulerCombined className="text-gray-400 shrink-0" /> <span className="truncate">{plan.area}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] sm:text-[11px] md:text-xs text-slate-800 font-bold whitespace-nowrap overflow-hidden">
                                                <FaTag className="text-gray-400 shrink-0" /> <span className="truncate">{plan.estimatedCost}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPlansCatalog;
