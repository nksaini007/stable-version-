import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import API from "../api/api";
import { FaBoxes, FaChevronRight } from "react-icons/fa";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";

const ItemList = () => {
  const { categoryName, itemName, itemList } = useParams();
  const observerRef = useRef(null);
  const [mainProducts, setMainProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async (pageNum = 1, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setFetchingMore(true);

      const type = decodeURIComponent(itemList);
      const params = new URLSearchParams({
        page: pageNum,
        limit: 12,
        category: categoryName,
        subcategory: itemName,
        type: type,
      });

      const res = await API.get(`/products/public?${params.toString()}`);
      const data = res.data;
      const newProducts = data.products || [];

      const formatImage = (product) =>
        product.images?.length > 0
          ? product.images[0].url.startsWith("http")
            ? product.images[0].url
            : `${product.images[0].url}`
          : null;

      const formatted = newProducts.map((p) => ({ ...p, image: formatImage(p) }));

      if (pageNum === 1) {
        setMainProducts(formatted);
        
        const relatedParams = new URLSearchParams({
            limit: 6,
            category: categoryName,
            subcategory: itemName,
        });
        const relatedRes = await API.get(`/products/public?${relatedParams.toString()}`);
        const relatedData = relatedRes.data;
        const filteredRelated = (relatedData.products || [])
            .filter(p => p.type?.toLowerCase() !== type.toLowerCase())
            .map(p => ({ ...p, image: formatImage(p) }));
        setRelatedProducts(filteredRelated);
      } else {
        setMainProducts((prev) => [...prev, ...formatted]);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [categoryName, itemName, itemList]);

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

  return (
    <div className="bg-[#e5e5e5] font-mono selection:bg-[#ff5c00] selection:text-black tech-grid min-h-screen flex flex-col pt-24">
      <Nev />
      <div className="scanline"></div>

      <div className="max-w-[2000px] mx-auto w-full px-6 md:px-12 py-10 relative z-10 flex-1">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="text-[9px] font-black text-black/30 hover:text-[#ff5c00] uppercase tracking-widest transition-colors">ROOT</Link>
            <span className="text-black/20 text-[9px]">/</span>
            <Link to="/categories" className="text-[9px] font-black text-black/30 hover:text-[#ff5c00] uppercase tracking-widest transition-colors">CATALOG</Link>
            <span className="text-black/20 text-[9px]">/</span>
            <Link to={`/category/${categoryName}`} className="text-[9px] font-black text-black/30 hover:text-[#ff5c00] uppercase tracking-widest transition-colors">{categoryName}</Link>
            <span className="text-black/20 text-[9px]">/</span>
            <span className="text-[9px] font-black text-[#ff5c00] uppercase tracking-widest">{itemName}</span>
        </nav>

        {/* Header */}
        <div className="relative mb-14 border-l-4 border-[#ff5c00] pl-6">
          <span className="text-[#ff5c00] text-[10px] font-black tracking-[0.5em] uppercase block mb-2 animate-pulse">
            SECTOR_INVENTORY::QUERYING
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-black uppercase leading-tight">
            {itemList} {itemName}s
          </h1>
          <p className="mt-2 text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">
            TARGET_ZONE: <span className="text-black">{categoryName}</span> // SUBSYSTEM_ID: {itemName}
          </p>
        </div>

        {error && (
            <div className="bg-white border-2 border-black p-6 mb-8 inline-block">
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
        )}

        {loading ? (
           <div className="flex flex-col items-center py-20">
                <div className="w-10 h-10 border-4 border-black border-t-[#ff5c00] animate-spin mb-4"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">FETCHING_PRODUCT_RECORDS...</span>
           </div>
        ) : (
          <>
            {/* Main Products */}
            {mainProducts.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">PRIMARY_INVENTORY</h2>
                    <div className="flex-1 h-[1px] bg-black/10"></div>
                </div>
                
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                  {mainProducts.map((product, index) => (
                    <Link
                      key={index}
                      to={`/category/${categoryName}/${itemName}/${itemList}/${product._id}`}
                      className="bg-white border border-black/10 group-hover:border-black p-3 relative overflow-hidden transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.01)] group-hover:shadow-[10px_10px_0px_rgba(255,92,0,0.06)] group"
                    >
                      <div className="corner-decal decal-tl !border-black/10 group-hover:!border-black !w-2 !h-2"></div>
                      
                      {product.image ? (
                        <div className="aspect-square bg-black/5 border border-black/5 mb-4 overflow-hidden relative">
                           <img
                             src={product.image}
                             alt={product.name}
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             {...lazyImageProps}
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ) : (
                        <div className="aspect-square bg-black/5 flex items-center justify-center text-black/10 mb-4">
                           <FaBoxes size={32} />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <span className="text-[7px] font-black text-black/20 uppercase tracking-widest">UNIT_{index + 1}</span>
                        <h3 className="text-[10px] font-black uppercase text-black leading-tight line-clamp-1 group-hover:text-[#ff5c00] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[9px] text-black/40 font-black uppercase tracking-widest line-clamp-2 min-h-[2rem]">
                           {product.description}
                        </p>
                        
                        <div className="mt-4 flex justify-between items-center border-t border-black/5 pt-3">
                          <span className="text-[12px] font-black text-black">₹{product.price.toLocaleString()}</span>
                          <span className={`text-[8px] px-2 py-0.5 font-black uppercase tracking-widest ${
                                product.stock > 50 ? "bg-black/5 text-black" :
                                product.stock > 10 ? "bg-[#ff5c00]/10 text-[#ff5c00]" :
                                "bg-red-100 text-red-800"
                            }`}>
                            {product.stock > 50 ? "NOMINAL" : product.stock > 10 ? "DEPLEATED" : "CRITICAL"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
                <div className="py-32 text-center border-2 border-dashed border-black/10 bg-white/30 backdrop-blur-sm">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">NO_RECORDS_AVAILABLE_IN_THIS_UNIT</p>
                </div>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-24">
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">COMPLEMENTARY_UNITS</h2>
                    <div className="flex-1 h-[1px] bg-black/10"></div>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                  {relatedProducts.map((product, index) => (
                    <Link
                      key={index}
                      to={`/category/${categoryName}/${itemName}/${itemList}/${product._id}`}
                      className="min-w-[220px] bg-white border border-black/10 hover:border-black p-4 transition-all relative group flex-shrink-0"
                    >
                      <div className="corner-decal decal-tl !border-black/10 group-hover:!border-black !w-2 !h-2"></div>
                      {product.image ? (
                        <div className="aspect-square bg-black/5 border border-black/5 mb-4 overflow-hidden relative">
                           <img
                             src={product.image}
                             alt={product.name}
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                           />
                        </div>
                      ) : (
                        <div className="aspect-square bg-black/5 flex items-center justify-center text-black/10 mb-4">
                           <FaBoxes size={24} />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase text-black leading-tight group-hover:text-[#ff5c00] transition-colors">{product.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[11px] font-black text-black">₹{product.price.toLocaleString()}</span>
                          <FaChevronRight size={8} className="text-black/20 group-hover:text-black" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Load More Sentinel */}
        {hasMore && (
          <div 
            ref={observerRef}
            id="load-more-sentinel" 
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
      </div>

      <Footer />
    </div>
  );
};

export default ItemList;
