import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaTools, FaChevronRight } from "react-icons/fa";
import API from "../api/api";
import Nev from "./Nev";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/service-categories");
        setCategories(data);
      } catch (err) {
        console.error("Error fetching service categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <Nev />
      <div className="min-h-screen bg-[#FDFDFD] pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 border-l-4 border-slate-900 pl-6">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-slate-900 tracking-tight mb-2"
            >
              Service Directories
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-sm max-w-xl font-medium"
            >
              Select a specialized category to access professional network and project resources.
            </motion.p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat._id}
                  variants={itemVariants}
                  className="bg-white border border-slate-100 rounded-none overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all duration-300"
                >
                  <Link to={`/services/${cat._id}`} className="block group">
                    {/* Image Container */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={getOptimizedImage(cat.image, 600)}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        {...lazyImageProps}
                      />
                      <div className="absolute inset-0 bg-slate-900/10"></div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide group-hover:text-slate-900 transition-colors">
                          {cat.name}
                        </h3>
                        <FaArrowRight size={12} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories?.slice(0, 2).map((sub, idx) => (
                          <span key={idx} className="text-[10px] text-slate-400 font-bold border border-slate-50 px-2 py-0.5 uppercase">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full py-20 text-center border-t border-slate-100">
                   <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No active directories found</h2>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
};

export default ServiceCategories;
