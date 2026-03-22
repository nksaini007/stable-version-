import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import API from "../api/api";

const PublicAds = ({ category }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAds();
    }, []);

    // Auto-slide every 5 seconds
    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [ads.length]);

    const fetchAds = async () => {
        try {
            const url = category
                ? `/ads/public?category=${encodeURIComponent(category)}`
                : `/ads/public`;
            const { data } = await API.get(url);
            setAds(data);
        } catch (err) {
            console.error("Failed to fetch public ads", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdClick = async (ad) => {
        // Fire & forget click tracking
        API.post(`/ads/click/${ad._id}`).catch((e) => console.error(e));

        // Navigate to target if defined
        if (ad.targetProduct) {
            const productId = typeof ad.targetProduct === "object" ? ad.targetProduct._id : ad.targetProduct;
            navigate(`/product/${productId}`);
        } else if (ad.targetCategory) {
            navigate(`/category/${encodeURIComponent(ad.targetCategory)}`);
        }
    };

    const nextAd = () => {
        setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
    };

    const prevAd = () => {
        setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
    };

    if (loading) {
        return (
            <div className="w-full h-40 bg-gray-100 animate-pulse flex items-center justify-center rounded-xl my-6">
                <span className="text-gray-400 font-medium">Loading Promotions...</span>
            </div>
        );
    }

    if (ads.length === 0) return null; // Don't show anything if no active ads

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 mt-2">
            <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-2xl shadow-sm group cursor-pointer 
                      border border-gray-200 hover:shadow-md transition-all duration-300">

                {/* Ad Images */}
                <div
                    className="w-full h-full flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {ads.map((ad, index) => (
                        <div
                            key={ad._id}
                            className="w-full h-full flex-shrink-0 relative"
                            onClick={() => handleAdClick(ad)}
                        >
                            <img
                                src={getOptimizedImage(ad.bannerImage, 1000)}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                {...lazyImageProps}
                                onError={(e) => { e.target.src = "https://via.placeholder.com/1200x400?text=Promotion"; }}
                            />
                            {/* Optional Overlay Title (Can be removed if images have text) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                <div className="p-6">
                                    <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-sm uppercase tracking-wide mb-2 inline-block">
                                        Sponsored
                                    </span>
                                    <h3 className="text-white text-xl md:text-2xl font-bold">{ad.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {ads.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevAd(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/50 transition-all z-10"
                        >
                            <FaChevronLeft className="mr-1" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextAd(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/50 transition-all z-10"
                        >
                            <FaChevronRight className="ml-1" />
                        </button>
                    </>
                )}

                {/* Dots */}
                {ads.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {ads.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicAds;
