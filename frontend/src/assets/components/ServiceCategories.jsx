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
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-20 text-center relative">
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-[0.2em]"
            >
               Professional Solutions
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl md:text-7xl font-[900] text-slate-900 leading-[1.1] tracking-tight mb-6"
            >
              Excellence in <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Every Service.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed"
            >
              Discover elite professionals curated for your specific project requirements. 
              Efficiency meets craftsmanship.
            </motion.p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat._id}
                  variants={itemVariants}
                  whileHover={{ y: -12 }}
                  className="group relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
                >
                  <Link to={`/services/${cat._id}`} className="block">
                    {/* Image Container */}
                    <div className="relative h-72 overflow-hidden m-4 rounded-[2rem]">
                      <img
                        src={getOptimizedImage(cat.image, 800)}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        {...lazyImageProps}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      
                      {/* Floating Badge */}
                      <div className="absolute top-5 left-5 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                        {cat.subcategories?.length || 0} Specialties
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 pb-10 pt-4">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <h3 className="text-3xl font-black text-slate-800 capitalize leading-tight mb-2 group-hover:text-orange-600 transition-colors">
                            {cat.name}
                          </h3>
                          <div className="h-1 w-12 bg-orange-600 rounded-full transform origin-left group-hover:scale-x-150 transition-transform duration-500"></div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-sm">
                          <FaArrowRight size={20} />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories?.slice(0, 3).map((sub, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                            {sub.name}
                          </span>
                        ))}
                        {cat.subcategories?.length > 3 && (
                          <span className="text-orange-500 font-black text-xs self-center px-1">
                             •••
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                   <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FaTools className="text-slate-200 text-4xl" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800">New Services Coming</h2>
                   <p className="text-slate-400 mt-3 text-lg font-light">We are curating the best professionals for you. Stay tuned.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Luxury CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-16 rounded-[4rem] bg-slate-900 relative overflow-hidden flex flex-col items-center text-center shadow-[0_50px_100px_rgba(0,0,0,0.2)]"
          >
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
             
             <h2 className="text-5xl md:text-6xl font-black text-white mb-6 relative z-10 tracking-tight leading-tight">
                Premium Custom <br/> <span className="text-orange-500">Requests</span>
             </h2>
             <p className="text-slate-400 text-xl md:text-2xl max-w-2xl mb-12 relative z-10 font-light leading-relaxed">
                Unique project in mind? Our network of elite contractors can handle bespoke requirements with surgical precision.
             </p>
             <Link to="/services/search" className="group relative bg-white px-12 py-5 rounded-3xl font-black text-slate-900 overflow-hidden hover:scale-105 transition-all duration-300">
                <span className="relative z-10 flex items-center gap-3 text-lg">
                   Explore Full Network <FaChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
             </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ServiceCategories;
