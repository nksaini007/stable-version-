import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FaSearch, FaPlus, FaShare } from "react-icons/fa";
import { BsGrid1X2Fill } from "react-icons/bs";
import AdminSidebar from "./AdminSidebar";
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();

  // Helper to format path into a readable title
  const getPageTitle = () => {
    const path = location.pathname.split("/admin")[1];
    if (!path || path === "/") return "Dashboard";
    const segment = path.split("/")[1];
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
  };

  return (
    <div className="h-screen flex bg-[#121212] text-white overflow-hidden font-sans">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
        {/* Top bar (Tempo Style) */}
        <div className="sticky top-0 z-20 h-16 bg-[#121212] border-b border-[#2A2B2F] flex items-center justify-between px-8 shrink-0">
          
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <BsGrid1X2Fill className="text-gray-400 text-sm" />
            <h2 className="text-[15px] font-semibold tracking-wide text-white">{getPageTitle()}</h2>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Search Pill */}
            <div className="flex items-center bg-[#1A1B1E] border border-[#2A2B2F] rounded-full px-4 py-1.5 h-9 w-[280px] hover:border-gray-600 transition-colors">
              <FaSearch className="text-gray-500 text-xs shrink-0" />
              <input 
                type="text" 
                placeholder="Search Anything..." 
                className="bg-transparent border-none outline-none text-xs text-gray-300 w-full px-2 placeholder-gray-500"
              />
              <div className="flex items-center justify-center bg-[#2A2B2F] rounded text-[9px] font-bold text-gray-400 px-1.5 py-0.5 shrink-0">
                ⌘K
              </div>
            </div>

            <div className="w-px h-5 bg-[#2A2B2F] mx-1"></div>

            {/* Add Button */}
            <button className="flex items-center gap-2 bg-[#1A1B1E] border border-[#2A2B2F] hover:bg-[#2A2B2F] transition-colors rounded-full px-4 h-9 text-xs font-semibold text-gray-300 hover:text-white">
              Add <FaPlus className="text-[10px]" />
            </button>

            {/* Invite Button */}
            <button className="flex items-center gap-2 bg-[#1A1B1E] border border-[#2A2B2F] hover:bg-[#2A2B2F] transition-colors rounded-full px-4 h-9 text-xs font-semibold text-gray-300 hover:text-white">
              <FaShare className="text-[10px]" /> Invite
            </button>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-8 flex-1 overflow-y-auto bg-[#121212]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
