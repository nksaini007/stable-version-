import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaBoxes, FaChevronRight } from "react-icons/fa";
import Nev from "./Nev";
import Footer from "./Footer";
import API from "../api/api";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";

const ItemPage = () => {
  const { categoryName, itemName } = useParams();
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const [types, setTypes] = useState([]);
  const [productsList, setProductsList] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async (pageNum = 1, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setFetchingMore(true);

      const params = new URLSearchParams({
        page: pageNum,
        limit: 14,
        category: categoryName,
        subcategory: itemName,
      });

      if (searchQuery) params.append("search", searchQuery);

      const res = await API.get(`/products/public?${params.toString()}`);
      const data = res.data;
      const newProducts = data.products || [];

      if (pageNum === 1) {
        setProductsList(newProducts);
        
        const uniqueTypesMap = new Map();
        newProducts.forEach((item) => {
          const typeKey = item.type?.toLowerCase();
          if (typeKey && !uniqueTypesMap.has(typeKey)) {
            const imageUrl = item.images?.[0]?.url;
            uniqueTypesMap.set(typeKey, {
              type: item.type,
              image: imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `${imageUrl}`) : null,
            });
          }
        });
        setTypes(Array.from(uniqueTypesMap.values()));
      } else {
        setProductsList((prev) => [...prev, ...newProducts]);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to sync sector inventory. Connection refused.");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [categoryName, itemName]);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
        const timeout = setTimeout(() => {
            setPage(1);
            setHasMore(true);
            fetchProducts(1, true);
        }, 500);
        return () => clearTimeout(timeout);
    }
  }, [searchQuery]);

  const loadMore = useCallback(() => {
    if (!fetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [fetchingMore, hasMore, page]);

  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { threshold: 0.1 });
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [observerRef, loadMore]);

  // Filter products for search results strictly
  const searchResults = productsList.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#e5e5e5] font-mono selection:bg-[#ff5c00] selection:text-black tech-grid relative flex flex-col pt-24">
      <Nev />
      <div className="scanline"></div>

      <main className="flex-1 max-w-[2000px] mx-auto w-full px-6 md:px-12 py-10 relative z-10">
        
        {/* Breadcrumb HUD */}
        <nav className="flex items-center gap-2 mb-10 text-[9px] font-black uppercase tracking-widest text-black/30">
          <Link to="/" className="hover:text-[#ff5c00]">ROOT</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-[#ff5c00]">CATALOG</Link>
          <span>/</span>
          <Link to={`/category/${categoryName}`} className="hover:text-[#ff5c00]">{categoryName}</Link>
          <span>/</span>
          <span className="text-[#ff5c00]">{itemName}</span>
        </nav>

        {/* Header Unit */}
        <div className="relative border-l-4 border-black pl-6 mb-16">
          <span className="text-[#ff5c00] text-[10px] font-black tracking-[0.5em] uppercase block mb-2 animate-pulse">
            SECTOR_SUB-PROTOCOL::SCANNING
          </span>
          <h1 className="text-4xl md:text-7xl font-heading font-black text-black uppercase leading-none">
            {itemName}
          </h1>
          <p className="mt-4 text-[9px] font-black text-black/40 uppercase tracking-[0.2em] max-w-xl">
             ACCESSING_COLLECTION_DATA_FOR_ZONE_{categoryName.toUpperCase()}. DISPLAYING_ACTIVE_SUB-TYPES_AND_UNITS.
          </p>
        </div>

        {/* Search Interface */}
        <div className="max-w-3xl mb-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#ff5c00]/5 scale-y-0 group-focus-within:scale-y-100 transition-transform origin-bottom duration-300"></div>
            <input
              type="text"
              placeholder={`PROTOCOL: SEARCH_${itemName.toUpperCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/10 px-6 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-all relative z-10"
            />
            <button className="absolute right-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#ff5c00] transition-colors z-10">
              <FaSearch size={14} />
            </button>
          </div>
        </div>

        {error && (
            <div className="bg-white border-2 border-red-500 p-6 mb-12 inline-block">
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
        )}

        {/* Dynamic Display Grid */}
        {loading ? (
           <div className="flex flex-col items-center py-24">
                <div className="w-10 h-10 border-4 border-black border-t-[#ff5c00] animate-spin mb-4"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">DECRYPTING_SECTOR_CACHES...</span>
           </div>
        ) : (
          <>
            {/* Conditional Sub-Type Grid or Product Grid */}
            {searchQuery.trim() === "" && types.length > 0 ? (
              <div className="space-y-16">
                 <div className="flex items-center gap-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">IDENTIFIED_MODELS</h2>
                    <div className="flex-1 h-[1px] bg-black/10"></div>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                    {types.map(({ type, image }, idx) => (
                       <Link
                         key={type.toLowerCase()}
                         to={`/category/${categoryName}/${itemName}/${type.toLowerCase()}`}
                         className="bg-white border border-black/10 hover:border-black p-3 transition-all relative group shadow-[6px_6px_0px_rgba(0,0,0,0.01)] hover:shadow-[10px_10px_0px_rgba(255,92,0,0.06)]"
                       >
                         <div className="corner-decal decal-tl !border-black/5 group-hover:!border-black !w-2 !h-2"></div>
                         
                         <div className="aspect-square bg-black/5 overflow-hidden mb-3 border border-black/5">
                            {image ? (
                                <img src={image} alt={type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-black/10">
                                    <FaBoxes size={24} />
                                </div>
                            )}
                         </div>
                         <div className="space-y-1">
                            <span className="text-[7px] font-black text-[#ff5c00] uppercase tracking-widest">ID_TYPE_{idx + 1}</span>
                            <h3 className="text-[10px] font-black uppercase text-black leading-tight line-clamp-1 group-hover:text-[#ff5c00] transition-colors">{type}</h3>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">QUERY</span>
                                <FaChevronRight size={7} className="text-black/20 group-hover:text-black transition-colors" />
                            </div>
                         </div>
                       </Link>
                    ))}
                 </div>
              </div>
            ) : (
              <div className="space-y-16">
                 <div className="flex items-center gap-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">
                        {searchQuery ? `SEARCH_RESULTS: [${searchQuery.toUpperCase()}]` : "UNIT_INVENTORY"}
                    </h2>
                    <div className="flex-1 h-[1px] bg-black/10"></div>
                 </div>

                 {searchResults.length > 0 || productsList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                        {(searchQuery ? searchResults : productsList).map((product, idx) => (
                           <Link
                             key={product._id || idx}
                             to={`/product/${product._id}`}
                             className="bg-white border border-black/10 hover:border-black p-3 transition-all relative group shadow-[6px_6px_0px_rgba(0,0,0,0.01)] hover:shadow-[10px_10px_0px_rgba(255,92,0,0.06)]"
                           >
                             <div className="corner-decal decal-tl !border-black/5 group-hover:!border-black !w-2 !h-2"></div>
                             
                             <div className="aspect-square bg-black/5 overflow-hidden mb-3 border border-black/5">
                                {product.images?.[0]?.url ? (
                                    <img 
                                        src={getOptimizedImage(product.images[0].url, 500)} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" 
                                        {...lazyImageProps}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-black/10">
                                        <FaBoxes size={24} />
                                    </div>
                                )}
                             </div>
                             <div className="space-y-1">
                                <span className="text-[7px] font-black text-black/20 uppercase tracking-widest">UNIT_{idx + 1}</span>
                                <h3 className="text-[10px] font-black uppercase text-black leading-tight line-clamp-1 group-hover:text-[#ff5c00] transition-colors">{product.name}</h3>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[11px] font-black text-black">₹{product.price.toLocaleString()}</span>
                                    <div className="w-6 h-6 bg-black text-white flex items-center justify-center group-hover:bg-[#ff5c00] transition-colors">
                                        <FaChevronRight size={8} />
                                    </div>
                                </div>
                             </div>
                           </Link>
                        ))}
                    </div>
                 ) : (
                    <div className="py-32 text-center border-2 border-dashed border-black/10">
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">NO_PRODUCT_RECORDS_MATCH_THE_QUERY</p>
                    </div>
                 )}
              </div>
            )}
          </>
        )}

        {/* Load More Sentinel */}
        {hasMore && (
          <div 
            ref={observerRef}
            className="h-32 flex items-center justify-center mt-12 bg-black/5 border border-dashed border-black/10"
          >
            {fetchingMore && (
                 <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-black border-t-[#ff5c00] animate-spin mb-2"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-black/40">ENHANCING_DATA_STREAM...</span>
                </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ItemPage;
