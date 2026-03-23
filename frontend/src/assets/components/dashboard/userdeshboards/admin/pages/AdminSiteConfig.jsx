import React, { useState, useEffect } from "react";
import { FaImage, FaSave, FaPlus, FaTrash, FaStar, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../../../../api/api";

const AdminSiteConfig = () => {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);

    // Banner State
    const [banners, setBanners] = useState([]);
    const [newBanner, setNewBanner] = useState({ imageUrl: "", title: "", link: "", isActive: true });

    // Trending Items State
    const [trendingItemIds, setTrendingItemIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await API.get(`/config/admin`);
            setConfig(data);
            setBanners(data.banners || []);
            setTrendingItemIds(data.trendingItems || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching config:", error);
            toast.error("Failed to load site configuration");
            setLoading(false);
        }
    };

    // --- BANNERS MANAGEMENT ---
    const handleAddBanner = (e) => {
        e.preventDefault();
        if (!newBanner.imageUrl) return toast.warning("Image URL is required");

        const newBannerItem = {
            ...newBanner,
            id: Date.now().toString(),
        };
        setBanners([...banners, newBannerItem]);
        setNewBanner({ imageUrl: "", title: "", link: "", isActive: true });
    };

    const handleRemoveBanner = (id) => {
        setBanners(banners.filter((b) => b.id !== id));
    };

    const handleSaveBanners = async () => {
        try {
            await API.put(`/config/banners`, { banners });
            toast.success("Banners updated successfully!");
        } catch (error) {
            toast.error("Failed to update banners");
        }
    };


    // --- TRENDING ITEMS MANAGEMENT ---
    const handleSearchProducts = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const { data } = await API.get(
                `/products/public?search=${searchQuery}&limit=10`
            );
            // Backend might return { products: [...] } or just an array depending on implementation
            const results = data.products || data;
            setSearchResults(results);
        } catch (error) {
            toast.error("Failed to search products");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddTrending = (product) => {
        if (trendingItemIds.includes(product._id)) {
            return toast.warning("Product is already in trending list");
        }
        setTrendingItemIds([...trendingItemIds, product._id]);
        toast.success(`${product.name} added to local trending list. Don't forget to save!`);
    };

    const handleRemoveTrending = (productId) => {
        setTrendingItemIds(trendingItemIds.filter((id) => id !== productId));
    };

    const handleSaveTrending = async () => {
        try {
            await API.put(`/config/trending`, { trendingItemIds });
            toast.success("Trending items updated successfully!");
        } catch (error) {
            toast.error("Failed to update trending items");
        }
    };

    if (loading) return <div className="p-8 text-center text-[#6B7280]">Loading Site Configuration...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Website Content Management</h1>
                <p className="text-[#6B7280] mt-2">Manage homepage banners, trending items, and site-wide content.</p>
            </div>

            {/* --- BANNER MANAGEMENT SECTION --- */}
            <section className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden ">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                            <FaImage className="text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Homepage Banners</h2>
                    </div>
                    <button
                        onClick={handleSaveBanners}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 text-white rounded-lg transition-colors font-medium "
                    >
                        <FaSave /> Save Banners
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Add New Banner Form */}
                    <form onSubmit={handleAddBanner} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#1A1B1E] border border-[#2A2B2F]/5 rounded-xl border border-white/10">
                        <div className="col-span-1 md:col-span-4 font-semibold text-gray-300 mb-2">Add New Banner</div>
                        <input
                            type="text"
                            placeholder="Image URL (e.g. https://.../image.jpg)"
                            className="px-4 py-2.5 bg-[#0f172a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white col-span-1 md:col-span-2"
                            value={newBanner.imageUrl}
                            onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Banner Title (Optional)"
                            className="px-4 py-2.5 bg-[#0f172a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white"
                            value={newBanner.title}
                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        />
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                            <FaPlus /> Add Banner
                        </button>
                    </form>

                    {/* Current Banners List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-300">Active Banners ({banners.length})</h3>
                        {banners.length === 0 ? (
                            <p className="text-[#8E929C] italic">No banners currently active.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {banners.map((banner, index) => (
                                    <div key={banner.id || index} className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0f172a]">
                                        <img src={banner.imageUrl} alt={banner.title || "Banner"} className="w-full h-32 object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleRemoveBanner(banner.id)}
                                                className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform "
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        {banner.title && <div className="p-3 text-sm font-medium text-gray-200">{banner.title}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* --- TRENDING ITEMS SECTION --- */}
            <section className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden ">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                            <FaStar className="text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Trending Items</h2>
                    </div>
                    <button
                        onClick={handleSaveTrending}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium "
                    >
                        <FaSave /> Save Trending List
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Search & Add */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-300">Search Products to Feature</h3>
                        <form onSubmit={handleSearchProducts} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                className="flex-1 px-4 py-2.5 bg-[#0f172a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-[#1f2937] hover:bg-[#374151] border border-white/10 rounded-lg text-white transition-colors"
                            >
                                <FaSearch />
                            </button>
                        </form>

                        {/* Search Results */}
                        <div className="bg-[#0f172a] border border-white/5 rounded-xl min-h-[300px] max-h-[400px] overflow-y-auto p-2">
                            {isSearching ? (
                                <div className="text-center p-8 text-[#8E929C]">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map(product => (
                                        <div key={product._id} className="flex items-center justify-between p-3 bg-[#1A1B1E] border border-[#2A2B2F]/5 hover:bg-[#1A1B1E] border border-[#2A2B2F]/10 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <img
                                                    src={product.images?.[0]?.url || product.image || "https://via.placeholder.com/50"}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded bg-[#1A1B1E] border border-[#2A2B2F]/10 shrink-0"
                                                />
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                                    <p className="text-xs text-[#8E929C]">₹{product.price}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddTrending(product)}
                                                disabled={trendingItemIds.includes(product._id)}
                                                className={`p-2 rounded-lg ml-2 shrink-0 ${trendingItemIds.includes(product._id) ? "text-[#8E929C] bg-[#1A1B1E] border border-[#2A2B2F]/5 cursor-not-allowed" : "text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"}`}
                                                title="Add to Trending"
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 text-[#8E929C] italic">No products found.</div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Currently Featured List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-300">Currently Featured ({trendingItemIds.length})</h3>
                            <p className="text-xs text-[#6B7280] italic">Raw IDs (Data populated on load)</p>
                        </div>

                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl min-h-[300px] max-h-[400px] overflow-y-auto p-4 space-y-3">
                            {trendingItemIds.length === 0 ? (
                                <div className="text-center p-8 text-[#8E929C]">No trending items selected.</div>
                            ) : (
                                trendingItemIds.map(id => (
                                    <div key={id} className="flex flex-col gap-1 p-3 bg-[#111827] border border-white/10 rounded-lg group">
                                        <div className="flex justify-between items-center">
                                            <code className="text-xs text-orange-300 font-mono tracking-wider">{id}</code>
                                            <button
                                                onClick={() => handleRemoveTrending(id)}
                                                className="text-[#8E929C] hover:text-red-400 transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        {/* Note: Ideally we map the full product details here if we fetched populated admin config instead of raw array ids */}
                                        <span className="text-[10px] text-[#8E929C] uppercase tracking-widest mt-1">Pending Sync...</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
};

export default AdminSiteConfig;
