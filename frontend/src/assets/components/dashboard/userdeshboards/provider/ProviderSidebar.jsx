import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaHome, FaBoxOpen, FaClipboardList,
    FaSignOutAlt, FaChevronLeft, FaStore,
} from "react-icons/fa";
import { AuthContext } from "../../../../context/AuthContext";
import logo from "../../../../logo.png";

const menuItems = [
    { name: "Dashboard", path: "/provider", icon: <FaHome /> },
    { name: "My Services", path: "/provider/services", icon: <FaBoxOpen /> },
    { name: "Bookings", path: "/provider/bookings", icon: <FaClipboardList /> },
];

const ProviderSidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <aside className={`${collapsed ? "w-[72px]" : "w-64"} min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col transition-all duration-300 border-r border-white/5 relative`}>
            <button onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-7 w-6 h-6 bg-[#16213e] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1a2e] transition-all z-50 shadow-lg">
                <FaChevronLeft className={`text-[10px] transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>

            <div className={`px-5 py-6 border-b border-white/5 ${collapsed ? "text-center" : ""}`}>
                {collapsed ? (
                    <img src={logo} alt="S" className="w-9 h-9 mx-auto rounded-xl object-cover shadow-lg shadow-orange-500/20" />
                ) : (
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="S" className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-orange-500/20" />
                        <div>
                            <h2 className="text-[15px] font-bold text-white tracking-wide">Provider Panel</h2>
                            <p className="text-[10px] text-orange-400 font-medium uppercase tracking-widest">Stinchar</p>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 py-5 space-y-1">
                {menuItems.map((item) => (
                    <NavLink key={item.name} to={item.path} end={item.path === "/provider"} title={collapsed ? item.name : ""}
                        className={({ isActive }) => `group flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive ? "bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                        <span className="text-[15px] flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 py-4 border-t border-white/5 space-y-2">
                {!collapsed && user && (
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                )}
                <button onClick={handleLogout} title="Logout"
                    className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all`}>
                    <FaSignOutAlt className="text-[15px]" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default ProviderSidebar;
