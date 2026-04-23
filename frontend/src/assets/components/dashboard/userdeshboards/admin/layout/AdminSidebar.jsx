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
  FaFileInvoice,
  FaDatabase
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
      { name: "Quotations", path: "/admin/quotations", icon: <FaFileInvoice /> },
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
      { name: "Project Registry", path: "/admin/projects", icon: <FaHardHat /> },
      { name: "Plan Alterations", path: "/admin/custom-requests", icon: <FaLayerGroup /> },
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
      { name: "Admin Pricing Control", path: "/admin/pricing-control", icon: <FaSlidersH /> },
      { name: "Custom Query", path: "/admin/custom-query", icon: <FaDatabase /> },
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
        } h-screen bg-[#1A1B1E] flex flex-col transition-all duration-400 ease-out border-r border-[#2A2B2F] relative shrink-0 z-40`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-[#2A2B2F] rounded-full border border-[#1A1B1E] flex items-center justify-center text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 z-50 cursor-pointer shadow"
      >
        <FaChevronLeft
          className={`text-[10px] transition-transform duration-500 ease-spring ${collapsed ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Logo */}
      <div className={`px-5 py-6 shrink-0 transition-all duration-300 ${collapsed ? "text-center" : "pl-6"}`}>
        {collapsed ? (
          <div className="w-8 h-8 mx-auto bg-white/10 border border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <span className="text-white font-black text-xl italic">S</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-6 h-6 bg-white/10 border border-white/10 rounded-md flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
              <span className="text-white font-black text-sm italic">S</span>
            </div>
            <div className="transition-transform duration-300 group-hover:translate-x-1">
              <h2 className="text-[18px] font-bold text-white tracking-wide">
                Stinchar
              </h2>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .admin-sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-thumb {
            background: #2A2B2F;
            border-radius: 10px;
          }
          .admin-sidebar-scroll:hover::-webkit-scrollbar-thumb {
            background: #3A3B3F;
          }
        `}
      </style>

      {/* Navigation list - Scrollable area */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto overflow-x-hidden space-y-7 admin-sidebar-scroll">

        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            {/* Section Header */}
            {!collapsed && (
              <h3 className="px-6 mb-2 mt-4 text-[11px] font-semibold text-[#8E929C] flex items-center justify-between">
                <span>{group.title}</span>
                <FaChevronLeft className="text-[8px] -rotate-90" />
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
                  `group relative flex items-center ${collapsed ? "justify-center mx-2 rounded-lg" : "px-6"
                  } gap-4 py-2.5 text-[13px] font-medium transition-all duration-200 ease-out overflow-hidden ${isActive
                    ? `text-white ${collapsed ? 'bg-[#2A2B2F]' : 'bg-[#2A2B2F]/40'}`
                    : "text-[#8E929C] hover:text-white hover:bg-[#2A2B2F]/20"
                  }`
                }
              >
                {/* Flat Active Style */}
                {({ isActive }) => (
                  <>
                    {!collapsed && isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r-sm"></div>
                    )}

                    <span className={`relative text-[15px] flex-shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "text-[#8E929C] group-hover:text-white"}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={`relative transition-colors duration-200 ${isActive ? "font-semibold text-white" : "text-[#8E929C] group-hover:text-white"}`}>
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

      {/* Free Trial Banner / Bottom Widgets */}
      <div className="p-4 space-y-3 shrink-0">


        {/* User Info */}
        {!collapsed && user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#2A2B2F]/30 border border-[#2A2B2F] cursor-pointer hover:bg-[#2A2B2F]/80 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#2A2B2F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {user.name || "Nero Design"}
                </p>
                <p className="text-[10px] text-[#8E929C] truncate">
                  {user.email || "nerodesigner@mail.com"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-[#8E929C] pr-1">
              <FaChevronLeft className="text-[8px] rotate-90" />
              <FaChevronLeft className="text-[8px] -rotate-90" />
            </div>
          </div>
        )}

        {/* Logout (condensed) */}
        <button
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center ${collapsed ? "justify-center w-full" : "justify-center w-full"
            } gap-2.5 py-2 rounded-xl text-xs font-semibold text-[#8E929C] hover:text-white hover:bg-[#2A2B2F] transition-colors`}
        >
          <FaSignOutAlt className="text-sm" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
