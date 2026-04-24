import React, { useState, useContext, useEffect } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import { FaBars, FaBell, FaSearch, FaUserCircle, FaSignOutAlt, FaThLarge, FaShoppingBag, FaHeart, FaUser, FaChevronLeft, FaHammer } from "react-icons/fa";
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
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        // Enforce no body padding/scrolling for the dashboard layout to fix the "white strip" issue
        const originalPadding = document.body.style.paddingBottom;
        const originalOverflow = document.body.style.overflow;
        
        document.body.style.paddingBottom = "0px";
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.paddingBottom = originalPadding;
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const handleContentScroll = (e) => {
        setScrolled(e.target.scrollTop > 10);
    };

    // Helper to get Page Title from location
    const getPageTitle = () => {
        const path = location.pathname.split("/").pop();
        if (!path || path === "customer") return "Overview";
        return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
    };

    return (
        <div className="h-screen flex bg-[#FAFAFA] text-zinc-900 overflow-hidden font-sans customer-theme">
            {/* Global Overrides for Premium Dashboard Theme */}
            <style>{`
                .customer-theme h1, .customer-theme h2, .customer-theme h3, .customer-theme h4 {
                    font-family: 'Outfit', sans-serif !important;
                    text-transform: none !important;
                    letter-spacing: normal !important;
                    font-weight: inherit !important;
                }
                .customer-theme .force-uppercase {
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                }
                .flex-1.overflow-y-auto {
                    background-color: #FAFAFA !important;
                }
            `}</style>
            
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
                            className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <FaBars size={22} />
                        </button>
                        <div>
                            <h2 className="text-lg sm:text-xl font-medium text-zinc-900 tracking-tight">{getPageTitle()}</h2>
                            <p className="text-[9px] sm:text-[10px] text-zinc-400 hidden sm:block uppercase tracking-widest font-medium mt-0.5">Customer Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:flex items-center bg-zinc-50/80 border border-zinc-200/50 rounded-2xl px-4 py-2 w-64 group focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-300 transition-all">
                            <FaSearch size={14} className="text-zinc-400 group-focus-within:text-zinc-900" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="bg-transparent border-none outline-none text-[13px] ml-3 w-full placeholder:text-zinc-400"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2.5 sm:p-3 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all">
                            <FaBell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>

                        {/* Profile Area */}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-gray-900">{user?.name || "Guest"}</p>
                                <button onClick={logout} className="text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase tracking-wider transition-colors">
                                    Sign Out
                                </button>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden shrink-0">
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
                <div 
                    className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 scroll-smooth pb-24 bg-[#FAFAFA]"
                    onScroll={handleContentScroll}
                >
                    <div className="max-w-7xl mx-auto pb-10">
                        <Outlet />
                    </div>
                </div>

                {/* Mobile Bottom Nav - Clean & Simple */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-zinc-100 flex items-center justify-around px-2 z-50">
                    <Link to="/dashboard/customer" className={`flex flex-col items-center gap-1 ${location.pathname === '/dashboard/customer' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        <FaThLarge size={14} />
                        <span className="text-[7px] font-medium uppercase tracking-widest mt-0.5">Home</span>
                    </Link>
                    <Link to="/dashboard/customer/orders" className={`flex flex-col items-center gap-1 ${location.pathname === '/dashboard/customer/orders' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        <FaShoppingBag size={14} />
                        <span className="text-[7px] font-medium uppercase tracking-widest mt-0.5">Orders</span>
                    </Link>
                    <Link to="/project-categories" className="flex flex-col items-center gap-0.5 text-zinc-400">
                        <div className="p-2.5 bg-zinc-900 text-white rounded-xl -mt-6 shadow-md shadow-zinc-900/10">
                            <FaBars size={14} />
                        </div>
                        <span className="text-[7px] font-medium uppercase tracking-widest mt-1">Explore</span>
                    </Link>
                    <Link to="/my-construction" className={`flex flex-col items-center gap-1 ${location.pathname === '/my-construction' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        <FaHammer size={14} />
                        <span className="text-[7px] font-medium uppercase tracking-widest mt-0.5">Status</span>
                    </Link>
                    <Link to="/profile" className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        <FaUserCircle size={14} />
                        <span className="text-[7px] font-medium uppercase tracking-widest mt-0.5">Account</span>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
