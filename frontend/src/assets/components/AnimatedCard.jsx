// import React, { useContext, useState, useRef, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaSearch, FaArrowRight, FaShieldAlt, FaTruck, FaWrench, FaPlus, FaCrosshairs } from "react-icons/fa";
// import { AuthContext } from "../context/AuthContext";
// import API from "../api/api";
// import ArchitectHero from "./ArchitectHero";
// import SellerHero from "./SellerHero";
// import CustomerLanding from "./CustomerLanding";
// import { getProductPricing } from "../utils/priceUtils";

// const AnimatedCard = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [error, setError] = useState("");
//   const [hasSearched, setHasSearched] = useState(false);
//   const [activeFilter, setActiveFilter] = useState('all');

//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const resultsRef = useRef(null);

//   const role = user?.role || "guest";
//   const userName = user?.name || "Welcome";

//   useEffect(() => {
//     if (hasSearched && !loading && resultsRef.current) {
//       resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   }, [hasSearched, loading]);

//   const performGlobalSearch = async (query, customFilter = activeFilter) => {
//     setLoading(true);
//     setError("");
//     setHasSearched(true);
//     setPage(1);
//     try {
//       let aggregated = [];
//       let hasMoreProducts = false;
//       const promises = [];

//       if (customFilter === 'all' || customFilter === 'product') {
//         promises.push(
//           API.get(`/products/public?search=${encodeURIComponent(query)}&page=1&limit=10`)
//             .then(res => ({ type: 'product', data: res.data }))
//         );
//       }
//       if (customFilter === 'all' || customFilter === 'service') {
//         promises.push(
//           API.get(`/services?search=${encodeURIComponent(query)}`)
//             .then(res => ({ type: 'service', data: res.data }))
//         );
//       }
//       if (customFilter === 'all' || customFilter === 'plan') {
//         promises.push(
//           API.get(`/construction-plans?search=${encodeURIComponent(query)}`)
//             .then(res => ({ type: 'plan', data: res.data }))
//         );
//       }

//       const resultsArray = await Promise.all(promises);
//       resultsArray.forEach(result => {
//         if (result.type === 'product') {
//           const pData = (result.data.products || []).map(p => ({ ...p, itemType: 'product' }));
//           aggregated.push(...pData);
//           hasMoreProducts = result.data.hasMore || false;
//         } else if (result.type === 'service') {
//           aggregated.push(...(result.data || []).map(s => ({ ...s, itemType: 'service' })));
//         } else if (result.type === 'plan') {
//           aggregated.push(...(result.data.plans || []).map(pl => ({ ...pl, itemType: 'plan' })));
//         }
//       });

//       aggregated.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//       setResults(aggregated);
//       setHasMore(hasMoreProducts);
//     } catch (err) {
//       setError("Search failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     if (e && e.preventDefault) e.preventDefault();
//     if (!searchQuery.trim()) return;
//     performGlobalSearch(searchQuery);
//   };

//   const handleCategoryClick = (cat) => {
//     setSearchQuery(cat);
//     performGlobalSearch(cat);
//   };

//   const observer = useRef();
//   const lastElementRef = useCallback(node => {
//     if (loading || loadingMore) return;
//     if (observer.current) observer.current.disconnect();
//     observer.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting && hasMore) {
//         loadMore();
//       }
//     });
//     if (node) observer.current.observe(node);
//   }, [loading, loadingMore, hasMore]);

//   const loadMore = async () => {
//     if (loadingMore || !hasMore || (activeFilter !== 'all' && activeFilter !== 'product')) return;
//     setLoadingMore(true);
//     const nextPage = page + 1;
//     try {
//       const response = await API.get(`/products/public?search=${encodeURIComponent(searchQuery)}&page=${nextPage}&limit=10`);
//       const data = response.data;
//       const newProducts = (data.products || []).map(p => ({ ...p, itemType: 'product' }));
//       setResults(prev => [...prev, ...newProducts]);
//       setPage(nextPage);
//       setHasMore(data.hasMore || false);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   const isPublicUser = role === 'guest' || role === 'customer' || role === 'architect' || role === 'seller';

//   if (isPublicUser) {
//     return (
//       <div className="flex flex-col font-mono relative min-h-screen">
//         {/* HERO SECTION */}
//         {!hasSearched && (
//           <>
//             {role === 'architect' ? <ArchitectHero /> : role === 'seller' ? <SellerHero /> : (
//               <CustomerLanding
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 onSearch={handleSearch}
//                 onCategoryClick={handleCategoryClick}
//               />
//             )}
//           </>
//         )}

