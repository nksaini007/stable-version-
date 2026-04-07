import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { FaBoxes, FaSearch, FaChevronRight } from "react-icons/fa";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import Nev from "./Nev";
import Footer from "./Footer";

/* ------------------- Industrial Skeleton ------------------- */
const SkeletonCards = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white border-2 border-black/5 p-4 animate-pulse relative"
      >
        <div className="w-full h-40 bg-black/5" />
        <div className="mt-4 h-3 w-2/3 bg-black/5" />
        <div className="mt-2 h-2 w-1/2 bg-black/5" />
      </div>
    ))}
  </div>
);

/* -------------------- Component -------------------- */
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get(`/categories`);
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  /* -------------------- Search -------------------- */
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return categories;
    return categories.filter((c) =>
      c.name?.toLowerCase().includes(t)
    );
  }, [categories, term]);

  /* -------------------- Popular -------------------- */
  const popular = useMemo(() => {
    return [...categories]
      .sort(
        (a, b) =>
          (b.subcategories?.length || 0) -
          (a.subcategories?.length || 0)
      )
      .slice(0, 6);
  }, [categories]);

  return (
    <div className="min-h-screen bg-[#e5e5e5] font-mono selection:bg-[#ff5c00] selection:text-black tech-grid relative">
      <Nev />
      <div className="scanline"></div>

      {/* ---------------- Industrial Header ---------------- */}
      <div className="max-w-[2000px] mx-auto pt-32 pb-16 px-6 md:px-12 relative z-10">
        <div className="flex flex-col">
            <span className="text-[#ff5c00] font-black text-[10px] tracking-[0.5em] mb-4 uppercase select-none">//_CATALOG_SYNC_V4.0_READY</span>
            <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tight leading-none uppercase">
                BROWSE<span className="text-black/10">_CATALOG</span>
            </h1>
            <p className="text-[10px] font-black opacity-30 mt-4 uppercase tracking-[0.2em]">
                ACTIVE_SECTORS: {categories.length} //_X_TOTAL_ENTRY_POINTS
            </p>
        </div>
      </div>

      {/* ---------------- Main Content ---------------- */}
      <div className="max-w-[2000px] mx-auto px-6 md:px-12 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ---------------- Sidebar: Operations Modules ---------------- */}
          <aside className="lg:col-span-3 space-y-8 order-2 lg:order-1">
            {/* Search Module */}
            <div className="bg-white border-2 border-black p-6 relative">
              <div className="absolute -top-3 left-4 bg-[#ff5c00] text-black text-[8px] font-black px-2 py-0.5 tracking-widest uppercase border border-black shadow-[2px_2px_0px_#000]">MODULE_SEARCH</div>
              <div className="relative mt-2">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20 text-xs" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="INIT_SEARCH..."
                  className="w-full pl-10 pr-4 py-3 text-[10px] font-black bg-black/5 border-2 border-black/5 focus:border-black outline-none transition-all uppercase placeholder:text-black/20"
                />
              </div>
            </div>

            {/* Popular Sectors Module */}
            <div className="bg-white border-2 border-black p-6 relative">
              <div className="absolute -top-3 left-4 bg-black text-white text-[8px] font-black px-2 py-0.5 tracking-widest uppercase border border-black shadow-[2px_2px_0px_#ff5c00]">HIGH_FREQ_SECTORS</div>
              <div className="space-y-2 mt-4">
                {popular.map((cat, i) => (
                  <Link
                    key={cat._id || i}
                    to={`/category/${encodeURIComponent(cat.name)}`}
                    className="flex items-center justify-between px-3 py-2 border border-black/5 hover:border-[#ff5c00] hover:bg-[#ff5c00]/5 transition-all group"
                  >
                    <span className="text-[9px] font-black uppercase text-black/60 group-hover:text-black">
                      {cat.name}
                    </span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 bg-black/5 group-hover:bg-black group-hover:text-[#ff5c00] transition-colors">
                      {cat.subcategories?.length || 0}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Technical Spec Sheet Accents */}
            <div className="p-6 border-2 border-black/5 opacity-40 hidden lg:block">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-black/10 pb-1">
                    <div className="w-1/2 h-1 bg-black/20"></div>
                    <div className="w-4 h-1 bg-[#ff5c00]"></div>
                  </div>
                ))}
                <p className="text-[7px] text-black font-black uppercase leading-[1.5]">CONFIDENTIAL::STINCHAR_INTEL_SYSTEM. ALL_NODES_ENCRYPTED_V3.0</p>
              </div>
            </div>
          </aside>

          {/* ---------------- Grid: Data Packets ---------------- */}
          <main className="lg:col-span-9 order-1 lg:order-2">
            {loading ? (
              <SkeletonCards />
            ) : filtered.length === 0 ? (
              <div className="py-40 text-center border-2 border-black/5 bg-white/50 backdrop-blur-md">
                <FaBoxes className="text-5xl text-black/10 mx-auto mb-6 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">NO_CATEGORY_DETECTED_IN_SECTOR</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filtered.map((category, idx) => {
                  const subs = category.subcategories || [];
                  const imageUrl = getOptimizedImage(category.image, 500);
                  const overflow = subs.length - 4;

                  return (
                    <article key={category._id || idx} className="group">
                      <Link
                        to={`/category/${encodeURIComponent(category.name)}`}
                        className="block bg-white border-2 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.05)] hover:shadow-[10px_10px_0px_rgba(255,92,0,0.1)] transition-all relative overflow-hidden"
                      >
                        <div className="corner-decal decal-tl !border-black !w-2 !h-2"></div>
                        <div className="absolute top-1 right-2 text-[6px] font-black opacity-10 uppercase tracking-widest">CAT_NODE_0{idx+1}</div>
                        
                        {/* Image Section */}
                        <div className="relative h-48 bg-black/5 border-b-2 border-black overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={category.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              {...lazyImageProps}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <FaBoxes className="text-4xl text-black/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                          
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-black text-[#ff5c00] text-[8px] font-black px-2 py-1 tracking-widest uppercase border border-white/20">
                              {category.name}
                            </span>
                          </div>
                        </div>

                        {/* Content: Technical Metadata */}
                        <div className="p-4 bg-white space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            {subs.slice(0, 4).map((sub, i) => (
                              <span
                                key={sub._id || i}
                                className="text-[7px] font-black bg-black/5 text-black/60 px-1.5 py-0.5 border border-black/5 uppercase tracking-tighter"
                              >
                                {sub.name}
                              </span>
                            ))}
                            {overflow > 0 && (
                              <span className="text-[7px] font-black text-[#ff5c00] px-1.5 py-0.5 uppercase tracking-tighter">
                                +{overflow}_LOGS
                              </span>
                            )}
                          </div>
                          <div className="pt-2 border-t border-black/5 flex justify-between items-center group-hover:text-[#ff5c00] transition-colors">
                             <span className="text-[7px] font-black text-black/20 tracking-wider uppercase">INIT_ENTRY_POINT</span>
                             <FaChevronRight size={8} />
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Categories;
