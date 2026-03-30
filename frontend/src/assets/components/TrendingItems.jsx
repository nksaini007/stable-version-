import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaHeart, FaShoppingCart, FaFire } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import fallbackItems from "../json/Itom.json";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import API from "../api/api";

const TrendingItems = ({ title = "what are you looking for?\t deals are here", autoplay = true }) => {
  const nav = useNavigate();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending items from config API, fallback to JSON
  useEffect(() => {
    const fetchTrending = async () => {
      const cardColors = ["#FFB38E", "#E5E7EB", "#DCD6F7", "#F8B195", "#A8E6CF", "#DCEDC1"];
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
    <section className="pt-0 pb-16 bg-gray-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight capitalize leading-none">
              {title.split('\t')[0]}
            </h2>
            <p className="text-gray-400 font-medium text-sm tracking-wide uppercase">
              {title.split('\t')[1] || "Curated for you"}
            </p>
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
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 px-2"
        >
          {items.map((it, i) => {
            const active = i === index;
            return (
              <article
                key={it.id || i}
                data-idx={i}
                onClick={() => nav(`/product/${it.id || i}`)}
                className={`snap-center flex-shrink-0 w-[85%] sm:w-[50%] md:w-[35%] lg:w-[28%] cursor-pointer transition-all duration-500 ease-out ${active ? "scale-105" : "scale-[0.92] opacity-90 grayscale-[0.3]"
                  }`}
              >
                <div className="group rounded-[2.5rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.09)] border border-gray-50 flex flex-col h-full transform hover:-translate-y-2 transition-all">
                  {/* Image Background Section */}
                  <div
                    className="m-3 rounded-[1.8rem] h-64 flex items-center justify-center p-8 relative overflow-hidden transition-colors duration-500"
                    style={{ backgroundColor: it.bgColor || '#304877ff' }}
                  >
                    <img
                      src={getOptimizedImage(it.image, 600)}
                      alt={it.name}
                      {...lazyImageProps}
                      className="w-full h-full object-contain  transform transition-transform duration-700 group-hover:scale-170 filter brightness-[1.02] contrast-[1.02]"
                    />
                    {it.tag && (
                      <span className="absolute left-5 top-5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl">
                        {it.tag}
                      </span>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 pt-2 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1 tracking-tight">
                      {it.name}
                    </h3>
                    <div className="flex flex-col gap-0.5 mb-6">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        {it.description?.toString().slice(-7).toUpperCase() || '1254654'}
                      </p>

                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-400 text-sm font-bold">₹</span>
                        <span className="text-2xl font-black text-gray-900 leading-none">
                          {it.price}
                        </span>
                      </div>
                      <div className="p-2.5 bg-gray-50 text-gray-300 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                        </svg>
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
