import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FaThLarge,
  FaShoppingBag,
  FaHeart,
  FaUser,
  FaHeadset,
  FaHammer,
  FaSignOutAlt,
  FaChevronLeft,
  FaCrown,
  FaFileInvoice
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../../logo.png";

const CustomerSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const menuItems = [

    { name: "Home", icon: <FaHeart />, path: "/home" },
    { name: "Overview", icon: <FaThLarge />, path: "/dashboard/customer", end: true },
    { name: "My Orders", icon: <FaShoppingBag />, path: "/dashboard/customer/orders" },
    { name: "My Quotations", icon: <FaFileInvoice />, path: "/dashboard/customer/quotations" },
    { name: "Wishlist", icon: <FaHeart />, path: "/dashboard/customer/wishlist" },
    { name: "My Construction", icon: <FaHammer />, path: "/my-construction" },
    { name: "Profile", icon: <FaUser />, path: "/dashboard/customer/profile" },
    { name: "Support", icon: <FaHeadset />, path: "/dashboard/customer/support" },
  ];

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 }
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      <motion.aside
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className={`hidden md:flex flex-col h-screen bg-white border-r border-gray-200/60 sticky top-0 z-30 transition-all duration-300 ease-in-out`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 mb-2 relative">
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Stinchar Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Stinchar
              </span>
            </Link>
          ) : (
            <img src={logo} alt="Stinchar Logo" className="w-10 h-10 rounded-xl object-cover mx-auto shadow-sm" />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-600 shadow-sm z-50 transition-colors"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <FaChevronLeft size={10} />
            </motion.div>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-2 py-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? "bg-zinc-900 text-white font-medium shadow-sm shadow-zinc-900/10"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}
              `}
            >
              <div className={`text-lg transition-transform duration-200 group-hover:scale-110`}>
                {item.icon}
              </div>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-14 bg-gray-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Role Badge / Bottom Action */}
        <div className="p-4 border-t border-zinc-100 mt-auto">
          <div className={`bg-zinc-50 rounded-2xl p-3 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-[10px] font-medium shadow-sm">
              C
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-[13px] font-medium text-zinc-800 truncate">Customer</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Premium Account</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <FaCrown size={20} />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Stinchar</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-gray-400 p-2">
                  <FaChevronLeft />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all
                      ${isActive
                        ? "bg-zinc-900 text-white font-medium shadow-md shadow-zinc-900/10"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-base font-medium">{item.name}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => {/* handle logout */ }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-xl font-bold transition-all"
                >
                  <FaSignOutAlt />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomerSidebar;
