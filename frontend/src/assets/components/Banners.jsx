import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "";

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/config`);
                if (res.data?.banners) {
                    setBanners(res.data.banners);
                }
            } catch (error) {
                console.error("Failed to load banners", error);
            }
        };
        fetchBanners();
    }, []);

    // Autoplay
    useEffect(() => {
        if (banners.length === 0) return;
        const id = setInterval(() => {
            setIndex((idx) => (idx + 1) % banners.length);
        }, 5000);
        return () => clearInterval(id);
    }, [banners.length]);

    if (banners.length === 0) return null;

    return (
        <section className="py-8 bg-gray-50 flex justify-center w-full">
            <div className="relative w-full max-w-6xl px-4 md:px-8">
                <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-100 relative h-48 md:h-72 lg:h-[400px]">
                    {banners.map((banner, i) => (
                        <div
                            key={banner.id || i}
                            className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                                }`}
                        >
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || "Promotional Banner"}
                                className="w-full h-full object-cover"
                            />
                            {banner.title && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-16">
                                    <h3 className="text-white text-xl md:text-2xl font-bold tracking-wide">
                                        {banner.title}
                                    </h3>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => setIndex((index - 1 + banners.length) % banners.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={() => setIndex((index + 1) % banners.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm"
                    >
                        <FaChevronRight />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-2 bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banners;
