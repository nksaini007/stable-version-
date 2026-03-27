import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaHardHat, FaSignOutAlt, FaChevronLeft, FaUser, FaRegCalendarAlt, FaFileAlt, FaChartLine, FaPalette, FaUsers, FaCubes, FaHeadset, FaBuilding } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../../../context/AuthContext";
import logo from "../../../../logo.png";

const menuItems = [
    { name: "Dashboard", path: "/architect", icon: <FaHome /> },
    { name: "My Catalog", path: "/architect/work", icon: <FaPalette /> },
    { name: "Labor", path: "/architect/labor", icon: <FaUsers /> },
    { name: "Materials", path: "/architect/materials", icon: <FaCubes /> },
    { name: "My Office", path: "/architect/office", icon: <FaBuilding /> },
    // { name: "Support", path: "/architect/support", icon: <FaHeadset /> },
    // { name: "Calendar", path: "/architect/calendar", icon: <FaRegCalendarAlt /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
];

const ArchitectSidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside
            className={`${collapsed ? "w-[80px]" : "w-72"
                } min-h-screen bg-[#0C0C0C] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white-[0.03] relative z-50`}
        >
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-10 w-6 h-6 bg-[#1A1A1C] border border-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all z-50 shadow-2xl"
            >
                <FaChevronLeft
                    className={`text-[9px] transition-transform duration-500 ${collapsed ? "rotate-180" : ""
                        }`}
                />
            </button>

            <div className={`px-6 py-10 ${collapsed ? "text-center" : ""}`}>
                {collapsed ? (
                    <img src={logo} alt="S" className="w-10 h-10 mx-auto rounded-2xl object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
                ) : (
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <img src={logo} alt="S" className="w-11 h-11 rounded-2xl object-cover shadow-2xl shadow-white/5 group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="text-[14px] font-bold text-white tracking-[0.1em] uppercase whitespace-nowrap">Architect</h2>
                            <p className="text-[9px] text-gray-500 font-medium uppercase tracking-[0.2em] mt-0.5">Stinchar Studio</p>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === "/architect"}
                        title={collapsed ? item.name : ""}
                        className={({ isActive }) =>
                            `group flex items-center ${collapsed ? "justify-center" : ""
                            } gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-medium transition-all duration-500 ${isActive
                                ? "bg-[#1A1A1C] text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/[0.05]"
                                : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`text-[17px] transition-all duration-500 flex-shrink-0 group-hover:scale-110`}>
                                    {item.icon}
                                </span>
                                {!collapsed && <span className="tracking-wide">{item.name}</span>}
                                {isActive && !collapsed && (
                                    <motion.div layoutId="active-pill" className="ml-auto w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]"></motion.div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="px-5 py-8 border-t border-white-[0.03] space-y-4 bg-[#090909]/50 backdrop-blur-md">
                {!collapsed && user && (
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-9 h-9 rounded-full bg-[#1A1A1C] border border-white/5 flex items-center justify-center text-gray-400 text-xs font-bold uppercase overflow-hidden shadow-inner">
                            {user.profileImg ? (
                                <img 
                                    src={user.profileImg} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover grayscale opacity-80" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "";
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : null}
                            <span>{user.name?.charAt(0)}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[12px] font-semibold text-white truncate lowercase ">{user.name}</p>
                            <p className="text-[9px] text-gray-600 truncate uppercase tracking-tighter">{user.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className={`w-full flex items-center ${collapsed ? "justify-center" : ""
                        } gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.03] transition-all duration-500 group`}
                >
                    <FaSignOutAlt className="text-[17px] group-hover:scale-110 transition-transform" />
                    {!collapsed && <span className="tracking-wide">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default ArchitectSidebar;
