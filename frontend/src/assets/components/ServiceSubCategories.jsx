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
      <div className="min-h-screen bg-[#fafbfc] pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-4">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-orange-600 font-bold hover:translate-x-1 transition-transform"
              >
                <FaChevronLeft size={12} /> ALL CATEGORIES
              </Link>
              <h1 className="text-5xl font-extrabold text-gray-900 capitalize">
                {category.name}
              </h1>
              <p className="text-gray-500 text-lg max-w-xl">
                Choose a specific service area to see available professionals and
                pricing details.
              </p>
            </div>
            
            <div className="flex gap-4">
                 <div className="relative">
                     <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                        type="text" 
                        placeholder="Search within category..." 
                        className="pl-12 pr-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none w-full md:w-64 shadow-sm bg-white"
                     />
                 </div>
            </div>
          </div>

          {/* Subcategories Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {category.subcategories.map((sub, idx) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 flex flex-col"
              >
                <Link to={`/services/${category._id}/${sub._id}`} className="flex flex-col h-full">
                  {/* Thumbnail */}
                  <div className="h-48 overflow-hidden relative">
                    {sub.image ? (
                        <img 
                            src={sub.image} 
                            alt={sub.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                             <FaImage size={40} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Title & Stats */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition mb-2">
                        {sub.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1">
                        Professional services for your {sub.name.toLowerCase()} needs.
                    </p>
                    
                    <div className="footer mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                        <span className="text-orange-600 text-sm font-bold tracking-tight">VIEW DEALS</span>
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm group-hover:bg-orange-600 group-hover:text-white transition group-hover:scale-110">
                            <FaArrowRight size={12} />
                        </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {category.subcategories.length === 0 && (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-300">
                <p className="text-gray-500 text-xl italic font-medium">
                  We're currently expanding this category. Please check back soon!
                </p>
                <button 
                  onClick={() => navigate("/services")}
                  className="mt-6 bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-200/50"
                >
                  Explore Other Categories
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick Support Section */}
          <div className="mt-20 flex flex-col lg:flex-row items-center gap-12 p-10 bg-white rounded-[3.5rem] shadow-xl border border-gray-100">
             <div className="relative w-full lg:w-1/2 rounded-[2.5rem] overflow-hidden group">
                 <img 
                    src="https://images.unsplash.com/photo-1521791136064-7986c29596ba?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt="Support"
                 />
                 <div className="absolute inset-0 bg-orange-600/10 transition-colors group-hover:bg-orange-600/0"></div>
             </div>
             <div className="lg:w-1/2 space-y-4">
                 <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Need expert advice for {category.name}?</h2>
                 <p className="text-gray-500 text-lg">Our dedicated team of advisors can help you choose the right service and professional for your specific requirements.</p>
                 <div className="flex flex-wrap gap-4 pt-4">
                    <button className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-200 hover:scale-105 transition active:scale-95">
                        Chat with Support
                    </button>
                    <button className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-bold hover:border-orange-200 transition">
                        How it works
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
