import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaTools, FaChevronRight } from "react-icons/fa";
import API from "../api/api";
import Nev from "./Nev";

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
      <div className="min-h-screen bg-[#fafbfc] pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16 text-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-extrabold text-gray-900 leading-tight"
            >
              Explore <span className="text-orange-600">Services</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 mt-4 text-xl max-w-2xl"
            >
              Choose a category to find the best professionals for your needs.
              From home repairs to personal care, we've got you covered.
            </motion.p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat._id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 p-2"
                >
                  <Link to={`/services/${cat._id}`} className="block">
                    {/* Image Container */}
                    <div className="relative h-64 rounded-[1.8rem] overflow-hidden">
                      <img
                        src={cat.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&q=80&w=800"}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                        {cat.subcategories?.length || 0} Specialties
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-800 capitalize group-hover:text-orange-600 transition">
                          {cat.name}
                        </h3>
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          <FaArrowRight />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-500">
                        {cat.subcategories?.slice(0, 3).map((sub, idx) => (
                          <span key={idx} className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 italic">
                            {sub.name}
                          </span>
                        ))}
                        {cat.subcategories?.length > 3 && (
                          <span className="text-orange-500 font-medium">+{cat.subcategories.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full py-20 text-center">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaTools className="text-gray-400 text-3xl" />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-700">No categories found</h2>
                   <p className="text-gray-500 mt-2">Check back later or contact admin to add services.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-24 p-12 rounded-[3rem] bg-gradient-to-r from-orange-600 to-orange-400 text-white relative overflow-hidden flex flex-col items-center text-center shadow-2xl shadow-orange-200"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
             
             <h2 className="text-4xl font-extrabold mb-4 relative z-10">Can't find what you're looking for?</h2>
             <p className="text-orange-50 text-xl max-w-xl mb-8 relative z-10">Our community is always growing. Use our search tool to find specific niche services or request a custom quote.</p>
             <Link to="/services/search" className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2">
                All Services <FaChevronRight size={14} />
             </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ServiceCategories;
