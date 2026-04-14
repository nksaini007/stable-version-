import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaHome, FaBoxOpen, FaClipboardList,
    FaSignOutAlt, FaChevronLeft, FaWallet, FaUserCircle
} from "react-icons/fa";
import { AuthContext } from "../../../../context/AuthContext";
import logo from "../../../../logo.png";

const menuItems = [
    { name: "Dashboard", path: "/provider", icon: <FaHome /> },
    { name: "Marketplace", path: "/provider/services", icon: <FaBoxOpen /> },
    { name: "Bookings", path: "/provider/bookings", icon: <FaClipboardList /> },
    { name: "Earnings", path: "/provider/earnings", icon: <FaWallet /> },
];

const ProviderSidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <aside className={`${collapsed ? "w-[80px]" : "w-72"} min-h-screen bg-[#0f172a] border-r border-white/5 flex flex-col transition-all duration-300 relative z-30 font-mono`}>
            <button onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 w-6 h-6 bg-[#1e293b] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all z-50 shadow-xl">
                <FaChevronLeft className={`text-[10px] transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>

            {/* Logo Section */}
            <div className={`px-6 py-8 border-b border-white/5 ${collapsed ? "text-center" : ""}`}>
                {collapsed ? (
                    <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-orange-500/20">S</div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-orange-500/20 flex-shrink-0">STN.</div>
                        <div className="min-w-0">
                            <h2 className="text-[14px] font-black text-white tracking-widest uppercase truncate">Provider_Node</h2>
                            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">v.4.1.0_ecosystem</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                {menuItems.map((item) => (
                    <NavLink key={item.name} to={item.path} end={item.path === "/provider"} title={collapsed ? item.name : ""}
                        className={({ isActive }) => `group flex items-center ${collapsed ? "justify-center" : ""} gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${isActive ? "bg-white/10 text-orange-500 border border-white/5 shadow-inner" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                        <span className={`text-[18px] flex-shrink-0 transition-transform duration-300 ${collapsed ? "group-hover:scale-110" : ""}`}>{item.icon}</span>
                        {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Profile Section */}
            <div className="p-4 border-t border-white/5 space-y-3">
                {!collapsed && user && (
                    <div className="p-4 rounded-3xl bg-[#1e293b]/50 border border-white/5 group hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white/40"><FaUserCircle /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-white truncate uppercase">{user.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">Active_Session</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} title="Logout"
                    className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all`}>
                    <FaSignOutAlt className="text-[18px]" />
                    {!collapsed && <span>System_Exit</span>}
                </button>
            </div>
        </aside>
    );
};

export default ProviderSidebar;
