import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import Nev from "./Nev";
import Footer from "./Footer";
import API from "../api/api";

// Intersection Observer Hook
const useIntersectionObserver = (ref, callback, options) => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, callback, options]);
};

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
        limit: 10,
        category: categoryName,
        subcategory: itemName,
      });

      if (searchQuery) params.append("search", searchQuery);

      const res = await API.get(`/products/public?${params.toString()}`);
      const data = res.data;
      const newProducts = data.products || [];

      if (pageNum === 1) {
        setProductsList(newProducts);
        
        // Extract unique types (only on first load)
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
  }, [categoryName, itemName]);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true);
    }
  }, [searchQuery]);

  const loadMore = useCallback(() => {
    if (!fetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [fetchingMore, hasMore, page]);

  useIntersectionObserver(observerRef, loadMore, { threshold: 0.1 });

  // Filter products for search results strictly
  const searchResults = productsList.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800">
      <Nev />

      <div className="max-w-7xl min-h-screen mx-auto px-4 py-10">
        {/* Header */}
        <div className="relative text-left mb-10">
          <div className="absolute inset-0 -top-10 h-40 bg-gradient-to-r from-orange-200 via-purple-200 to-orange-200 opacity-30 blur-3xl rounded-3xl"></div>
          <motion.h1
            className="relative text-5xl font-extrabold bg-gray-600 bg-clip-text text-transparent drop-shadow-md pb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {itemName}
          </motion.h1>
          <motion.p
            className="relative mt-3 text-gray-600 text-lg tracking-wide"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Category: <span className="font-semibold text-gray-500">{categoryName}</span>
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative w-full max-w-2xl mx-auto mb-10"
          >
            <input
              type="text"
              placeholder={`Search in ${itemName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
            >
              <FaSearch />
            </button>
          </form>
        </motion.div>

        {/* Error */}
        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {/* Dynamic Grid: Products or Types */}
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading...</p>
        ) : searchQuery.trim() !== "" ? (
          searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product, idx) => {
                const imageUrl = product.images?.[0]?.url;
                return (
                  <motion.div
                    key={product._id || idx}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition flex flex-col"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl.startsWith("http") ? imageUrl : `${imageUrl}`}
                        alt={product.name}
                        className="w-full h-48 object-contain rounded-md mb-3 bg-gray-50"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-3 text-gray-500">
                        No image
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-grow">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-bold text-orange-500 text-lg">₹{product.price}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="mt-4 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition"
                    >
                      Buy Now
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No products found for "{searchQuery}".</p>
          )
        ) : types.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {types.map(({ type, image }, idx) => (
              <motion.div
                key={type.toLowerCase()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link
                  to={`/category/${categoryName}/${itemName}/${type.toLowerCase()}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow flex flex-col overflow-hidden h-full border border-gray-100"
                >
                  {image ? (
                    <img src={image} alt={type} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-400">No image available</div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-gray-800 capitalize mb-1">{type}</h2>
                    <p className="text-sm text-gray-500 mt-auto">See all {type} {itemName}s</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : productsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsList.map((product, idx) => {
              const imageUrl = product.images?.[0]?.url;
              return (
                <motion.div
                  key={product._id || idx}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition flex flex-col"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl.startsWith("http") ? imageUrl : `${imageUrl}`}
                      alt={product.name}
                      className="w-full h-48 object-contain rounded-md mb-3 bg-gray-50"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-3 text-gray-500">No image</div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-grow">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-orange-500 text-lg">₹{product.price}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="mt-4 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition"
                  >
                    Buy Now
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No products found for this item.</p>
        )}

        {/* Load More Sentinel */}
        {hasMore && (
          <div 
            ref={observerRef}
            id="load-more-sentinel" 
            className="h-20 flex items-center justify-center mt-10"
          >
            {fetchingMore && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ItemPage;
