import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaHeart, FaShoppingCart, FaFire } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import fallbackItems from "../json/Itom.json";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
const API_BASE = import.meta.env.VITE_API_URL || "";

const TrendingItems = ({ title = "what are you looking for?\t deals are here", autoplay = true }) => {
  const nav = useNavigate();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending items from config API, fallback to JSON
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/config`);
        const trending = res.data?.trendingItems || [];
        if (trending.length > 0) {
          // Map backend product data to our card format
          const mapped = trending.map((p) => ({
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
          }));
          setItems(mapped);
        } else {
          setItems(fallbackItems);
        }
      } catch (err) {
        console.error("Trending fetch failed, using local fallback", err);
        setItems(fallbackItems);
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
    }, 3500);
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
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-6xl px-4 text-center text-gray-400">
          Loading trending items...
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* <div className="p-2 bg-gray-100 rounded-xl">
              <FaFire className="text-gray-500 text-lg" />
            </div> */}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 font-semibold px-3 py-1 rounded-full">
              {items.length} items
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
            <button
              onClick={() =>
                setIndex((i) => Math.min(i + 1, items.length - 1))
              }
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={listRef}
          className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-3"
        >
          {items.map((it, i) => {
            const active = i === index;
            return (
              <article
                key={it.id || i}
                data-idx={i}
                className={`snap-center flex-shrink-0 w-[70%] sm:w-[42%] md:w-[30%] lg:w-[24%] transition-all duration-300 ${active ? "scale-[1.03]" : "scale-[0.97] opacity-70"
                  }`}
              >
                <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="relative h-44 bg-gray-100">
                    <img
                      src={getOptimizedImage(it.image, 500)}
                      alt={it.name}
                      {...lazyImageProps}
                      className="w-full h-full object-cover"
                    />
                    {it.tag && (
                      <span className="absolute left-3 top-3 bg-gradient-to-r from-gray-500 to-gray-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        {it.tag}
                      </span>
                    )}
                    <div className="absolute right-3 bottom-3 bg-white/95 backdrop-blur-sm text-sm font-bold text-gray-900 px-3 py-1 rounded-lg shadow">
                      ₹{it.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-3">
                      {it.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => nav(`/product/${it.id || i}`)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-500 to-gray-500 text-white hover:from-gray-600 hover:to-gray-600 transition-all shadow-sm"
                      >
                        View Details
                      </button>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-50 hover:text-gray-500 transition-colors">
                          <FaShoppingCart size={13} />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-50 hover:text-gray-500 transition-colors">
                          <FaHeart size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Indicators */}
        <div className="mt-5 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-gray-500" : "w-2 bg-gray-300"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingItems;