//         {/* SEARCH RESULTS */}
//         {(hasSearched || loading || error) && (
//           <div ref={resultsRef} className="flex-1 w-full bg-[#e5e5e5] text-black pb-32  border-black z-10 min-h-screen">
//             <div className="max-w-[1600px] mx-auto w-full px-8 py-20">
//               <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
//                 {['all', 'product', 'service', 'plan'].map(f => (
//                   <button key={f} onClick={() => { setActiveFilter(f); performGlobalSearch(searchQuery, f); }} className={`px-6 py-2 text-[10px] font-black tracking-widest uppercase border-2 transition-all ${activeFilter === f ? 'bg-black text-white border-black' : 'border-black/10 hover:border-black'}`}>{f}</button>
//                 ))}
//               </div>

//               {loading && <div className="text-center py-20 uppercase font-black animate-pulse tracking-[0.5em]">Fetching_Data_Stream...</div>}

//               {!loading && results.length > 0 && (
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8">
//                   {results.map((item, i) => {
//                     const isLastElement = i === results.length - 1;

//                     let tag = "PRD";
//                     let navPath = `/product/${item._id}`;
//                     let itemName = item.name || item.title;
//                     let itemPrice = item.price || 0;
//                     let sellingPrice = itemPrice;
//                     let hasDiscount = false;
//                     let discountPct = 0;

//                     let imgUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500";

//                     if (item.itemType === 'product') {
//                       imgUrl = item.images?.[0]?.url ? `${item.images[0].url}` : item.image || imgUrl;
//                       const pricing = getProductPricing(item);
//                       sellingPrice = pricing.sellingPrice;
//                       hasDiscount = pricing.hasDiscount;
//                       discountPct = pricing.discountPct;
//                     } else if (item.itemType === 'service') {
//                       tag = "SVC";
//                       navPath = `/service/${item._id}`;
//                       imgUrl = item.images?.[0] ? `${item.images[0]}` : imgUrl;
//                     } else if (item.itemType === 'plan') {
//                       tag = "PLN";
//                       navPath = `/project-plans/${item._id}`;
//                       imgUrl = item.images?.[0] ? `${item.images[0]}` : imgUrl;
//                       itemPrice = item.estimatedCost || 0;
//                       sellingPrice = itemPrice;
//                     }

//                     return (
//                       <motion.div
//                         ref={isLastElement ? lastElementRef : null}
//                         key={`${item._id}-${i}`}
//                         initial={{ opacity: 0, y: 30 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: (i % 10) * 0.05, duration: 0.5 }}
//                         onClick={() => navigate(navPath)}
//                         className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-[15px_15px_0px_#ff5c00] transition-all duration-300 group flex flex-col overflow-hidden cursor-pointer"
//                       >
//                         <div className="h-40 md:h-48 bg-gray-50 relative overflow-hidden">
//                           <img
//                             src={imgUrl}
//                             alt={itemName}
//                             className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
//                           />
//                           <div className="absolute top-3 left-3 bg-white/90  px-3 py-1 rounded-full text-[10px] font-bold text-gray-800  uppercase tracking-wider">
//                             {item.itemType === 'product' ? 'PRODUCT' : item.itemType === 'service' ? 'SERVICE' : 'PLAN'}
//                           </div>
//                         </div>

//                         <div className="p-4 md:p-5 flex-1 flex flex-col">
//                           <h3 className="font-bold text-gray-900 text-sm md:text-lg leading-tight line-clamp-2 mb-1 group-hover:text-[#ff5c00] transition-colors">
//                             {itemName}
//                           </h3>
//                           <p className="text-gray-500 text-[10px] md:text-xs line-clamp-2">
//                             {item.description || "View full details to learn more."}
//                           </p>

