import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/api";
import Nev from "./Nev";
import Footer from "./Footer";
import { FaBoxes } from "react-icons/fa";
import PublicAds from "./PublicAds";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Convert image filename to full URL
  const getImageUrl = (img) => {
    if (!img) return null;
    const cleanImg = img.replace(/^\/+/, "");
    return img.startsWith("http")
      ? img
      : `/${cleanImg}`;
  };

  // Fetch category
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await API.get(`/categories`);
        const matched = res.data.find(
          (item) => item.name.toLowerCase() === categoryName.toLowerCase()
        );
        setCategory(matched || null);
      } catch (err) {
        console.error("Error fetching category:", err);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryName]);

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading category...
      </div>
    );
  }

  // Category not found
  if (!category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Nev />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-gray-500 text-lg mb-4">
            Category not found.
          </p>
          <Link
            to="/"
            className="text-yellow-500 font-semibold hover:underline"
          >
            Go back home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Nev />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Category Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full mb-8 relative rounded-xl overflow-hidden shadow"
        >
          {category.image ? (
            <img
              src={getImageUrl(category.image)}
              alt={category.name}
              className="w-full h-52 sm:h-64 md:h-72 object-cover"
            />
          ) : (
            <div className="w-full h-52 flex items-center justify-center bg-gray-200">
              <FaBoxes className="text-5xl text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-3 left-4 text-white text-2xl sm:text-3xl font-bold drop-shadow capitalize">
            {category.name}
          </div>
        </motion.div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-yellow-500 font-medium">
            Home
          </Link>{" "}
          / <span className="text-gray-700 font-semibold">{category.name}</span>
        </div>

        {/* Contextual Ads */}
        <PublicAds category={category.name} />

        {/* Subcategories Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6"
        >
          {category.subcategories && category.subcategories.length > 0 ? (
            category.subcategories.map((sub, index) => (
              <motion.div
                key={sub._id || index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  to={`/category/${categoryName}/${sub.name.toLowerCase()}`}
                  className="block bg-white border border-gray-200 rounded-xl p-2 shadow-sm hover:shadow-md transition"
                >
                  {/* Image */}
                  {sub.image ? (
                    <img
                      src={getImageUrl(sub.image)}
                      alt={sub.name}
                      className="w-full h-28 sm:h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-28 flex items-center justify-center bg-gray-100 rounded-lg">
                      <FaBoxes className="text-gray-400" />
                    </div>
                  )}

                  {/* Text */}
                  <h6 className="mt-2 text-sm sm:text-base font-semibold capitalize">
                    {sub.name}
                  </h6>

                  <p className="text-xs text-gray-600 hidden sm:block">
                    Explore all items
                  </p>


                </Link>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No subcategories available.
            </p>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;

// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import axios from "axios";
// import Nev from "./Nev";
// import Footer from "./Footer";
// import { FaBoxes } from "react-icons/fa";

// const CategoryPage = () => {
//   const { categoryName } = useParams();
//   const [category, setCategory] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Convert image filename to full URL
//   const getImageUrl = (img) => {
//     if (!img) return null;
//     const cleanImg = img.replace(/^\/+/, "");
//     return img.startsWith("http") ? img : `/${cleanImg}`;
//   };

//   // Fetch all categories from backend
//   useEffect(() => {
//     const fetchCategory = async () => {
//       try {
//         const res = await API.get(`/categories`);
//         const matched = res.data.find(
//           (item) => item.name.toLowerCase() === categoryName.toLowerCase()
//         );
//         setCategory(matched || null);
//       } catch (err) {
//         console.error("Error fetching category:", err);
//         setCategory(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCategory();
//   }, [categoryName]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
//         Loading category...
//       </div>
//     );
//   }

//   if (!category) {
//     return (
//       <div className="flex flex-col min-h-screen">
//         <Nev />
//         <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 text-center">
//           <p className="text-gray-500 text-lg">Category not found.</p>
//           <Link
//             to="/"
//             className="mt-4 inline-block text-orange-500 font-semibold hover:text-orange-600 transition"
//           >
//             Go back home
//           </Link>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 text-gray-800 flex flex-col">
//       <Nev />

//       <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-12">

//         {/* Category Banner Image */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           className="w-full mb-12 relative rounded-2xl overflow-hidden shadow-lg"
//         >
//           {category.image ? (
//             <img
//               src={getImageUrl(category.image)}
//               alt={category.name}
//               className="w-full h-64 md:h-80 lg:h-96 object-cover"
//             />
//           ) : (
//             <div className="w-full h-64 md:h-80 lg:h-96 flex items-center justify-center bg-gray-200">
//               <FaBoxes className="text-6xl text-gray-400" />
//             </div>
//           )}
//           <div className="absolute bottom-4 left-6 text-white text-3xl md:text-4xl font-bold shadow-lg capitalize">
//             {category.name}
//           </div>
//         </motion.div>

//         {/* Breadcrumb */}
//         <div className="text-sm text-gray-500 mb-8">
//           <Link
//             to="/"
//             className="hover:text-yellow-500 font-medium transition duration-300"
//           >
//             Home
//           </Link>{" "}
//           / <span className="text-gray-600 font-semibold">{category.name}</span>
//         </div>

//         {/* Subcategories */}
//         <motion.div
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           variants={{
//             hidden: {},
//             visible: { transition: { staggerChildren: 0.15 } },
//           }}
//           className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
//         >
//           {category.subcategories && category.subcategories.length > 0 ? (
//             category.subcategories.map((sub, index) => (
//               <motion.div
//                 key={sub._id || index}
//                 variants={{
//                   hidden: { opacity: 0, y: 20 },
//                   visible: { opacity: 1, y: 0 },
//                 }}
//               >
//                 <Link
//                   to={`/category/${categoryName}/${sub.name.toLowerCase()}`}
//                   className="block  bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-2 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                 >
//                   {/* Subcategory Image */}
//                   {sub.image && (
//                     <img
//                       src={getImageUrl(sub.image)}
//                       alt={sub.name}
//                       className="w-full h-36 object-cover rounded-xl "
//                     />
//                   )}
//                   <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
//                     {sub.name}
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Explore all “{sub.name}” items.
//                   </p>
//                   <div className="mt-3 text-yellow-500 font-medium">Browse →</div>
//                 </Link>
//               </motion.div>
//             ))
//           ) : (
//             <p className="text-gray-500 text-center col-span-full">
//               No subcategories available.
//             </p>
//           )}
//         </motion.div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default CategoryPage;
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import axios from "axios";
// import Nev from "./Nev";
// import Footer from "./Footer";
// import { FaBoxes, FaChevronRight } from "react-icons/fa";

// /**
//  * CategoryPage
//  * - Professional layout: hero banner, meta row, breadcrumb, subcategory grid
//  * - Skeleton loading, error handling, lazy images
//  * - Accessible focus states and keyboard-friendly links
//  */

// const fadeUp = {
//   hidden: { opacity: 0, y: 12 },
//   visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } }),
// };

// const CategoryPage = () => {
//   const { categoryName } = useParams();
//   const [category, setCategory] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Convert image filename to full URL
//   const getImageUrl = (img) => {
//     if (!img) return null;
//     const cleanImg = img.replace(/^\/+/, "");
//     return img.startsWith("http") ? img : `/${cleanImg}`;
//   };

//   useEffect(() => {
//     let mounted = true;
//     const fetchCategory = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await API.get(`/categories`);
//         if (!mounted) return;
//         const matched = Array.isArray(res.data)
//           ? res.data.find((item) => item.name.toLowerCase() === categoryName.toLowerCase())
//           : null;
//         setCategory(matched || null);
//       } catch (err) {
//         console.error("Error fetching category:", err);
//         if (!mounted) return;
//         setError("Unable to load category. Please refresh or try again later.");
//         setCategory(null);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     fetchCategory();
//     return () => (mounted = false);
//   }, [categoryName]);

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
//       <Nev />

//       <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10">
//         {/* Loading state */}
//         {loading && (
//           <div className="animate-pulse space-y-6">
//             <div className="h-56 rounded-2xl bg-gray-200" />
//             <div className="h-6 w-44 bg-gray-200 rounded" />
//             <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//               {Array.from({ length: 8 }).map((_, i) => (
//                 <div key={i} className="space-y-3">
//                   <div className="h-36 bg-gray-200 rounded-lg" />
//                   <div className="h-4 bg-gray-200 rounded w-3/4" />
//                   <div className="h-3 bg-gray-200 rounded w-1/2" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Error or not found */}
//         {!loading && error && (
//           <div className="text-center py-12">
//             <p className="text-red-600 font-medium mb-4">{error}</p>
//             <Link
//               to="/"
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-500 text-black font-semibold hover:bg-yellow-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
//             >
//               Go Home
//             </Link>
//           </div>
//         )}

//         {!loading && !error && !category && (
//           <div className="text-center py-12">
//             <p className="text-gray-600 text-lg">Category not found.</p>
//             <Link
//               to="/"
//               className="mt-4 inline-block text-yellow-500 font-semibold hover:text-yellow-600 transition"
//             >
//               Go back home
//             </Link>
//           </div>
//         )}

//         {/* Content */}
//         {!loading && !error && category && (
//           <>
//             {/* Banner */}
//             <motion.header
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//               className="relative rounded-2xl overflow-hidden shadow-sm mb-8"
//               aria-labelledby="category-title"
//             >
//               {category.image ? (
//                 <img
//                   src={getImageUrl(category.image)}
//                   alt={category.name}
//                   className="w-full h-64 md:h-72 lg:h-96 object-cover"
//                   loading="lazy"
//                 />
//               ) : (
//                 <div className="w-full h-64 md:h-72 lg:h-96 flex items-center justify-center bg-gray-100">
//                   <FaBoxes className="text-7xl text-gray-300" aria-hidden />
//                 </div>
//               )}

//               {/* Overlay */}
//               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
//               <div className="absolute left-6 bottom-6 text-white">
//                 <h1 id="category-title" className="text-2xl md:text-4xl font-extrabold leading-tight capitalize drop-shadow">
//                   {category.name}
//                 </h1>
//                 {category.description && (
//                   <p className="mt-2 max-w-xl text-sm md:text-base text-white/90">
//                     {category.description}
//                   </p>
//                 )}
//               </div>

//               {/* Quick meta pill */}
//               <div className="absolute right-6 top-6 flex items-center gap-3">
//                 <div className="bg-white/90 text-gray-800 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
//                   {category.subcategories?.length || 0} subcategories
//                 </div>
//               </div>
//             </motion.header>

//             {/* Meta row / breadcrumb */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//               <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
//                 <Link to="/" className="hover:text-gray-700 font-medium">
//                   Home
//                 </Link>
//                 <span className="mx-2 text-gray-400">/</span>
//                 <span className="font-semibold text-gray-700">{category.name}</span>
//               </nav>

//               <div className="flex items-center gap-3">
//                 <Link
//                   to={`/category/${categoryName}`}
//                   className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
//                 >
//                   <span className="text-yellow-500">Explore all</span>
//                   <FaChevronRight className="text-gray-500" />
//                 </Link>
//               </div>
//             </div>

//             {/* Subcategories grid */}
//             <motion.section
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
//             >
//               {category.subcategories && category.subcategories.length > 0 ? (
//                 category.subcategories.map((sub, idx) => (
//                   <motion.article
//                     key={sub._id || idx}
//                     variants={fadeUp}
//                     custom={idx * 0.04}
//                     className="group"
//                   >
//                     <Link
//                       to={`/category/${categoryName}/${encodeURIComponent(sub.name.toLowerCase())}`}
//                       className="block rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
//                     >
//                       <div className="relative h-44 md:h-40 bg-gray-50 overflow-hidden">
//                         {sub.image ? (
//                           <img
//                             src={getImageUrl(sub.image)}
//                             alt={sub.name}
//                             loading="lazy"
//                             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                             <FaBoxes className="text-4xl text-gray-300" />
//                           </div>
//                         )}
//                       </div>

//                       <div className="p-4">
//                         <h3 className="text-lg font-semibold text-gray-800 mb-1 capitalize">
//                           {sub.name}
//                         </h3>
//                         <p className="text-sm text-gray-500">{sub.description || `Explore ${sub.name} items`}</p>
//                         <div className="mt-4 flex items-center justify-between">
//                           <span className="text-sm font-medium text-yellow-500">Browse →</span>
//                           <span className="text-xs text-gray-400">{sub.count ? `${sub.count} items` : ""}</span>
//                         </div>
//                       </div>
//                     </Link>
//                   </motion.article>
//                 ))
//               ) : (
//                 <p className="text-gray-500 text-center col-span-full">No subcategories available.</p>
//               )}
//             </motion.section>
//           </>
//         )}
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default CategoryPage;
