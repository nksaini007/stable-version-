import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { FaBoxes, FaSearch, FaChevronRight } from "react-icons/fa";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import Nev from "./Nev";
import Footer from "./Footer";

/* ------------------- Industrial Skeleton ------------------- */
const SkeletonCards = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white border border-black/5 p-3 animate-pulse">
        <div className="aspect-square bg-black/5" />
        <div className="mt-3 h-2 w-2/3 bg-black/5" />
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

      {/* ---------------- Industrial Header (Compact) ---------------- */}
      <div className="max-w-[1600px] mx-auto pt-24 pb-10 px-6 md:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-6 gap-4">
          <div className="space-y-1">

            <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight leading-none uppercase">
              BROWSE<span className="text-black/10">SECTORS</span>
            </h1>
          </div>
          <div className="hidden md:block">
            <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">NODES_FOUND: {categories.length} //_V4.1</p>
          </div>
        </div>
      </div>

      {/* ---------------- Main Content ---------------- */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ---------------- Sidebar: Operations Modules ---------------- */}
          <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            {/* Search Module */}
            <div className="bg-white border border-black/10 p-5 relative">
              <div className="absolute -top-2.5 left-4 bg-black text-white text-[7px] font-black px-2 py-0.5 tracking-widest uppercase">CAT_SEARCH</div>
              <div className="relative mt-2">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20 text-[10px]" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="FILTER_NODES..."
                  className="w-full pl-9 pr-4 py-2 text-[9px] font-black bg-black/5 border border-black/5 focus:border-black outline-none transition-all uppercase placeholder:text-black/20"
                />
              </div>
            </div>

            {/* Popular Sectors Module */}
            <div className="bg-white border border-black/10 p-5 relative">
              <div className="absolute -top-2.5 left-4 bg-black text-white text-[7px] font-black px-2 py-0.5 tracking-widest uppercase">POPULAR_FLUX</div>
              <div className="space-y-1.5 mt-2">
                {popular.map((cat, i) => (
                  <Link
                    key={cat._id || i}
                    to={`/category/${encodeURIComponent(cat.name)}`}
                    className="flex items-center justify-between px-2 py-1.5 border border-transparent hover:border-black/10 hover:bg-black/5 transition-all group"
                  >
                    <span className="text-[8px] font-black uppercase text-black/40 group-hover:text-black">
                      {cat.name}
                    </span>
                    <span className="text-[7px] font-black text-black/20 group-hover:text-[#ff5c00]">
                      {cat.subcategories?.length || 0}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ---------------- Grid: Compact Data Packets ---------------- */}
          <main className="lg:col-span-9 order-1 lg:order-2">
            {loading ? (
              <SkeletonCards />
            ) : filtered.length === 0 ? (
              <div className="py-32 text-center border border-black/10 bg-white/50">
                <FaBoxes className="text-4xl text-black/10 mx-auto mb-4 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20">BUFFER_EMPTY</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map((category, idx) => {
                  const subs = category.subcategories || [];
                  const imageUrl = getOptimizedImage(category.image, 400);
                  const overflow = subs.length - 2;

                  return (
                    <article key={category._id || idx} className="group">
                      <Link
                        to={`/category/${encodeURIComponent(category.name)}`}
                        className="block bg-white border border-black/10 group-hover:border-black p-3 relative overflow-hidden transition-all shadow-[5px_5px_0px_rgba(0,0,0,0.02)] group-hover:shadow-[8px_8px_0px_rgba(0,0,0,0.05)]"
                      >
                        <div className="corner-decal decal-tl !border-black/20 group-hover:!border-black !w-2 !h-2"></div>
                        <div className="absolute top-1 right-1.5 text-[6px] font-black opacity-10 uppercase tracking-widest">CAT_IDX_{idx + 1}</div>

                        {/* Image: Aspect Square Style like Trending */}
                        <div className="relative aspect-square bg-black/5 border border-black/5 mb-3 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={category.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              {...lazyImageProps}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <FaBoxes className="text-2xl text-black/5" />
                            </div>
                          )}
                        </div>

                        {/* Content: Minimal Technical Meta */}
                        <div className="space-y-1">
                          <span className="text-[7px] font-black text-[#ff5c00] uppercase tracking-widest">SECTOR_{idx + 1}</span>
                          <h3 className="text-[10px] font-black uppercase text-black leading-tight line-clamp-1 group-hover:text-[#ff5c00] transition-colors">
                            {category.name}
                          </h3>

                          <div className="flex flex-wrap gap-1 pt-2">
                            {subs.slice(0, 2).map((sub, i) => (
                              <span key={i} className="text-[6px] font-black bg-black/5 text-black/40 px-1 py-0.5 uppercase tracking-tighter">
                                {sub.name?.slice(0, 10)}
                              </span>
                            ))}
                            {overflow > 0 && (
                              <span className="text-[6px] font-black text-black/20 uppercase pt-0.5">
                                +{overflow}_LOGS
                              </span>
                            )}
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