//                           <div className="mt-auto flex items-end justify-between pt-4">
//                             <div>
//                               <div className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mb-0.5">
//                                 {item.itemType === 'plan' ? 'EST COST' : 'PRICE'}
//                               </div>
//                               <div className="flex items-baseline gap-2">
//                                 <span className="text-lg md:text-xl font-black text-gray-900 leading-none">
//                                   ₹{sellingPrice.toLocaleString()}
//                                 </span>
//                                 {hasDiscount && (
//                                   <span className="text-[10px] md:text-xs text-gray-400 line-through font-medium">₹{itemPrice.toLocaleString()}</span>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#ff5c00] group-hover:text-white transition-all shadow-sm">
//                               <FaArrowRight size={12} className="md:size-[14px]" />
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* 🚀 PREMIUM MINIMALIST SEARCH BAR (IMAGE-MATCHED) 🚀 */}
//         <div className="fixed bottom-28 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[500px] group">
//           {/* The Soft Warm Backlight (Peaking from behind) */}
//           <div className="absolute inset-x-12 inset-y-7 search-backlight-core rounded-full z-0 opacity-60"></div>
//           <div className="absolute -inset-1 blur-xl bg-black rounded-full z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

//           <motion.div
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, ease: "easeOut" }}
//             className="relative search-premium-chassis rounded-lg h-14 md:h-16 flex items-center px-6 transition-transform duration-500 group-hover:scale-[1.02]"
//           >
//             <div className="flex-1 flex items-center">
//               <input
//                 type="text"
//                 placeholder="Search"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                 className="w-full bg-transparent border-none outline-none text-gray-800 text-base md:text-lg font-medium placeholder:text-gray-300 tracking-tight"
//               />
//             </div>

//             <button
//               onClick={handleSearch}
//               className="ml-2 text-gray-900 transition-all hover:scale-110 active:scale-95 p-1"
//             >
//               <FaSearch size={15} className="stroke-[1.5]" />
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#e5e5e5] flex items-center justify-center font-mono p-12">
//       <div className="border-4 border-black p-10 bg-white shadow-[20px_20px_0px_#000]">
//         <h2 className="text-4xl font-black uppercase mb-4">Dashboard_Redirect</h2>
//         <button onClick={() => navigate(`/${role}`)} className="bg-black text-white px-8 py-4 font-black hover:bg-[#ff5c00] transition-colors">ENTER_SYSTEM</button>
//       </div>
//     </div>
//   );
// };

// export default AnimatedCard;
////////////////////////


