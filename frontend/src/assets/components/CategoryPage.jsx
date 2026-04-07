import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/api";
import Nev from "./Nev";
import Footer from "./Footer";
import { FaBoxes, FaChevronRight } from "react-icons/fa";
import PublicAds from "./PublicAds";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await API.get(`/categories`);
        const matched = res.data.find(
          (item) => item.name.toLowerCase() === categoryName.toLowerCase()
        );
        setCategory(matched || null);
      } catch (err) {
        console.error("Error fetching category:", err);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e5e5e5] tech-grid flex flex-col pt-24">
        <Nev />
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-black border-t-[#ff5c00] animate-spin mb-4"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">LOADING_SECTOR_DATA...</span>
            </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#e5e5e5] tech-grid flex flex-col pt-24">
        <Nev />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-white border-2 border-black p-12 relative max-w-md">
            <div className="corner-decal decal-tl"></div>
            <div className="corner-decal decal-br"></div>
            <FaBoxes className="text-5xl text-black/10 mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase mb-4">SECTOR_NOT_FOUND</h2>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-8">
              THE_REQUESTED_CATEGORY_COULD_NOT_BE_LOCATED_IN_CENTRAL_INTEL.
            </p>
            <Link
                to="/categories"
                className="inline-block bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5c00] hover:text-black transition-all"
            >
                RETURN_TO_BASE
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e5e5] font-mono selection:bg-[#ff5c00] selection:text-black tech-grid relative flex flex-col pt-24">
      <Nev />
      <div className="scanline"></div>

      <main className="flex-1 max-w-[2000px] mx-auto w-full px-6 md:px-12 py-10 relative z-10">
        
        {/* Breadcrumb - Industrial Style */}
        <nav className="flex items-center gap-2 mb-12" aria-label="Breadcrumb">
            <Link to="/" className="text-[9px] font-black text-black/30 hover:text-[#ff5c00] uppercase tracking-widest transition-colors">ROOT</Link>
            <span className="text-black/20 text-[9px]">/</span>
            <Link to="/categories" className="text-[9px] font-black text-black/30 hover:text-[#ff5c00] uppercase tracking-widest transition-colors">CATALOG</Link>
            <span className="text-black/20 text-[9px]">/</span>
            <span className="text-[9px] font-black text-[#ff5c00] uppercase tracking-widest">{category.name}</span>
        </nav>

        {/* Category Banner - Command Module */}
        <section className="relative mb-16">
            <div className="bg-white border border-black/10 p-1 relative overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,0.03)]">
                <div className="corner-decal decal-tl !border-black/20"></div>
                <div className="corner-decal decal-tr !border-black/20"></div>
                
                <div className="relative h-64 md:h-96 w-full bg-black overflow-hidden group border border-black/5">
                    {category.image ? (
                        <img
                            src={getOptimizedImage(category.image, 1400)}
                            alt={category.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FaBoxes className="text-8xl text-white/5" />
                        </div>
                    )}
                    
                    {/* Data Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black to-transparent">
                        <div className="space-y-4">
                            <span className="text-[#ff5c00] text-[10px] font-black tracking-[0.5em] uppercase block animate-pulse">
                                AUTHENTICATED_SECTOR::ACTIVE
                            </span>
                            <h1 className="text-4xl md:text-7xl font-heading font-black text-white uppercase leading-none">
                                {category.name}
                            </h1>
                            {category.description && (
                                <p className="text-[10px] md:text-xs text-white/60 font-black uppercase tracking-widest max-w-2xl leading-relaxed">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tech Accents */}
                    <div className="absolute top-8 right-8 text-right hidden md:block">
                        <div className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-2 font-mono">
                            REF: {category._id?.toString().slice(-12).toUpperCase()}
                        </div>
                        <div className="w-32 h-[1px] bg-white/20 ml-auto"></div>
                    </div>
                </div>
            </div>
        </section>

        {/* Contextual Ads - Themed within Component */}
        <div className="mb-16 border-t-2 border-dashed border-black/10 pt-16">
            <PublicAds category={category.name} />
        </div>

        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">SUB_NODES</h2>
            <div className="flex-1 h-[2px] bg-black/10"></div>
        </div>

        {/* Subcategories Grid - Data Nodes (Matching Trending Style) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {category.subcategories && category.subcategories.length > 0 ? (
            category.subcategories.map((sub, index) => (
              <motion.article 
                key={sub._id || index} 
                className="group"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/category/${categoryName}/${sub.name.toLowerCase()}`}
                  className="block bg-white border border-black/10 group-hover:border-black p-3 relative overflow-hidden transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.01)] group-hover:shadow-[10px_10px_0px_rgba(255,92,0,0.06)]"
                >
                  <div className="corner-decal decal-tl !border-black/10 group-hover:!border-black !w-2 !h-2"></div>
                  
                  {/* Image Container */}
                  <div className="aspect-square bg-black/5 border border-black/5 mb-4 overflow-hidden relative">
                    {sub.image ? (
                        <img
                            src={getOptimizedImage(sub.image, 500)}
                            alt={sub.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            {...lazyImageProps}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FaBoxes className="text-3xl text-black/5" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[7px] font-black text-[#ff5c00] uppercase tracking-widest">UNIT_{index + 1}</span>
                    <h3 className="text-[10px] font-black uppercase text-black leading-tight line-clamp-1 group-hover:text-[#ff5c00] transition-colors">{sub.name}</h3>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">ACCESS</span>
                      <div className="w-6 h-6 bg-black text-white flex items-center justify-center group-hover:bg-[#ff5c00] transition-colors">
                        <FaChevronRight size={8} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-black/10">
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">NO_SUB_NODES_FOUND</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
