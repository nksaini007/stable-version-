import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { FaSearch, FaArrowRight, FaChevronLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import Nev from "./Nev";

const ServiceSubCategories = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/service-categories/${categoryId}`);
                setCategory(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [categoryId]);

    const filteredSubCategories = category?.subcategories?.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!category) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-20">
            <Nev />
            <div className="pt-24 px-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-8">
                    <div className="border-l-4 border-slate-900 pl-6">
                        <Link to="/services" className="group inline-flex items-center gap-2 text-slate-400 font-bold text-[10px] tracking-widest uppercase hover:text-slate-900 transition-colors mb-2">
                            <FaChevronLeft size={8} className="group-hover:-translate-x-1 transition-transform" /> Back to Categories
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">
                            {category.name}
                        </h1>
                    </div>
                    
                    <div className="mt-6 md:mt-0">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search sub-specialties..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 bg-white border border-slate-200 px-4 py-3 rounded-none outline-none focus:border-slate-900 text-sm transition-all"
                            />
                            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Subcategories Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {filteredSubCategories.length > 0 ? (
                        filteredSubCategories.map((sub) => (
                            <motion.div
                                key={sub._id}
                                variants={itemVariants}
                                className="bg-white border border-slate-100 rounded-none overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all duration-300"
                            >
                                <Link to={`/services/${categoryId}/${sub._id}`} className="block group">
                                    <div className="h-44 overflow-hidden relative">
                                        <img
                                            src={sub.image || "https://images.unsplash.com/photo-1581094794329-c8112a4e5190?w=600"}
                                            alt={sub.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/5"></div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide group-hover:text-slate-900 transition-colors">
                                                {sub.name}
                                            </h3>
                                            <FaArrowRight size={12} className="text-slate-300 transition-colors group-hover:text-slate-900" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            Specialty Resource
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border-t border-slate-100">
                             <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No matching specializations found</h2>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ServiceSubCategories;
