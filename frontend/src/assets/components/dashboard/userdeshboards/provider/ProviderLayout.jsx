import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ProviderSidebar from "./ProviderSidebar";

const ProviderLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="h-screen flex bg-[#f8fafc]">
            <ProviderSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 h-14 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 flex items-center justify-between px-6">
                    <h2 className="text-sm font-semibold text-gray-700">Provider Dashboard</h2>
                    <span className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <div className="p-6"><Outlet /></div>
            </main>
        </div>
    );
};

export default ProviderLayout;
