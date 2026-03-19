import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaShoppingCart, FaSignOutAlt, FaTachometerAlt, FaMap, FaEnvelope, FaHeadset } from "react-icons/fa";
import img from "../img/admin.jpg";

const ProfileDropdown = ({ user, logout, mobile }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine dashboard link based on role
  let dashboardLink = "/dashboard";
  if (user?.role === "customer" || user?.role === "user") dashboardLink = "/customer";
  if (user?.role === "provider") dashboardLink = "/provider";
  if (user?.role === "delivery") dashboardLink = "/delivery";
  if (user?.role === "architect") dashboardLink = "/architect";
  if (user?.role === "admin") dashboardLink = "/admin";

  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt className="text-gray-400" />, to: dashboardLink },
    { label: "Cart", icon: <FaShoppingCart className="text-gray-400" />, to: "/cart" },
    { label: "Profile Settings", icon: <FaUserCircle className="text-gray-400" />, to: user?.role === "customer" || user?.role === "user" ? "/profile" : "/profile" },
  ];

  menuItems.push({ label: "Project Plans", icon: <FaMap className="text-gray-400" />, to: "/project-plans" });
  menuItems.push({ label: "Messages", icon: <FaEnvelope className="text-gray-400" />, to: user?.role === "customer" || user?.role === "user" ? "/my-inquiries" : "/customer/orders" });
  menuItems.push({ label: "Support Tickets", icon: <FaHeadset className="text-gray-400" />, to: user?.role === "customer" || user?.role === "user" ? "/support" : "/support" });

  return (
    <div className="relative md:ml-4" ref={dropdownRef}>
      {/* Profile Image Trigger */}
      {mobile ? (
        <div
          onClick={() => setOpen(!open)}
          className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            <img src={user?.profileImage || img} alt="User" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] font-medium tracking-wide">Account</span>
        </div>
      ) : (
        <div
          className="relative cursor-pointer group"
          onClick={() => setOpen(!open)}
        >
          <img
            src={user?.profileImage ? `${user.profileImage}` : img}
            alt="Profile"
            className="relative w-10 h-10 rounded-full border-2 border-transparent group-hover:border-indigo-100 shadow-sm object-cover transition-all"
          />
        </div>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop for Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Desktop Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden hidden md:block"
            >
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "Guest User"}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email || "Sign in to access your account"}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user?.role || "Visitor"}
                </div>
              </div>

              <div className="flex flex-col py-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all group relative"
                    onClick={() => setOpen(false)}
                  >
                    <span className="group-hover:text-indigo-500 transition-colors">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}

                <div className="h-px w-full bg-gray-100 my-2"></div>

                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all group"
                >
                  <span className="group-hover:text-red-700"><FaSignOutAlt /></span>
                  Sign Out
                </button>
              </div>
            </motion.div>

            {/* Mobile Full-Screen Menu */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 h-[75vh] bg-white border-t border-gray-200 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-6 z-50 flex flex-col gap-2 md:hidden"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full"></div>

              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100 mt-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{user?.name || "Guest User"}</h3>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {user?.role || "Visitor"}
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center gap-4 px-4 py-4 mb-2 text-gray-700 bg-gray-50 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-sm font-medium shadow-sm"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-lg text-gray-400 group-hover:text-indigo-500">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="flex items-center justify-center gap-3 w-full mt-4 px-4 py-4 text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-wide shadow-sm"
              >
                <FaSignOutAlt />
                Sign Out
              </button>

              <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 5px; }
              `}</style>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
