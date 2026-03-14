import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DeliverySidebar from "./DeliverySidebar";

const DeliveryLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="h-screen flex bg-[#0a0f1c] text-slate-100 font-sans">
            {/* Sidebar Component */}
            <DeliverySidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Optional subtle background grid pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none z-0"></div>

                {/* Top header strip (optional, but good for context) */}
                <header className="sticky top-0 z-30 h-16 bg-[#111827]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse"></div>
                        <h2 className="text-sm font-semibold tracking-wide text-cyan-50">Delivery Partner Portal</h2>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                </header>

                {/* Sub-routing content injection area */}
                <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DeliveryLayout;
