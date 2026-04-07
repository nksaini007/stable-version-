import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaPlus, FaHeart, FaShoppingCart, FaFire } from "react-icons/fa";
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
          // Map backend product data to our card format
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

  // Autoplay
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
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 text-center text-gray-400">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4 mx-auto"></div>
            <div className="h-64 bg-gray-50 rounded-3xl w-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="pt-24 pb-24 bg-[#0a0a0b] overflow-hidden">
      <div className="mx-auto max-w-8xl px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-heading text-white tracking-tight">
              {title || "Trending Collections"}
            </h2>
            <div className="w-20 h-1 bg-white/20 rounded-full"></div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className="p-3 rounded-full border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={() =>
                setIndex((i) => Math.min(i + 1, items.length - 1))
              }
              className="p-3 rounded-full border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={listRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-22"
        >
          {items.map((it, i) => {
            const active = i === index;
            return (
              <article
                key={it.id || i}
                data-idx={i}
                onClick={() => nav(`/product/${it.id || i}`)}
                className={`snap-center flex-shrink-0 w-[85%] sm:w-[50%] md:w-[35%] lg:w-[18%] cursor-pointer transition-all duration-500 ease-out ${active ? "scale-105" : "scale-[0.92] opacity-90 grayscale-[0.3]"
                  }`}
              >
                <div className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-lime-400/50 transition-all duration-300 flex flex-col h-full rounded-none">
                  {/* Image Background Section */}
                  <div className="relative aspect-square overflow-hidden bg-[#0d0d11]">
                    <img
                      src={getOptimizedImage(it.image, 600)}
                      alt={it.name}
                      {...lazyImageProps}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                    />
                    
                    {/* Scanner line overlay */}
                    <div className="absolute inset-0 bg-lime-400/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-lime-400/50 animate-pulse"></div>
                    </div>

                    {it.tag && (
                      <span className="absolute left-0 top-0 bg-lime-400 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                        {it.tag}
                      </span>
                    )}
                  </div>
 
                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold text-white mb-2 tracking-widest text-white/90 group-hover:text-lime-400 transition-colors uppercase">
                      {it.name}
                    </h3>
                    <div className="flex flex-col gap-1 mb-6">
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">
                        REF_ID: {it.id?.toString().slice(-8).toUpperCase()}
                      </p>
                    </div>
 
                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lime-400 text-sm font-bold">₹</span>
                        <span className="text-2xl font-heading text-white leading-none">
                          {it.price}
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 text-white/20 group-hover:bg-lime-400 group-hover:text-black transition-all">
                         <FaPlus size={12} />
                      </div>
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
