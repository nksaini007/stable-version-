import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import ProviderSidebar from "./ProviderSidebar";
import { FaHome, FaClipboardList, FaWallet, FaTools, FaUser } from "react-icons/fa";

const ProviderLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    const mobileNavItems = [
        { name: "Dashboard", path: "/provider", icon: <FaHome /> },
        { name: "Bookings", path: "/provider/bookings", icon: <FaClipboardList /> },
        { name: "Earnings", path: "/provider/earnings", icon: <FaWallet /> },
        { name: "Services", path: "/provider/services", icon: <FaTools /> },
        { name: "Profile", path: "/profile", icon: <FaUser /> },
    ];

    return (
        <div className="h-screen flex bg-[#0f172a] text-slate-200 overflow-hidden font-mono">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <ProviderSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            </div>

            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Header */}
                <div className="h-16 md:h-14 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3 md:hidden">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-white text-xs">STN.</div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Provider_Portal</h2>
                    </div>
                    <div className="hidden md:block overflow-hidden max-w-[200px]">
                       <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 whitespace-nowrap">NODE_ACCESS://PROVIDER_ROOT</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                           <span className="text-[10px] font-black text-emerald-500 uppercase">System_Online</span>
                           <span className="text-[8px] text-white/30 font-mono tracking-tighter">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center relative">
                            <div className="w-2 h-2 bg-orange-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-[#0f172a]"></div>
                            <span className="text-[10px] font-bold">N</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pb-24 md:pb-6 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
                        <Outlet />
                    </div>
                </div>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#1e293b]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 pb-4 z-50">
                    {mobileNavItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === "/provider"}
                            className={({ isActive }) => `flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 ${isActive ? "text-orange-500 bg-orange-500/5" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            <span className={`text-xl ${item.name === "Dashboard" ? "scale-110" : ""}`}>{item.icon}</span>
                            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}} />
        </div>
    );
};

export default ProviderLayout;
