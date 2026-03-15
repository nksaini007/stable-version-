import React, { useState, useContext, useEffect } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import { FaBars, FaBell, FaSearch, FaUserCircle, FaSignOutAlt, FaThLarge, FaShoppingBag, FaHeart, FaUser, FaChevronLeft } from "react-icons/fa";
import { AuthContext } from "../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const CustomerLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Protection logic
    if (!user || (user.role !== "customer" && user.role !== "user")) {
        // Many systems use "user" as the default role for customers
        // return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Helper to get Page Title from location
    const getPageTitle = () => {
        const path = location.pathname.split("/").pop();
        if (!path || path === "customer") return "Overview";
        return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
    };

    return (
        <div className="h-screen flex bg-[#fbfcfd] overflow-hidden font-sans">
            {/* Overlay for mobile sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <CustomerSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header
                    className={`sticky top-0 z-30 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-gray-500 hover:text-orange-500 transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <FaBars size={22} />
                        </button>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h2>
                            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block uppercase tracking-widest font-semibold mt-0.5">Customer Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:flex items-center bg-gray-100/80 border border-gray-200/50 rounded-2xl px-4 py-2 w-64 group focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                            <FaSearch size={14} className="text-gray-400 group-focus-within:text-orange-500" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="bg-transparent border-none outline-none text-sm ml-3 w-full placeholder:text-gray-400"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2.5 sm:p-3 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all">
                            <FaBell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>

                        {/* Profile Dropdown (Simplified) */}
                        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{user?.name || "Guest User"}</p>
                                <button onClick={logout} className="text-[10px] text-gray-500 hover:text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 justify-end ml-auto">
                                    Logout <FaSignOutAlt />
                                </button>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border-2 border-white overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUserCircle size={24} />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-10">
                        <Outlet />
                    </div>
                </div>

                {/* Mobile Bottom Nav (For better UX on phones) */}
                <div className="md:hidden h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-30">
                    <Link to="/customer" className={`p-2 flex flex-col items-center ${location.pathname === '/customer' ? 'text-orange-500' : 'text-gray-400'}`}>
                        <FaThLarge size={20} />
                        <span className="text-[10px] font-bold mt-1">Home</span>
                    </Link>
                    <Link to="/customer/orders" className={`p-2 flex flex-col items-center ${location.pathname === '/customer/orders' ? 'text-orange-500' : 'text-gray-400'}`}>
                        <FaShoppingBag size={20} />
                        <span className="text-[10px] font-bold mt-1">Orders</span>
                    </Link>
                    <Link to="/cart" className="p-2 flex flex-col items-center text-gray-400">
                        <div className="p-3 bg-gray-900 text-white rounded-2xl -mt-10 shadow-xl shadow-gray-900/30">
                            <FaChevronLeft size={20} className="rotate-90" />
                        </div>
                        <span className="text-[10px] font-bold mt-4">Cart</span>
                    </Link>
                    <Link to="/customer/wishlist" className={`p-2 flex flex-col items-center ${location.pathname === '/customer/wishlist' ? 'text-orange-500' : 'text-gray-400'}`}>
                        <FaHeart size={20} />
                        <span className="text-[10px] font-bold mt-1">Saved</span>
                    </Link>
                    <Link to="/profile" className={`p-2 flex flex-col items-center ${location.pathname === '/profile' ? 'text-orange-500' : 'text-gray-400'}`}>
                        <FaUser size={20} />
                        <span className="text-[10px] font-bold mt-1">Menu</span>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
