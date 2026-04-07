import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import fallbackItems from "../json/Itom.json";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import API from "../api/api";
import { getProductPricing } from "../utils/priceUtils";

const TrendingItems = ({ title = "", autoplay = true }) => {
  const nav = useNavigate();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending items from config API, fallback to JSON
  useEffect(() => {
    const fetchTrending = async () => {
      const cardColors = ["#161618", "#1c1c1f", "#121214", "#1a1a1c", "#0f0f10", "#18181b"];
      try {
        const res = await API.get(`/config`);
        const trending = res.data?.trendingItems || [];
        if (trending.length > 0) {
          const mapped = trending.map((p, idx) => {
            const pricing = getProductPricing(p);
            return {
              id: p._id,
              name: p.name,
              price: pricing.sellingPrice,
              mrp: pricing.mrp,
              discountPct: pricing.discountPct,
              hasDiscount: pricing.hasDiscount,
              image:
                p.images?.[0]?.url ||
                p.images?.[0] ||
                p.image ||
                "https://via.placeholder.com/300x200?text=Product",
              tag: "Trending",
              category: p.category,
              description: p.description,
              stock: p.countInStock || 200,
              bgColor: cardColors[idx % cardColors.length],
            };
          });
          setItems(mapped);
        } else {
          const fallbackWithColors = fallbackItems.map((item, idx) => ({
            ...item,
            bgColor: cardColors[idx % cardColors.length],
            stock: 200,
          }));
          setItems(fallbackWithColors);
        }
      } catch (err) {
        console.error("Trending fetch failed, using local fallback", err);
        const fallbackWithColors = fallbackItems.map((item, idx) => ({
          ...item,
          bgColor: cardColors[idx % cardColors.length],
          stock: 200,
        }));
        setItems(fallbackWithColors);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || items.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4500);
    return () => clearInterval(id);
  }, [autoplay, items.length]);

  // Scroll active card into view
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const active = el.querySelector(`[data-idx="${index}"]`);
    if (active) {
      const offset =
        active.offsetLeft - (el.clientWidth - active.clientWidth) / 2;
      el.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [index]);

  if (loading) {
    return (
      <section className="py-20 bg-[#e5e5e5]">
        <div className="mx-auto max-w-[1600px] px-8">
          <div className="animate-pulse space-y-12">
            <div className="h-2 w-32 bg-black/10"></div>
            <div className="h-24 w-1/2 bg-black/10"></div>
            <div className="grid grid-cols-4 gap-8">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="aspect-square bg-white border-2 border-black/5"></div>
               ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-10 md:py-16 bg-[#e5e5e5] overflow-hidden border-t-2 border-black/5">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        
        {/* Compact Industrial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-black/10 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.4em] text-[#ff5c00]">
              <div className="w-8 h-[1px] bg-[#ff5c00]"></div>
              DATA_CATALOG_SCAN_00{Math.floor(Math.random()*9)}
            </div>
            <h2 className="text-3xl md:text-4xl font-heading text-black tracking-tighter leading-none uppercase">
              {title || "TRENDING_BLOCK"}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className="w-10 h-10 border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all bg-white"
            >
              <FaChevronLeft size={12} />
            </button>
            <button
              onClick={() =>
                setIndex((i) => Math.min(i + 1, items.length - 1))
              }
              className="w-10 h-10 border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all bg-white"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Compact Dense Carousel */}
        <div
          ref={listRef}
          className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4"
        >
          {items.map((it, i) => {
            const active = i === index;
            return (
              <article
                key={it.id || i}
                data-idx={i}
                onClick={() => nav(`/product/${it.id || i}`)}
                className={`snap-center flex-shrink-0 w-[65%] sm:w-[40%] md:w-[25%] lg:w-[15%] cursor-pointer transition-all duration-500 ease-out relative group ${active ? "opacity-100 scale-100" : "opacity-40 scale-95"
                  }`}
              >
                <div className="bg-white border border-black/10 group-hover:border-black p-4 relative overflow-hidden flex flex-col h-full shadow-[5px_5px_0px_rgba(0,0,0,0.02)] group-hover:shadow-[8px_8px_0px_rgba(0,0,0,0.05)] transition-all">
                  <div className="corner-decal decal-tl border-black/20 group-hover:border-black !w-2 !h-2"></div>
                  <div className="absolute top-1 right-1 text-[6px] font-black opacity-10 uppercase tracking-widest leading-none">TRD_NODE_{i+1}</div>
                  
                  {/* Image Container - Colored & Compact */}
                  <div className="aspect-square bg-black/5 border border-black/5 mb-4 overflow-hidden relative">
                    <img
                      src={getOptimizedImage(it.image)}
                      alt={it.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      {...lazyImageProps}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[7px] font-black text-[#ff5c00] uppercase tracking-widest">{it.tag?.slice(0,12) || "COMMERCE"}</span>
                    <h3 className="text-[10px] font-black uppercase text-black leading-tight line-clamp-1 group-hover:text-[#ff5c00] transition-colors">{it.name}</h3>
                    <div className="flex flex-col pt-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black text-black">₹{it.price.toLocaleString()}</span>
                          {it.hasDiscount && (
                            <span className="text-[7px] font-black text-[#ff5c00]">{it.discountPct}% OFF</span>
                          )}
                       </div>
                       {it.hasDiscount && (
                         <div className="text-[7px] text-black/20 line-through font-bold">MRP ₹{it.mrp.toLocaleString()}</div>
                       )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingItems;
