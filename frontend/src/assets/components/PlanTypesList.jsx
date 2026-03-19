import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRulerCombined } from "react-icons/fa";
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
        <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
            <Nev />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-16">
                        <button
                            onClick={() => navigate('/project-categories')}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full font-medium mb-8 transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                            <FaArrowLeft className="text-sm" /> <span>Back to Categories</span>
                        </button>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-4">
                            {categoryName} Styles
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl">
                            Choose a specific architectural style below to explore our curated collection of pristine blueprints.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : planTypes.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                            <FaRulerCombined className="text-5xl text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Plan Types Found</h2>
                            <p className="text-gray-500">There are currently no plan types available for this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {planTypes.map((type, index) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={type._id}
                                >
                                    <Link
                                        to={`/project-categories/${encodeURIComponent(categoryName)}/${encodeURIComponent(type.name)}`}
                                        className="block bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-2 sm:p-4">
                                            {type.image ? (
                                                <img
                                                    src={getImageUrl(type.image)}
                                                    alt={type.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <FaRulerCombined className="text-4xl sm:text-6xl" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-lg line-clamp-1">
                                                {type.name}
                                            </h3>
                                            <span className="text-gray-400 group-hover:text-blue-500 transition-colors">&rarr;</span>
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
