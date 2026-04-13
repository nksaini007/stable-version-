import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChevronLeft, FaSearch, FaArrowRight, FaImage } from "react-icons/fa";
import API from "../api/api";
import Nev from "./Nev";

const ServiceSubCategories = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await API.get("/service-categories");
        const found = data.find((c) => c._id === categoryId);
        setCategory(found);
      } catch (err) {
        console.error("Error fetching category:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fafbfc]">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafbfc]">
        <h2 className="text-2xl font-bold text-gray-800">Category not found</h2>
        <button
          onClick={() => navigate("/services")}
          className="mt-4 text-orange-600 flex items-center gap-2 font-bold"
        >
          <FaChevronLeft /> Back to Services
        </button>
      </div>
    );
  }

  return (
    <>
      <Nev />
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
            <div className="space-y-6">
              <Link
                to="/services"
                className="group inline-flex items-center gap-2 text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase hover:text-orange-600 transition-colors"
              >
                <FaChevronLeft size={8} className="group-hover:-translate-x-1 transition-transform" /> Back to Categories
              </Link>
              <h1 className="text-6xl md:text-7xl font-[900] text-slate-900 tracking-tight capitalize leading-[1.1]">
                {category.name}
              </h1>
              <p className="text-slate-500 text-xl md:text-2xl max-w-2xl font-light leading-relaxed">
                Precision services for {category.name.toLowerCase()} projects. 
                Select a specialty to begin.
              </p>
            </div>
            
            <div className="w-full lg:w-auto">
                 <div className="relative group">
                     <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                     <input 
                        type="text" 
                        placeholder="Search specialties..." 
                        className="pl-14 pr-8 py-5 rounded-[2rem] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] focus:shadow-[0_20px_50px_rgba(0,0,0,0.06)] focus:ring-4 focus:ring-orange-50 outline-none w-full lg:w-80 transition-all border-none text-slate-700"
                     />
                 </div>
            </div>
          </div>

          {/* Subcategories Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {category.subcategories.map((sub, idx) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
              >
                <Link to={`/services/${category._id}/${sub._id}`} className="flex flex-col h-full">
                  {/* Thumbnail */}
                  <div className="h-56 overflow-hidden relative m-3 rounded-[2rem]">
                    {sub.image ? (
                        <img 
                            src={sub.image} 
                            alt={sub.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                             <FaImage size={40} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Content */}
                  <div className="px-8 pb-8 pt-2 flex flex-col flex-1">
                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-orange-600 transition-colors mb-2">
                        {sub.name}
                    </h3>
                    <p className="text-slate-400 text-sm font-light leading-relaxed mb-8 flex-1">
                        High-performance {sub.name.toLowerCase()} solutions for enterprise and residential needs.
                    </p>
                    
                    <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                        <span className="text-orange-600 text-[10px] font-black tracking-[0.2em] uppercase">Browse Deals</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                            <FaArrowRight size={14} />
                        </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {category.subcategories.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[4rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                <p className="text-slate-400 text-2xl font-light mb-8 italic">
                  Curating premium specialties...
                </p>
                <button 
                  onClick={() => navigate("/services")}
                  className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black hover:scale-105 transition-all shadow-xl shadow-slate-200"
                >
                  Explore Other Realms
                </button>
              </div>
            )}
          </motion.div>

          {/* Luxury Support Section */}
          <div className="mt-40 flex flex-col lg:flex-row items-center gap-20 p-16 bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.04)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[80px]"></div>
             
             <div className="relative w-full lg:w-1/2 rounded-[3rem] overflow-hidden group shadow-2xl">
                 <img 
                    src="https://images.unsplash.com/photo-1521791136064-7986c29596ba?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt="Support"
                 />
                 <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
             </div>
             
             <div className="lg:w-1/2 space-y-8">
                 <div className="w-16 h-1 w-1 bg-orange-600 rounded-full"></div>
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">Expert Consulting <br/> for {category.name}</h2>
                 <p className="text-slate-500 text-xl font-light leading-relaxed">Our strategists are ready to help you navigate complex requirements and secure the ideal service professional.</p>
                 <div className="flex flex-wrap gap-6 pt-4">
                    <button className="bg-orange-600 text-white px-10 py-5 rounded-3xl font-black shadow-[0_20px_40px_rgba(234,88,12,0.2)] hover:scale-105 transition active:scale-95">
                        Consult with Expert
                    </button>
                    <button className="bg-slate-50 text-slate-600 px-10 py-5 rounded-3xl font-black hover:bg-slate-100 transition">
                        Methodology
                    </button>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceSubCategories;
