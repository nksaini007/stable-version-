import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBuilding } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import Nev from "./Nev";
import Footer from "./Footer";

const PlanCategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get("/api/plan-categories");
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

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
            <Nev />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6"
                        >
                            {/* <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> */}
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Architecture Catalog</span>
                        </motion.div>
                        <motion.h1
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-3xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900"
                        >
                            Explore Our Project Plans
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-slate-500 font-light leading-relaxed"
                        >
                            Select a category to view the available architectural styles and stunning project blueprints customized for your exact needs.
                        </motion.p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                            {categories.map((category, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={category._id}
                                >
                                    <Link
                                        to={`/project-categories/${encodeURIComponent(category.name)}`}
                                        className="block bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group h-full"
                                    >
                                        <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-2 sm:p-4">
                                            {category.image ? (
                                                <img
                                                    src={getImageUrl(category.image)}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <FaBuilding className="text-5xl sm:text-7xl" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 sm:p-6 bg-white border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 sm:line-clamp-none">
                                                    {category.name}
                                                </h3>
                                                <span className="text-gray-400 group-hover:text-blue-500 transition-colors">&rarr;</span>
                                            </div>
                                            <p className="text-slate-500 text-sm">
                                                {category.planTypes ? `${category.planTypes.length} styles available` : "Explore styles"}
                                            </p>
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

export default PlanCategoriesList;
