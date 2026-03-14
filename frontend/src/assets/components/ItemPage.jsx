
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import Nev from "./Nev";
import Footer from "./Footer";

function ItemPage() {
  const { categoryName, itemName } = useParams();
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [productsList, setProductsList] = useState([]); // Store filtered products for search
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // ✅ Public route – no token required
        const res = await fetch(`/api/products/public`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("API response:", data); // 👀 Debugging

        // ✅ Handle both array and object response
        const products = Array.isArray(data)
          ? data
          : data.products || [];

        console.log("Parsed products:", products);

        // ✅ Flexible filter (includes instead of strict equality)
        const filtered = products.filter(
          (item) =>
            item.category?.toLowerCase().includes(categoryName.toLowerCase()) &&
            item.subcategory?.toLowerCase().includes(itemName.toLowerCase())
        );

        // Extract unique types
        const uniqueTypesMap = new Map();
        filtered.forEach((item) => {
          const typeKey = item.type?.toLowerCase();
          if (typeKey && !uniqueTypesMap.has(typeKey)) {
            const imageUrl =
              item.images && item.images.length > 0
                ? item.images[0].url.startsWith("http")
                  ? item.images[0].url
                  : `${item.images[0].url}`
                : null;

            uniqueTypesMap.set(typeKey, {
              type: item.type,
              image: imageUrl,
            });
          }
        });

        setTypes(Array.from(uniqueTypesMap.values()));
        setProductsList(filtered); // Save for search
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName, itemName]);

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
          /* Search Results (Products) */
          productsList.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsList
                .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((product, idx) => {
                  const imageUrl = product.images?.[0]?.url
                    ? product.images[0].url.startsWith("http")
                      ? product.images[0].url
                      : `${product.images[0].url}`
                    : null;

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
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-contain rounded-md mb-3 bg-gray-50"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-3 text-gray-500">
                          No image
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-grow">
                        {product.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-bold text-orange-500 text-lg">
                          ₹{product.price}
                        </p>
                        {product.mrp && product.mrp > product.price && (
                          <p className="text-xs text-gray-400 line-through">₹{product.mrp}</p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="mt-4 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition"
                      >
                        Buy Now
                      </button>
                    </motion.div>
                  )
                })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No products found for "{searchQuery}".</p>
          )
        ) : types.length > 0 ? (
          /* Types Grid */
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
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-gray-800 capitalize mb-1">{type}</h2>
                    <p className="text-sm text-gray-500 mt-auto">See all {type} {itemName}s</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No sub-types found for this item.</p>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ItemPage;

///////////////////////////////////////////////////////////////////
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import Nev from "./Nev";
// import Footer from "./Footer";

// function ItemPage() {
//   const { categoryName, itemName } = useParams();
//   const [types, setTypes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("You must be logged in to view products.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const res = await fetch("http://192.168.29.236:5000/api/products/public", {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`);
//         }

//         const data = await res.json();
//         const products = Array.isArray(data) ? data : data.products || [];

//         // Filter products for this category & subcategory
//         const filtered = products.filter(
//           (item) =>
//             item.category.toLowerCase() === categoryName.toLowerCase() &&
//             item.subcategory.toLowerCase() === itemName.toLowerCase()
//         );

//         // Extract unique types and get first image for each type
//         const uniqueTypesMap = new Map();
//         filtered.forEach((item) => {
//           const typeKey = item.type.toLowerCase();
//           if (!uniqueTypesMap.has(typeKey)) {
//             const imageUrl =
//               item.images && item.images.length > 0
//                 ? item.images[0].url.startsWith("http")
//                   ? item.images[0].url
//                   : `http://192.168.29.236:5000${item.images[0].url}`
//                 : null;

//             uniqueTypesMap.set(typeKey, {
//               type: item.type,
//               image: imageUrl,
//             });
//           }
//         });

//         setTypes(Array.from(uniqueTypesMap.values()));
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setError("Failed to fetch products. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [categoryName, itemName]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-800">
//       <Nev />

//       <div className="max-w-7xl min-h-screen mx-auto px-4 py-10">
//         {/* Header */}
//         <div className="relative text-left mb-14">
//           <div className="absolute inset-0 -top-10 h-40 bg-gradient-to-r from-orange-200 via-purple-200 to-orange-200 opacity-30 blur-3xl rounded-3xl"></div>
//           <h1 className="relative text-5xl font-extrabold bg-gray-400 bg-clip-text text-transparent drop-shadow-md">
//             {itemName}
//           </h1>
//           <p className="relative mt-3 text-gray-600 text-lg tracking-wide">
//             Category: <span className="font-semibold text-gray-400">{categoryName}</span>
//           </p>
//           <div className="relative mt-4 flex justify-left space-x-2 text-sm text-gray-500">
//             <Link to="/" className="hover:text-orange-400 transition">Home</Link>
//             <span>/</span>
//             <Link to={`/category/${categoryName}`} className="hover:text-pink-400 transition">
//               {categoryName}
//             </Link>
//             <span>/</span>
//             <span className="text-gray-700 font-medium">{itemName}</span>
//           </div>
//         </div>

//         {/* Error */}
//         {error && (
//           <p className="text-red-500 text-center mb-6">{error}</p>
//         )}

//         {/* Types Grid */}
//         {loading ? (
//           <p className="text-center text-gray-500 text-lg">Loading types...</p>
//         ) : types.length > 0 ? (
//           <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//             {types.map(({ type, image }) => (
//               <Link
//                 key={type.toLowerCase()}
//                 to={`/category/${categoryName}/${itemName}/${type.toLowerCase()}`}
//                 className="bg-white/70 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 duration-300 flex flex-col overflow-hidden"
//               >
//                 {image ? (
//                   <img
//                     src={image}
//                     alt={`${type} ${itemName}`}
//                     className="w-full h-48 object-cover p-1 rounded-xl"
//                     loading="lazy"
//                   />
//                 ) : (
//                   <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
//                     No image available
//                   </div>
//                 )}
//                 <div className="p-5 flex flex-col flex-grow">
//                   <h2 className="text-xl font-bold text-gray-900 mb-2 capitalize">{type}</h2>
//                   <p className="text-gray-600 text-sm mt-auto">
//                     See all {type.toLowerCase()} {itemName.toLowerCase()}s
//                   </p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-600 col-span-full text-center">
//             No types found for this item.
//           </p>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default ItemPage;
