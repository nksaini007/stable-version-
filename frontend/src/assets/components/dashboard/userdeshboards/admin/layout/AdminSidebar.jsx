import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBox,
  FaClipboardList,
  FaMoneyBillWave,
  FaTruck,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaNewspaper,
  FaHardHat,
  FaMap,
  FaEnvelope,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaChartLine,
  FaCubes,
  FaHeadset,
  FaBullhorn,
  FaTag,
  FaSlidersH,
} from "react-icons/fa";
import { AuthContext } from "../../../../../context/AuthContext";
import logo from "../../../../../logo.png";

const menuGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", path: "/admin", icon: <FaHome /> },
      { name: "Analytics", path: "/admin/analytics", icon: <FaChartLine /> },
      { name: "User Map", path: "/admin/user-map", icon: <FaMapMarkerAlt /> },
    ]
  },
  {
    title: "E-Commerce",
    items: [
      { name: "Products", path: "/admin/products", icon: <FaBox /> },
      { name: "Orders", path: "/admin/orders", icon: <FaClipboardList /> },
      { name: "Delivery", path: "/admin/delivery", icon: <FaTruck /> },
      { name: "Delivery Pricing", path: "/admin/delivery-pricing", icon: <FaTag /> },
      { name: "Payments", path: "/admin/payments", icon: <FaMoneyBillWave /> },
    ]
  },
  {
    title: "Services & Construction",
    items: [
      { name: "Services", path: "/admin/services", icon: <FaBox /> },
      { name: "Bookings", path: "/admin/bookings", icon: <FaClipboardList /> },
      { name: "Construction", path: "/admin/construction", icon: <FaHardHat /> },
      { name: "Plan Categories", path: "/admin/plan-categories", icon: <FaLayerGroup /> },
      { name: "Plans Catalog", path: "/admin/plans", icon: <FaMap /> },
      { name: "Materials", path: "/admin/materials", icon: <FaCubes /> },
    ]
  },
  {
    title: "Community & Admin",
    items: [
      { name: "Users", path: "/admin/users", icon: <FaUsers /> },
      { name: "Posts", path: "/admin/posts", icon: <FaNewspaper /> },
      { name: "Ad Campaigns", path: "/admin/ad-campaigns", icon: <FaBullhorn /> },
      { name: "Support", path: "/admin/support", icon: <FaHeadset /> },
      { name: "Inquiries", path: "/admin/messages", icon: <FaEnvelope /> },
      { name: "Site Content", path: "/admin/site-config", icon: <FaLayerGroup /> },
      { name: "Pricing Control", path: "/admin/pricing-control", icon: <FaSlidersH /> },
    ]
  }
];

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"
        } h-screen bg-gradient-to-b from-[#0a0f1c] via-[#0f172a] to-[#0a0f1c] flex flex-col transition-all duration-400 ease-out border-r border-white/5 relative shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-40`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white hover:shadow-[0_0_12px_rgba(59,130,246,0.8)] hover:scale-110 transition-all duration-300 z-50 cursor-pointer shadow-lg"
      >
        <FaChevronLeft
          className={`text-[10px] transition-transform duration-500 ease-spring ${collapsed ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Logo */}
      <div className={`px-5 py-6 border-b border-white/5 shrink-0 transition-all duration-300 ${collapsed ? "text-center" : ""}`}>
        {collapsed ? (
          <img src={logo} alt="S" className="w-10 h-10 mx-auto rounded-xl object-cover shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105 hover:rotate-3 cursor-pointer" />
        ) : (
          <div className="flex items-center gap-4 cursor-pointer group">
            <img src={logo} alt="S" className="w-10 h-10 rounded-xl object-cover shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <div className="transition-transform duration-300 group-hover:translate-x-1">
              <h2 className="text-[16px] font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-300 tracking-wider">
                STINCHAR
              </h2>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.2em] mt-0.5">
                Admin Panel
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles for Webkit */}
      <style>
        {`
          .admin-sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.5), transparent);
            border-radius: 10px;
          }
          .admin-sidebar-scroll:hover::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.8), rgba(59, 130, 246, 0.3));
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          }
        `}
      </style>

      {/* Navigation list - Scrollable area */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto overflow-x-hidden space-y-7 admin-sidebar-scroll">

        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            {/* Section Header */}
            {!collapsed && (
              <h3 className="px-4 mb-3 text-[10px] font-bold text-gray-400/70 uppercase tracking-[0.15em]">
                {group.title}
              </h3>
            )}

            {/* Links */}
            {group.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/admin"}
                title={collapsed ? item.name : ""}
                className={({ isActive }) =>
                  `group relative flex items-center ${collapsed ? "justify-center" : "px-4"
                  } gap-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ease-out overflow-hidden ${isActive
                    ? "bg-gray-500/10 text-gray-400 shadow-[inset_4px_0_0_0_#3b82f6]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent hover:shadow-[inset_2px_0_0_0_rgba(255,255,255,0.2)]"
                  }`
                }
              >
                {/* Background Glow Effect on Active */}
                {({ isActive }) => (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-r from-gray-500/10 to-transparent opacity-0 transition-opacity duration-300 ${isActive ? "opacity-100" : "group-hover:opacity-50"}`}></div>

                    <span className={`relative text-[16px] flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-110 text-gray-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "group-hover:scale-110 group-hover:text-gray-300"}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={`relative transition-all duration-300 ${isActive ? "font-semibold tracking-wide" : "group-hover:translate-x-1"}`}>
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Info + Logout stick to bottom */}
      <div className="p-4 border-t border-white/5 space-y-3 shrink-0 bg-[#0a0f1c]/50 backdrop-blur-md">
        {!collapsed && user && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 flex items-center gap-3 backdrop-blur-sm shadow-inner transition-all duration-300 hover:border-white/10 hover:bg-white/10 cursor-default group">
            <div className="w-8 h-8 rounded-full bg-gray-500/20 text-gray-400 flex items-center justify-center font-bold uppercase shrink-0 ring-1 ring-gray-500/30 group-hover:ring-gray-400 transition-all duration-300">
              {user.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                {user.name}
              </p>
              <p className="text-[10px] text-gray-500 truncate group-hover:text-gray-300/80 transition-colors">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className={`group w-full flex items-center ${collapsed ? "justify-center" : "justify-center"
            } gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-red-400/80 hover:text-white bg-red-500/5 hover:bg-red-500 border border-red-500/10 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300 cursor-pointer overflow-hidden relative`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <FaSignOutAlt className="text-[14px] z-10 transition-transform duration-300 group-hover:-translate-x-1" />
          {!collapsed && <span className="z-10 tracking-wide">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
