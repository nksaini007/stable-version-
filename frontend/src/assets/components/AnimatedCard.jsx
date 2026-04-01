import React, { useContext, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowRight, FaShieldAlt, FaStore, FaTruck, FaHardHat, FaWrench, FaTags, FaRulerCombined, FaPalette, FaBuilding } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import ArchitectHero from "./ArchitectHero";

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

  const role = user?.role || "guest";
  const userName = user?.name || "Welcome";

  // Dashboard User Configurations
  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          theme: "blue",
          title: "System Administration",
          subtitle: "Manage platform operations, users, and global settings.",
          icon: <FaShieldAlt className="text-blue-500 text-5xl mb-4" />,
          bgGradient: "from-blue-50/50 to-white",
          accent: "bg-blue-600 hover:bg-blue-700",
          dashRoute: "/admin"
        };
      case 'seller':
        return {
          theme: "emerald",
          title: "Merchant Center",
          subtitle: "Track inventory, manage orders, and analyze your sales.",
          icon: <FaStore className="text-emerald-500 text-5xl mb-4" />,
          bgGradient: "from-emerald-50/50 to-white",
          accent: "bg-emerald-600 hover:bg-emerald-700",
          dashRoute: "/seller"
        };
      case 'delivery':
        return {
          theme: "amber",
          title: "Logistics Dashboard",
          subtitle: "View assigned routes, update deliveries, and manage fleet.",
          icon: <FaTruck className="text-amber-500 text-5xl mb-4" />,
          bgGradient: "from-amber-50/50 to-white",
          accent: "bg-amber-600 hover:bg-amber-700",
          dashRoute: "/delivery"
        };
      case 'architect':
        return {
          theme: "indigo",
          title: "Architect Portal",
          subtitle: "Review blueprints, manage construction timelines, and update sites.",
          icon: (
            <div className="relative group/mini-house flex items-center justify-center -mb-4">
              <img 
                src={houseImg} 
                alt="Mini House" 
                className="w-48 h-auto drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover/mini-house:scale-110"
              />
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover/mini-house:opacity-100 transition-opacity duration-700"></div>
            </div>
          ),
          bgGradient: "from-slate-900 to-black",
          accent: "bg-white hover:bg-gray-100 text-black",
          dashRoute: "/architect",
          isDark: true
        };
      case 'provider':
        return {
          theme: "purple",
          title: "Service Provider Hub",
          subtitle: "Manage your active service requests and professional bookings.",
          icon: <FaWrench className="text-purple-500 text-5xl mb-4" />,
          bgGradient: "from-purple-50/50 to-white",
          accent: "bg-purple-600 hover:bg-purple-700",
          dashRoute: "/provider"
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

  if (isDashboardUser && config && role !== 'architect') {
    const isDark = config.isDark;
    return (
      <div className={`min-h-[85vh] flex flex-col items-center justify-center p-6 sm:p-12 transition-colors duration-700 ${isDark ? 'bg-black' : `bg-gradient-to-br ${config.bgGradient}`}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`w-full max-w-4xl ${isDark ? 'bg-[#121214] border-white/5' : 'bg-white border-gray-100'} rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border flex flex-col md:flex-row`}
        >
          <div className={`md:w-1/3 p-10 flex flex-col items-center justify-center text-center ${isDark ? 'bg-[#161618] border-white/5 md:border-r' : 'bg-gray-50/50 border-gray-100 md:border-r'} border-b md:border-b-0 flex flex-col items-center justify-center`}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              {config.icon}
            </motion.div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} tracking-tight mt-6`}>
              Hi, {userName.split(' ')[0]}
            </h2>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2 uppercase tracking-wide`}>
              {role.charAt(0).toUpperCase() + role.slice(1)} Account
            </p>
          </div>

          <div className="md:w-2/3 p-10 flex flex-col justify-center relative overflow-hidden">
            {/* Background dynamic glow for dark mode */}
            {isDark && (
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            )}
            
            <h3 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 tracking-tight relative z-10`}>
              {config.title}
            </h3>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 leading-relaxed relative z-10`}>
              {config.subtitle}
            </p>
            <div className="mt-auto relative z-10">
              <button
                onClick={() => navigate(config.dashRoute)}
                className={`group inline-flex items-center justify-center gap-3 px-8 py-4 ${config.accent} font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto`}
              >
                Access Dashboard
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER FOR CUSTOMERS & GUESTS (Restored to original state)
  // ----------------------------------------------------------------------
  return (
    <div className="flex flex-col font-sans">

      {/* 🌟 PREMIUM DARK HERO SECTION 🌟 */}
      <div className="relative w-full pt-16 pb-24 px-4 sm:px-8 lg:px-12 bg-white-300 border-b border-neutral-100 overflow-hidden text-white">

        {/* Soft Background Blurs */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gray-500/10 rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gray-400/5 rounded-full blur-[120px] opacity-40 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">

          {/* Main Hero Image Display */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl relative mb-12"
          >
            {/* Stunning Image Container */}
            <div className="w-full h-[40vh] sm:h-[50vh] md:h-[60vh] rounded-[1.5rem] overflow-hidden shadow-2xl bg-neutral-800 relative group border border-neutral-800">
              {/* Replace url with specific user upload if desired */}
              <img
                // src="https://image2url.com/r2/default/images/1774156367779-ef5ba5aa-29aa-4d80-a3f1-627d52dbd842.jpeg"
                src="https://image2url.com/r2/default/images/1774837789134-e77475b8-ce1c-4c29-8b62-2dc6aa1734b7.jpg"
                alt="Main Visual"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Overlay Text inside the Image */}
              <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 max-w-2xl">
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold tracking-widest text-white border border-white/20 mb-4 inline-block shadow-sm">
                  STINCHAR INNOVATIONS
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
                  BY<br />NK_SAINI and Team
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Sleek Floating Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-3xl -mt-6 sm:-mt-24 relative z-20 px-4 sm:px-0"
          >
            <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-center w-full shadow-2xl rounded-2xl sm:rounded-full bg-neutral-800/80 backdrop-blur-md p-2 border border-neutral-700 gap-2 sm:gap-0">
              <div className="hidden sm:block pl-4 text-gray-500">
                <FaSearch className="text-xl" />
              </div>

              <div className="flex w-full items-center pl-2 sm:pl-1 pr-2 sm:pr-6 py-2 sm:py-4">
                <FaSearch className="text-gray-500 text-lg sm:hidden mr-2" />
                <input
                  type="text"
                  placeholder="Search premium assets, designers..."
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white text-sm sm:text-base font-medium focus:outline-none placeholder-gray-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-white hover:bg-gray-100 text-neutral-900 text-base sm:text-lg font-semibold rounded-2xl sm:rounded-full transition-all shadow-md hover:-translate-y-0.5"
              >
                Search
              </button>
            </form>

            {/* Elegant Category Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {["Web Design", "Architects", "3D Models", "Concrete", "Tools"].map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 text-gray-700 font-semibold text-sm hover:border-orange-400 hover:text-orange-600 hover:shadow-md transition-all ease-out"
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div >

        </div >
      </div >

      {/* ✨ LIGHT CONTENT GRID SECTION ✨ */}
      {(hasSearched || loading || error) && (
        <div className="flex-1 w-full bg-gray-50 text-gray-900 pb-16">
          <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-8 md:py-12">

            {/* Status Handling */}
            {
              loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-neutral-800 rounded-full animate-spin mb-4 shadow-sm"></div>
                  <p className="text-gray-500 font-medium tracking-wide">Gathering files...</p>
                </div>
              )
            }

            {
              error && (
                <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl text-center shadow-sm">
                  <span className="font-semibold">Oops!</span> {error}
                </div>
              )
            }

            {
              !loading && !error && hasSearched && results.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm max-w-3xl mx-auto">
                  <div className="text-5xl mb-4 opacity-50">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-500">We couldn't find anything matching "{searchQuery}". Try a broader term.</p>
                </div>
              )
            }

            {/* Results Grid (Clean & Modern Structure) */}
            <AnimatePresence>
              {!loading && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full"
                >
                  <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                      Results for <span className="text-neutral-500 font-medium">"{searchQuery}"</span>
                    </h2>
                    <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-semibold shadow-sm">
                      {results.length} Found
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-8 gap-2 xl:gap-2">
                    {results.map((product, i) => {
                      const isLastElement = i === results.length - 1;
                      return (
                        <motion.div
                          ref={isLastElement ? lastElementRef : null}
                          key={`${product._id}-${i}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (i % 10) * 0.03, duration: 0.4 }}
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="group cursor-pointer flex flex-col bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Image Container - Clean and perfectly rounded */}
                          <div className="w-full aspect-[4/4] bg-gray-50 rounded-xl overflow-hidden mb-4 relative">
                            <img
                              src={product.images?.[0]?.url ? `${product.images[0].url}` : product.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500"}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          {/* Content Details - Soft and legible */}
                          <div className="px-2 flex flex-col flex-1 pb-1">
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1.5 line-clamp-1 group-hover:text-neutral-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                              {product.description}
                            </p>
                            <div className="mt-auto flex justify-between items-end">
                              <span className="text-[17px] font-black text-gray-900">
                                ₹{product.price}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Clean Infinite Scroll Loader */}
                  {loadingMore && (
                    <div className="flex justify-center py-12 mt-8">
                      <div className="w-10 h-10 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin"></div>
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
