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
    <section className="py-24 bg-[#e5e5e5] overflow-hidden border-t-4 border-black">
      <div className="mx-auto max-w-8xl px-6">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-12 border-b-4 border-black pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff5c00]">
              <div className="w-12 h-[2px] bg-[#ff5c00]"></div>
              SYSTEM_TRENDING_LOG
            </div>
            <h2 className="text-6xl md:text-8xl font-heading text-black tracking-tight leading-none">
              {title || "CATALOG.00"}
            </h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className="p-6 border-4 border-black text-black hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.1)]"
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              onClick={() =>
                setIndex((i) => Math.min(i + 1, items.length - 1))
              }
              className="p-6 border-4 border-black text-black hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.1)]"
            >
              <FaChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={listRef}
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory py-12"
        >
          {items.map((it, i) => {
            const active = i === index;
            return (
              <article
                key={it.id || i}
                data-idx={i}
                onClick={() => nav(`/product/${it.id || i}`)}
                className={`snap-center flex-shrink-0 w-[90%] sm:w-[60%] md:w-[45%] lg:w-[28%] cursor-pointer transition-all duration-700 ease-in-out ${active ? "opacity-100 scale-100" : "opacity-30 scale-95 grayscale"
                  }`}
              >
                <div className="group relative bg-white border-4 border-black flex flex-col h-full shadow-[12px_12px_0px_#000] hover:shadow-[18px_18px_0px_#ff5c00] transition-all">
                  
                  {/* Serial Header */}
                  <div className="flex justify-between items-center p-3 border-b-4 border-black bg-black text-white text-[10px] font-black tracking-widest uppercase">
                    <span>ITEM_ID: {it.id?.toString().slice(-8).toUpperCase()}</span>
                    <span className="text-[#ff5c00]">ACTIVE</span>
                  </div>

                  {/* Image Section */}
                  <div className="relative aspect-square overflow-hidden bg-white p-12">
                    <img
                      src={getOptimizedImage(it.image, 600)}
                      alt={it.name}
                      {...lazyImageProps}
                      className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 text-[40px] font-heading opacity-10 text-black">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                  </div>
 
                  {/* Details Section */}
                  <div className="p-8 border-t-4 border-black flex flex-col flex-grow bg-white">
                    <h3 className="text-2xl font-black text-black mb-4 tracking-tighter uppercase leading-none">
                      {it.name}
                    </h3>
                    
                    <div className="flex justify-between items-end mt-auto pt-6 border-t border-black/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black opacity-30 uppercase">PRICE_VALUE</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[#ff5c00] text-sm font-black">₹</span>
                          <span className="text-4xl font-heading text-black leading-none">
                            {it.price}
                          </span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-black text-[#ff5c00] flex items-center justify-center hover:bg-[#ff5c00] hover:text-black transition-colors">
                         <FaPlus size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Barcode Accent */}
                  <div className="h-6 bg-black flex gap-1 p-1">
                    {[...Array(30)].map((_, j) => (
                      <div key={j} className="h-full bg-white" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
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
