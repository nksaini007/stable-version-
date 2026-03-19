import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import Categories from "./Categories";
import API from "../api/api";

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
        limit: 10,
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
        
        // Also fetch related products (one time only, small limit)
        const relatedParams = new URLSearchParams({
            limit: 5,
            category: categoryName,
            subcategory: itemName,
        });
        const relatedRes = await API.get(`/products/public?${relatedParams.toString()}`);
        const relatedData = relatedRes.data;
        // Filter out the current type from related on client side since we don't have a "not equal" filter on backend yet
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

  // Observer implementation (matching ItemPage)
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { threshold: 0.1 });
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [observerRef, loadMore]);

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800 min-h-screen">
      <Nev />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="relative mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900">
            {itemList} {itemName}s
          </h1>
          <p className="mt-2 text-gray-600 text-base tracking-wide">
            Category: <span className="font-semibold text-gray-400">{categoryName}</span>
          </p>
        </div>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading products...</p>
        ) : (
          <>
            {/* Main Products */}
            {mainProducts.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Product Details</h2>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {mainProducts.map((product, index) => (
                    <Link
                      key={index}
                      to={`/category/${categoryName}/${itemName}/${itemList}/${product._id}`}
                      className="bg-white/70 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 duration-300 overflow-hidden"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-40 object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        <p className="text-gray-600 mt-1 text-sm line-clamp-2">{product.description}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-orange-500 font-semibold text-sm">₹{product.price.toFixed(2)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.stock > 50 ? "bg-orange-200 text-orange-900" :
                            product.stock > 10 ? "bg-yellow-200 text-yellow-800" :
                              "bg-red-200 text-red-800"
                            }`}>
                            {product.stock > 50 ? "In Stock" : product.stock > 10 ? "Limited" : "Low"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mt-16 mb-6 text-gray-700">You may also like</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {relatedProducts.map((product, index) => (
                    <Link
                      key={index}
                      to={`/category/${categoryName}/${itemName}/${itemList}/${product._id}`}
                      className="min-w-[220px] bg-white/70 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition transform duration-300 overflow-hidden flex-shrink-0"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-36 object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-orange-500 font-bold text-sm">₹{product.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
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

      <Categories />
      <Footer />
    </div>
  );
};

export default ItemList;
