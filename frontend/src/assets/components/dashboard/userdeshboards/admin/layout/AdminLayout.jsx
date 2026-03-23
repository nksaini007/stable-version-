import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-[#050505] text-white">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 h-14 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold tracking-wide text-white">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
