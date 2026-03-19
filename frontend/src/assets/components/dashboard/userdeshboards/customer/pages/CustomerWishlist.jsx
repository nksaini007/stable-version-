import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { FaHeart, FaTrash, FaShoppingCart, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CustomerWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: This logic assumes a wishlist endpoint exists or uses a mock for demonstration
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // const { data } = await API.get("/users/wishlist");
        // setWishlist(data);
        setWishlist([]); // Mocking empty for now
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
         <div>
            <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">My Wishlist</h3>
            <p className="text-sm text-gray-400 font-medium">Items you've saved for later.</p>
         </div>
         <div className="bg-gray-50 px-4 py-2 rounded-2xl flex items-center gap-2 text-orange-600 font-bold text-sm">
            <FaHeart /> {wishlist.length} Items Saved
         </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
           <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart size={40} className="text-red-200" />
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mb-2">Wishlist is Empty</h3>
           <p className="text-gray-400 font-medium px-4">See something you like? Heart it to save it here for later.</p>
           <Link to="/project-categories" className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold inline-block hover:bg-black transition-all shadow-xl shadow-gray-900/10">Explore Catalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {wishlist.map((item, idx) => (
             <motion.div 
               key={item._id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-2xl transition-all group"
             >
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative mb-4">
                   <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md text-red-500 rounded-xl flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all">
                      <FaTrash size={14} />
                   </button>
                </div>
                <div className="px-2">
                   <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                   <p className="text-xl font-bold text-orange-500 mt-1">₹{item.price?.toLocaleString()}</p>
                   <button className="w-full mt-4 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors">
                      <FaShoppingCart /> Add to Cart
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
};

export default CustomerWishlist;
