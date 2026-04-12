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
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const role = user?.role || "guest";
  const userName = user?.name || "Welcome";

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

  const lastElementRef = useCallback(node => {
     // Infinite scroll logic (simplified)
  }, [loading, hasMore]);

  const isPublicUser = role === 'guest' || role === 'customer' || role === 'architect' || role === 'seller';

  if (isPublicUser) {
    return (
      <div className="flex flex-col font-mono relative min-h-screen">
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

        {/* SEARCH RESULTS */}
        {(hasSearched || loading || error) && (
          <div ref={resultsRef} className="flex-1 w-full bg-[#e5e5e5] text-black pb-32 border-t-8 border-black z-10 min-h-screen">
            <div className="max-w-[1600px] mx-auto w-full px-8 py-20">
              {/* Filter Tabs */}
              <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
                  {['all', 'product', 'service', 'plan'].map(f => (
                    <button key={f} onClick={() => { setActiveFilter(f); performGlobalSearch(searchQuery, f); }} className={`px-6 py-2 text-[10px] font-black tracking-widest uppercase border-2 transition-all ${activeFilter === f ? 'bg-black text-white border-black' : 'border-black/10 hover:border-black'}`}>{f}</button>
                  ))}
              </div>

              {loading && <div className="text-center py-20 uppercase font-black animate-pulse tracking-[0.5em]">Fetching_Data_Stream...</div>}
              
              {!loading && results.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {results.map((item, i) => {
                       const pricing = item.itemType === 'product' ? getProductPricing(item) : { sellingPrice: item.price || item.estimatedCost || 0 };
                       return (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => navigate(item.itemType === 'product' ? `/product/${item._id}` : (item.itemType === 'service' ? `/service/${item._id}` : `/project-plans/${item._id}`))}
                          className="bg-white border-2 border-black p-4 cursor-pointer hover:shadow-[8px_8px_0px_#ff5c00] transition-all group"
                        >
                           <img src={item.images?.[0]?.url || item.images?.[0] || item.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500"} className="w-full h-32 object-cover border-b-2 border-black mb-4 group-hover:grayscale-0 grayscale transition-all" />
                           <h4 className="text-[10px] font-black uppercase mb-1 truncate">{item.name || item.title}</h4>
                           <p className="text-[12px] font-black text-[#ff5c00]">₹{pricing.sellingPrice.toLocaleString()}</p>
                        </motion.div>
                       );
                    })}
                 </div>
              )}
            </div>
          </div>
        )}

        {/* 🚀 FIXED BOTTOM COMMAND BAR 🚀 */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[450px]">
           <motion.div 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="bg-black text-white rounded-full h-14 flex items-center px-1 border border-white/10 shadow-[20px_20px_60px_rgba(0,0,0,0.5)]"
           >
              <div className="pl-5 pr-2">
                 <FaSearch className="text-[#ff5c00] text-sm" />
              </div>
              <input 
                type="text" 
                placeholder="SYSTEM_QUERY..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-white/20"
              />
              <button 
                onClick={handleSearch}
                className="bg-[#ff5c00] text-black h-12 w-12 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <FaArrowRight size={14} />
              </button>
           </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e5e5] flex items-center justify-center font-mono p-12">
        <div className="border-4 border-black p-10 bg-white shadow-[20px_20px_0px_#000]">
            <h2 className="text-4xl font-black uppercase mb-4">Dashboard_Redirect</h2>
            <button onClick={() => navigate(`/${role}`)} className="bg-black text-white px-8 py-4 font-black hover:bg-[#ff5c00] transition-colors">ENTER_SYSTEM</button>
        </div>
    </div>
  );
};

export default AnimatedCard;
