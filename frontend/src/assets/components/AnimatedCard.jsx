import React, { useContext, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowRight, FaShieldAlt, FaTruck, FaWrench, FaPlus, FaCrosshairs } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import ArchitectHero from "./ArchitectHero";
import SellerHero from "./SellerHero";
import CustomerLanding from "./CustomerLanding";

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

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await API.get(`/products/public?search=${searchQuery}&page=${nextPage}&limit=10`);
      const data = response.data;
      const newProducts = data.products || [];
      setResults(prev => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!(searchQuery || "").trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);
    setPage(1);
    try {
      const response = await API.get(`/products/public?search=${searchQuery}&page=1&limit=10`);
      const data = response.data;
      setResults(data.products || []);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSearchQuery(categoryName);
    setLoading(true);
    setError("");
    setHasSearched(true);
    setPage(1);
    API.get(`/products/public?search=${categoryName}&page=1&limit=10`)
      .then(res => {
        const data = res.data;
        setResults(data.products || []);
        setHasMore(data.hasMore || false);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to retrieve products.");
        setLoading(false);
      });
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
    <div className="flex flex-col font-sans">
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

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
                    {results.map((product, i) => {
                      const isLastElement = i === results.length - 1;
                      return (
                        <motion.div
                          ref={isLastElement ? lastElementRef : null}
                          key={`${product._id}-${i}`}
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (i % 10) * 0.05, duration: 0.6 }}
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="group cursor-pointer flex flex-col bg-white border-4 border-black shadow-[10px_10px_0px_#000] hover:shadow-[15px_15px_0px_#ff5c00] transition-all relative overflow-hidden"
                        >
                           <div className="flex justify-between items-center bg-black text-white px-4 py-2 text-[10px] font-black tracking-widest uppercase">
                             <span>REF: {product._id?.toString().slice(-6).toUpperCase()}</span>
                             <FaPlus size={10} className="text-[#ff5c00]" />
                           </div>

                           <div className="aspect-square bg-white p-8 relative overflow-hidden flex items-center justify-center border-b-4 border-black">
                             <img
                               src={product.images?.[0]?.url ? `${product.images[0].url}` : product.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500"}
                               alt={product.name}
                               className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-700 ease-in-out"
                             />
                             <div className="absolute inset-0 border-8 border-[#ff5c00]/0 group-hover:border-[#ff5c00]/5 transition-all pointer-events-none"></div>
                           </div>
 
                           <div className="p-6 flex flex-col flex-1 bg-white">
                             <h3 className="text-2xl font-black text-black leading-none mb-4 uppercase tracking-tighter line-clamp-1 group-hover:text-[#ff5c00] transition-colors">
                               {product.name}
                             </h3>
                             <p className="text-[11px] text-black/40 line-clamp-2 mb-8 font-mono leading-tight uppercase tracking-widest">
                               // {product.description}
                             </p>
                             <div className="mt-auto flex justify-between items-center pt-6 border-t-2 border-black/10">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-black/30 tracking-widest uppercase mb-1">UNIT_PRICE</span>
                                  <span className="text-3xl font-heading text-black leading-none">
                                    ₹{product.price}
                                  </span>
                                </div>
                                <div className="w-14 h-14 bg-black text-white flex items-center justify-center group-hover:bg-[#ff5c00] group-hover:text-black transition-all">
                                  <FaArrowRight size={20} />
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
