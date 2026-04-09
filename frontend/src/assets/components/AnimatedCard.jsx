import React, { useContext, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowRight, FaShieldAlt, FaTruck, FaWrench, FaPlus, FaCrosshairs } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import ArchitectHero from "./ArchitectHero";
import SellerHero from "./SellerHero";
import CustomerLanding from "./CustomerLanding";
import { getProductPricing } from "../utils/priceUtils";

const AnimatedCard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Auth and Routing
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const role = user?.role || "guest";
  const userName = user?.name || "Welcome";

  // Auto-scroll to results
  useEffect(() => {
    if (hasSearched && !loading && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hasSearched, loading]);

  // Dashboard User Configurations
  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          theme: "blue",
          title: "System Administration",
          subtitle: "Manage platform operations, users, and global settings.",
          icon: <FaShieldAlt className="text-black text-5xl mb-4" />,
          dashRoute: "/admin",
          accent: "bg-black text-white hover:bg-[#ff5c00]"
        };
      case 'delivery':
        return {
          theme: "amber",
          title: "Logistics Dashboard",
          subtitle: "View assigned routes, update deliveries, and manage fleet.",
          icon: <FaTruck className="text-black text-5xl mb-4" />,
          dashRoute: "/delivery",
          accent: "bg-black text-white hover:bg-[#ff5c00]"
        };
      case 'provider':
        return {
          theme: "purple",
          title: "Service Provider Hub",
          subtitle: "Manage your active service requests and professional bookings.",
          icon: <FaWrench className="text-black text-5xl mb-4" />,
          dashRoute: "/provider",
          accent: "bg-black text-white hover:bg-[#ff5c00]"
        };
      default:
        return null;
    }
  };

  const config = getRoleConfig();
  const isDashboardUser = role !== 'guest' && role !== 'customer';

  // Intersection Observer for Infinite Scroll
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const performGlobalSearch = async (query) => {
    setLoading(true);
    setError("");
    setHasSearched(true);
    setPage(1);
    try {
      let aggregated = [];
      let hasMoreProducts = false;

      // Fetch Products
      try {
        const prodRes = await API.get(`/products/public?search=${encodeURIComponent(query)}&page=1&limit=10`);
        const pData = (prodRes.data.products || []).map(p => ({ ...p, itemType: 'product' }));
        aggregated.push(...pData);
        hasMoreProducts = prodRes.data.hasMore || false;
      } catch (e) {
        console.error("Products error", e);
      }

      // Fetch Services
      try {
        const servRes = await API.get(`/services?search=${encodeURIComponent(query)}`);
        const sData = (servRes.data || []).map(s => ({ ...s, itemType: 'service' }));
        aggregated.push(...sData);
      } catch (e) {
        console.error("Services error", e);
      }

      // Fetch Construction Plans
      try {
        const planRes = await API.get(`/construction-plans?search=${encodeURIComponent(query)}`);
        const plData = (planRes.data.plans || []).map(pl => ({ ...pl, itemType: 'plan' }));
        aggregated.push(...plData);
      } catch (e) {
        console.error("Plans error", e);
      }

      // Shuffle results for dynamic grid logic
      aggregated.sort(() => 0.5 - Math.random());

      setResults(aggregated);
      setHasMore(hasMoreProducts);
    } catch (err) {
      console.error("Search Error:", err);
      setError("Unable to retrieve items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!(searchQuery || "").trim()) return;
    await performGlobalSearch(searchQuery);
  };

  const handleCategoryClick = async (categoryName) => {
    setSearchQuery(categoryName);
    await performGlobalSearch(categoryName);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await API.get(`/products/public?search=${encodeURIComponent(searchQuery)}&page=${nextPage}&limit=10`);
      const data = response.data;
      const newProducts = (data.products || []).map(p => ({ ...p, itemType: 'product' }));
      setResults(prev => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ----------------------------------------------------------------------
  // RENDER FOR DASHBOARD USERS (Admins, Sellers, Architects, etc.)
  // ----------------------------------------------------------------------
  if (role === 'architect') {
    return <ArchitectHero />;
  }

  if (role === 'seller') {
    return <SellerHero />;
  }

  if (isDashboardUser && config && role !== 'architect' && role !== 'seller') {
    return (
      <div className="min-h-screen bg-[#e5e5e5] flex flex-col items-center justify-center p-8 font-mono">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white border-4 border-black shadow-[20px_20px_0px_#000] overflow-hidden flex flex-col md:grid md:grid-cols-12"
        >
          <div className="md:col-span-4 p-12 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center justify-center text-center bg-black/5">
             {config.icon}
             <h2 className="text-2xl font-black mt-6 uppercase leading-tight">Hi, {userName.split(' ')[0]}</h2>
             <span className="mt-2 px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">{role}_ACCOUNT</span>
          </div>

          <div className="md:col-span-8 p-12 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-4 text-[#ff5c00]">
                <FaCrosshairs size={14} />
                <span className="text-[10px] font-black tracking-widest uppercase">INITIALIZE_SESSION</span>
             </div>
             <h3 className="text-4xl font-heading mb-4 text-black">{config.title}</h3>
             <p className="text-black/60 mb-8 leading-relaxed">// {config.subtitle}</p>
             <button
                onClick={() => navigate(config.dashRoute)}
                className="w-full sm:w-auto px-10 py-5 bg-black text-white font-black hover:bg-[#ff5c00] transition-colors flex items-center justify-center gap-4 group"
              >
                ACCESS_DASHBOARD
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER FOR CUSTOMERS & GUESTS
  // ----------------------------------------------------------------------
  return (
    <div className="flex flex-col font-mono">
      <CustomerLanding 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
      />

      {/* ✨ INDUSTRIAL CONTENT GRID SECTION ✨ */}
      {(hasSearched || loading || error) && (
        <div ref={resultsRef} className="flex-1 w-full bg-[#e5e5e5] text-black pb-32 border-t-8 border-black">
          <div className="max-w-[1600px] mx-auto w-full px-8 py-20 lg:py-32">

            {/* Status Handling */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-black/20 bg-white/50">
                <div className="w-20 h-20 border-8 border-black/10 border-t-[#ff5c00] animate-spin mb-8"></div>
                <p className="text-[12px] font-black tracking-[0.5em] uppercase">SYSTEM_FETCHING_QUERY_BATCH...</p>
              </div>
            )}

            {error && (
              <div className="max-w-2xl mx-auto bg-[#ff5c00] border-4 border-black text-black px-10 py-8 shadow-[15px_15px_0px_#000] text-center font-black uppercase tracking-widest">
                <span className="text-5xl block mb-4">⚠️</span>
                <span className="text-2xl">QUERY_ERROR_LOG:</span> <br/>
                <span className="text-sm mt-2 block opacity-80">{error}</span>
              </div>
            )}

            {!loading && !error && hasSearched && results.length === 0 && (
              <div className="text-center py-40 bg-white border-4 border-black shadow-[20px_20px_0px_#000] max-w-4xl mx-auto flex flex-col items-center">
                <div className="text-8xl mb-8 opacity-10 font-heading">NOT_FOUND</div>
                <h3 className="text-4xl font-heading text-black mb-4">ZERO_RESULTS_FETCHED</h3>
                <p className="text-black/50 font-mono text-sm max-w-md uppercase tracking-widest">// No matching assets found for tag "{searchQuery}". Recommended action: Expand parameters.</p>
              </div>
            )}

            {/* Results Grid (Industrial HUD Structure) */}
            <AnimatePresence>
              {!loading && results.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                  <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between border-b-8 border-black pb-12 gap-8">
                    <div className="space-y-6">
                       <div className="flex items-center gap-3 text-[12px] font-black uppercase text-[#ff5c00]">
                         <div className="w-16 h-[3px] bg-[#ff5c00]"></div>
                         DATA_STREAM_RESULTS
                       </div>
                       <h2 className="text-6xl md:text-9xl font-heading text-black tracking-tighter leading-none">
                         "{searchQuery}"
                       </h2>
                    </div>
                    <div className="flex flex-col items-start lg:items-end bg-black text-white p-6 min-w-[240px] shadow-[10px_10px_0px_#ff5c00]">
                       <span className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mb-2">SYSTEM_BATCH_COUNT</span>
                       <span className="text-4xl font-heading leading-tight">
                         00{results.length} UNITS
                       </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8">
                    {results.map((item, i) => {
                      const isLastElement = i === results.length - 1;
                      
                      let tag = "PRD";
                      let navPath = `/product/${item._id}`;
                      let itemName = item.name || item.title;
                      let itemPrice = item.price || 0;
                      let sellingPrice = itemPrice;
                      let hasDiscount = false;
                      let discountPct = 0;
                      
                      let imgUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500";
                      
                      if (item.itemType === 'product') {
                        imgUrl = item.images?.[0]?.url ? `${item.images[0].url}` : item.image || imgUrl;
                        const pricing = getProductPricing(item);
                        sellingPrice = pricing.sellingPrice;
                        hasDiscount = pricing.hasDiscount;
                        discountPct = pricing.discountPct;
                      } else if (item.itemType === 'service') {
                        tag = "SVC";
                        navPath = `/service/${item._id}`;
                        imgUrl = item.images?.[0] ? `${item.images[0]}` : imgUrl;
                      } else if (item.itemType === 'plan') {
                        tag = "PLN";
                        navPath = `/project-plans/${item._id}`;
                        imgUrl = item.images?.[0] ? `${item.images[0]}` : imgUrl;
                        itemPrice = item.estimatedCost || 0;
                        sellingPrice = itemPrice;
                      }

                      // Dynamic styling based on itemType
                      const borderColorMap = {
                        'product': 'hover:shadow-[15px_15px_0px_#ff5c00]',
                        'service': 'hover:shadow-[15px_15px_0px_#3b82f6]',
                        'plan':    'hover:shadow-[15px_15px_0px_#10b981]'
                      };
                      const textColorMap = {
                        'product': 'text-[#ff5c00]',
                        'service': 'text-blue-500',
                        'plan':    'text-emerald-500'
                      };
                      const hoverBgMap = {
                        'product': 'group-hover:bg-[#ff5c00]',
                        'service': 'group-hover:bg-blue-500',
                        'plan':    'group-hover:bg-emerald-500'
                      };
                      const hoverTextColorMap = {
                        'product': 'group-hover:text-[#ff5c00]',
                        'service': 'group-hover:text-blue-500',
                        'plan':    'group-hover:text-emerald-600'
                      };

                      return (
                        <motion.div
                          ref={isLastElement ? lastElementRef : null}
                          key={`${item._id}-${i}`}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (i % 10) * 0.05, duration: 0.5 }}
                          onClick={() => navigate(navPath)}
                          className={`group cursor-pointer flex flex-col bg-white border-2 md:border-4 border-black shadow-[4px_4px_0px_#000] md:shadow-[10px_10px_0px_#000] ${borderColorMap[item.itemType]} transition-all relative overflow-hidden h-full`}
                        >
                           {/* Tech header on card */}
                           <div className="flex justify-between items-center bg-black text-white px-2 md:px-4 py-1 md:py-2 text-[6px] md:text-[10px] font-black tracking-widest uppercase">
                             <span>{tag}_REF: {item._id?.toString().slice(-6).toUpperCase()}</span>
                             <FaPlus size={8} className={`${textColorMap[item.itemType]}`} />
                           </div>

                           <div className="aspect-square bg-white p-4 md:p-8 relative overflow-hidden flex items-center justify-center border-b-2 md:border-b-4 border-black">
                             <img
                               src={imgUrl}
                               alt={itemName}
                               className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-700 ease-in-out"
                             />
                           </div>
 
                           <div className="p-3 md:p-6 flex flex-col flex-1 bg-white">
                             <h3 className={`text-xs md:text-2xl font-black text-black leading-none mb-1 md:mb-4 uppercase tracking-tighter line-clamp-1 ${hoverTextColorMap[item.itemType]} transition-colors`}>
                               {itemName}
                             </h3>
                             <p className="hidden md:block text-[11px] text-black/40 line-clamp-2 mb-8 font-mono leading-tight uppercase tracking-widest">
                               // {item.description}
                             </p>
                             <div className="mt-auto flex justify-between items-center pt-2 md:pt-6 border-t md:border-t-2 border-black/10">
                                <div className="flex flex-col">
                                   <div className="flex items-center gap-1">
                                      <span className="text-[6px] md:text-[10px] font-black text-black/30 tracking-widest uppercase mb-0 md:mb-1">
                                         {item.itemType === 'plan' ? 'EST_COST' : 'PRICE'}
                                      </span>
                                      {hasDiscount && (
                                        <span className="text-[8px] bg-[#ff5c00] text-black px-1 font-black leading-none">{discountPct}% OFF</span>
                                      )}
                                   </div>
                                   <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                                      <span className="text-sm md:text-3xl font-heading text-black leading-none">
                                        ₹{sellingPrice.toLocaleString()}
                                      </span>
                                      {hasDiscount && (
                                        <span className="text-[8px] md:text-xs text-black/20 line-through font-black">₹{itemPrice.toLocaleString()}</span>
                                      )}
                                   </div>
                                </div>
                                <div className={`w-8 h-8 md:w-14 md:h-14 bg-black text-white flex items-center justify-center ${hoverBgMap[item.itemType]} group-hover:text-black transition-all`}>
                                  <FaArrowRight size={12} className="md:size-[20px]" />
                                </div>
                             </div>
                           </div>

                           <div className="h-2 bg-black w-full flex opacity-0 group-hover:opacity-100 transition-opacity">
                             {[...Array(15)].map((_, j) => (
                               <div key={j} className="h-full flex-1 border-r border-[#ff5c00]/30 last:border-r-0"></div>
                             ))}
                           </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {loadingMore && (
                    <div className="flex flex-col items-center justify-center py-24 mt-20 border-t-4 border-black/5 bg-black/5">
                       <div className="w-24 h-3 bg-black/10 overflow-hidden relative">
                         <motion.div 
                           animate={{ x: [-100, 150] }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                           className="absolute top-0 left-0 h-full w-24 bg-[#ff5c00]"
                         ></motion.div>
                       </div>
                       <span className="mt-6 text-[12px] font-black tracking-[0.5em] text-black">BUFFERING_QUERY_STREAM...</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedCard;
