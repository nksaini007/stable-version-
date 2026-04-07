import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import fallbackItems from "../json/Itom.json";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import API from "../api/api";

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
          const mapped = trending.map((p, idx) => ({
            id: p._id,
            name: p.name,
            price: p.price,
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
          }));
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
    <section className="py-20 md:py-28 bg-[#e5e5e5] overflow-hidden border-t-8 border-black">
      <div className="mx-auto max-w-[1600px] px-8">
        
        {/* Sleek Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b-2 border-black/10 pb-10 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5c00]">
              <div className="w-16 h-[2px] bg-[#ff5c00]"></div>
              DATA_CATALOG_SCAN_V2
            </div>
            <h2 className="text-5xl md:text-8xl font-heading text-black tracking-tighter leading-none">
              {title || "CATALOG_00"}
            </h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className="w-16 h-16 border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all bg-white"
            >
              <FaChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                setIndex((i) => Math.min(i + 1, items.length - 1))
              }
              className="w-16 h-16 border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all bg-white"
            >
              <FaChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Dense Carousel */}
        <div
          ref={listRef}
          className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar snap-x snap-mandatory py-6"
        >
          {items.map((it, i) => {
            const active = i === index;
            return (
              <article
                key={it.id || i}
                data-idx={i}
                onClick={() => nav(`/product/${it.id || i}`)}
                className={`snap-center flex-shrink-0 w-[85%] sm:w-[50%] md:w-[35%] lg:w-[22%] cursor-pointer transition-all duration-500 ease-out ${active ? "opacity-100 scale-100" : "opacity-40 scale-95 grayscale"
                  }`}
              >
                <div className="group relative bg-white border-2 border-black flex flex-col h-full shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#ff5c00] transition-all hover:-translate-y-2">
                  
                  {/* Subtle Tech Header */}
                  <div className="flex justify-between items-center px-4 py-2 border-b-2 border-black bg-black text-white text-[8px] font-mono tracking-widest uppercase">
                    <span>REF: {it.id?.toString().slice(-6).toUpperCase()}</span>
                    <span className="text-[#ff5c00] animate-pulse">●_LIVE</span>
                  </div>

                  {/* Image Section (Compact) */}
                  <div className="relative aspect-square overflow-hidden bg-white p-8 border-b-2 border-black/5">
                    <img
                      src={getOptimizedImage(it.image, 500)}
                      alt={it.name}
                      {...lazyImageProps}
                      className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-4 text-[24px] font-heading opacity-5 text-black">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                  </div>
 
                  {/* Modern Details Section */}
                  <div className="p-5 flex flex-col flex-grow bg-white">
                    <h3 className="text-xl font-black text-black mb-1 uppercase tracking-tighter line-clamp-1 group-hover:text-[#ff5c00] transition-colors">
                      {it.name}
                    </h3>
                    <p className="text-[9px] text-black/30 font-mono uppercase mb-6 tracking-widest line-clamp-1">
                      // DATA_STREAM: CATEGORY_{it.category?.toUpperCase() || "N/A"}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t-2 border-black/5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">NET_VALUE</span>
                        <span className="text-2xl font-heading text-black leading-none">
                          ₹{it.price}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-black text-white flex items-center justify-center group-hover:bg-[#ff5c00] group-hover:text-black transition-all">
                         <FaPlus size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Sleek Accents */}
                  <div className="h-1 bg-black w-full flex opacity-50">
                    {[...Array(12)].map((_, j) => (
                      <div key={j} className="h-full flex-1 border-r border-[#ff5c00]/20 last:border-r-0"></div>
                    ))}
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
