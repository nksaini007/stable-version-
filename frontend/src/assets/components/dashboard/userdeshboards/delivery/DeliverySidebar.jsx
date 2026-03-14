import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaBoxOpen, FaRoute, FaWallet,
    FaSignOutAlt, FaChevronLeft, FaTruck,
} from "react-icons/fa";
import { AuthContext } from "../../../../context/AuthContext";

const menuItems = [
    { name: "Overview", path: "/delivery", icon: <FaBoxOpen /> },
    { name: "Assigned Orders", path: "/delivery/orders", icon: <FaRoute /> },
    { name: "Earnings", path: "/delivery/earnings", icon: <FaWallet /> },
];

const DeliverySidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <aside className={`${collapsed ? "w-[72px]" : "w-64"} min-h-screen bg-[#0f172a] flex flex-col transition-all duration-300 border-r border-white/5 relative z-40 shadow-2xl`}>

            {/* Collapse Toggle Button */}
            <button onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-7 w-6 h-6 bg-[#1e293b] border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all z-50 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <FaChevronLeft className={`text-[10px] transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>

            {/* Logo area */}
            <div className={`px-5 py-6 border-b border-white/5 ${collapsed ? "text-center" : ""}`}>
                {collapsed ? (
                    <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">D</div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <FaTruck />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-white tracking-wide">Fleet Hub</h2>
                            <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-widest">Stinchar Delivery</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-6 space-y-2">
                {[
                    { name: "Overview", tabId: "overview", icon: <FaBoxOpen /> },
                    { name: "Assigned Orders", tabId: "assigned", icon: <FaRoute /> },
                    { name: "Earnings", tabId: "payments", icon: <FaWallet /> },
                ].map((item) => (
                    <button key={item.name} onClick={() => navigate(`/delivery?tab=${item.tabId}`)} title={collapsed ? item.name : ""}
                        className={`w-full group flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent`}>
                        <span className={`text-[16px] flex-shrink-0 transition-colors text-slate-500 group-hover:text-cyan-400`}>
                            {item.icon}
                        </span>
                        {!collapsed && <span>{item.name}</span>}
                    </button>
                ))}
            </nav>

            {/* Bottom Profile / Logout section */}
            <div className="px-3 py-5 border-t border-white/5 bg-black/20 backdrop-blur-md">
                {!collapsed && user && (
                    <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-white/5 border border-white/5">
                        <img
                            src={user?.profileImage ? `${user.profileImage}` : "https://via.placeholder.com/40"}
                            alt="Profile Avatar"
                            className="w-8 h-8 rounded-full border border-cyan-500/30"
                        />
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-cyan-400 truncate capitalize">{user.role} Partner</p>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} title="Logout"
                    className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-rose-400 hover:text-rose-100 hover:bg-rose-500/20 hover:border hover:border-rose-500/30 transition-all`}>
                    <FaSignOutAlt className="text-[15px]" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default DeliverySidebar;