import React, { useContext, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowRight } from "react-icons/fa";
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
  const [activeFilter, setActiveFilter] = useState('all');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const role = user?.role || "guest";

  useEffect(() => {
    if (hasSearched && !loading && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hasSearched, loading]);

  const performGlobalSearch = async (query, customFilter = activeFilter) => {
    setLoading(true);
    setError("");
    setHasSearched(true);
    setPage(1);
    try {
      let aggregated = [];
      let hasMoreProducts = false;
      const promises = [];

      if (customFilter === 'all' || customFilter === 'product') {
        promises.push(
          API.get(`/products/public?search=${encodeURIComponent(query)}&page=1&limit=10`)
            .then(res => ({ type: 'product', data: res.data }))
        );
      }
      if (customFilter === 'all' || customFilter === 'service') {
        promises.push(
          API.get(`/services?search=${encodeURIComponent(query)}`)
            .then(res => ({ type: 'service', data: res.data }))
        );
      }
      if (customFilter === 'all' || customFilter === 'plan') {
        promises.push(
          API.get(`/construction-plans?search=${encodeURIComponent(query)}`)
            .then(res => ({ type: 'plan', data: res.data }))
        );
      }

      const resultsArray = await Promise.all(promises);
      resultsArray.forEach(result => {
        if (result.type === 'product') {
          const pData = (result.data.products || []).map(p => ({ ...p, itemType: 'product' }));
          aggregated.push(...pData);
          hasMoreProducts = result.data.hasMore || false;
        } else if (result.type === 'service') {
          aggregated.push(...(result.data || []).map(s => ({ ...s, itemType: 'service' })));
        } else if (result.type === 'plan') {
          aggregated.push(...(result.data.plans || []).map(pl => ({ ...pl, itemType: 'plan' })));
        }
      });

      aggregated.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setResults(aggregated);
      setHasMore(hasMoreProducts);
    } catch (err) {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;
    performGlobalSearch(searchQuery);
  };

  const handleCategoryClick = (cat) => {
    setSearchQuery(cat);
    performGlobalSearch(cat);
  };

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
    if (loadingMore || !hasMore || (activeFilter !== 'all' && activeFilter !== 'product')) return;
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

  const isPublicUser = role === 'guest' || role === 'customer' || role === 'architect' || role === 'seller';

  if (isPublicUser) {
    return (
      <div className="flex flex-col font-sans relative min-h-screen bg-[#f8f9fa]">
        {/* HERO SECTION */}
        {!hasSearched && (
          <>
            {role === 'architect' ? <ArchitectHero /> : role === 'seller' ? <SellerHero /> : (
              <CustomerLanding
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onCategoryClick={handleCategoryClick}
              />
            )}
          </>
        )}

        {/* SEARCH RESULTS CONTAINER */}
        {(hasSearched || loading || error) && (
          <div ref={resultsRef} className="flex-1 w-full pb-32 z-10 min-h-screen">
            <div className="max-w-[1400px] mx-auto w-full px-6 py-12">

              {/* Filter Tabs */}
              <div className="flex gap-3 mb-12 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'product', 'service', 'plan'].map(f => (
                  <button
                    key={f}
                    onClick={() => { setActiveFilter(f); performGlobalSearch(searchQuery, f); }}
                    className={`px-8 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full border transition-all duration-300 ${activeFilter === f
                      ? 'bg-black text-white border-black shadow-lg scale-105'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Syncing Data...</p>
                </div>
              )}

              {/* GRID RESULTS */}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {results.map((item, i) => {
                    const isLastElement = i === results.length - 1;

                    let navPath = `/product/${item._id}`;
                    let itemName = item.name || item.title;
                    let itemPrice = item.price || 0;
                    let sellingPrice = itemPrice;
                    let hasDiscount = false;
                    let imgUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500";

                    if (item.itemType === 'product') {
                      imgUrl = item.images?.[0]?.url ? `${item.images[0].url}` : item.image || imgUrl;
                      const pricing = getProductPricing(item);
                      sellingPrice = pricing.sellingPrice;
                      hasDiscount = pricing.hasDiscount;
                    } else if (item.itemType === 'service') {
                      navPath = `/service/${item._id}`;
                      imgUrl = item.images?.[0] ? `${item.images[0]}` : imgUrl;
                    } else if (item.itemType === 'plan') {
                      navPath = `/project-plans/${item._id}`;
                      imgUrl = item.images?.[0] ? `${item.images[0]}` : imgUrl;
                      itemPrice = item.estimatedCost || 0;
                      sellingPrice = itemPrice;
                    }

                    return (
                      <motion.div
                        ref={isLastElement ? lastElementRef : null}
                        key={`${item._id}-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i % 8) * 0.05 }}
                        onClick={() => navigate(navPath)}
                        className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 cursor-pointer flex flex-col overflow-hidden"
                      >
                        {/* Image Section */}
                        <div className="relative h-60 overflow-hidden bg-gray-50">
                          <img
                            src={imgUrl}
                            alt={itemName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter text-black shadow-sm">
                              {item.itemType.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                            {itemName}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                            {item.description || "Detailed overview available. Click to explore more."}
                          </p>

                          <div className="mt-auto flex items-end justify-between">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                {item.itemType === 'plan' ? 'Est. Investment' : 'Listing Price'}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-gray-900">
                                  ₹{sellingPrice.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                  <span className="text-sm text-gray-400 line-through font-medium">₹{itemPrice.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500 shadow-inner">
                              <FaArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {results.length === 0 && !loading && hasSearched && (
                <div className="text-center py-40">
                  <h2 className="text-2xl font-bold text-gray-300 uppercase tracking-[0.3em]">No results found</h2>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOATING SEARCH BAR */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[600px]">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl h-16 md:h-20 flex items-center px-6 md:px-8">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg font-medium placeholder:text-gray-400"
              />
              <button
                onClick={handleSearch}
                className="ml-4 bg-black text-white p-3 md:p-4 rounded-xl hover:bg-orange-600 transition-all duration-300 hover:shadow-lg active:scale-90"
              >
                <FaSearch size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Redirect UI
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[40px] shadow-[40px_40px_0px_rgba(0,0,0,0.05)] border border-gray-100 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <FaArrowRight className="text-orange-600 -rotate-45" size={30} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Access Dashboard</h2>
        <p className="text-gray-500 mb-10 text-sm">System ready. Click below to enter your workspace.</p>
        <button
          onClick={() => navigate(`/${role}`)}
          className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-black/10"
        >
          Enter System
        </button>
      </div>
    </div>
  );
};
export default AnimatedCard;