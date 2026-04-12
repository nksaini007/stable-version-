import React, { useState, useEffect } from "react";
import { FaSearch, FaBell, FaCodeBranch, FaClock, FaKeyboard } from "react-icons/fa";
import { motion } from "framer-motion";

const ArchitectHeader = () => {
    const [search, setSearch] = useState("");
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="studio-header px-6 py-4 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-8">
                {/* Search Engine */}
                <div className="relative group">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff5c00] transition-colors text-xs" />
                    <input 
                        type="text" 
                        placeholder="Search system ( / )..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="technical-search-input min-w-[180px]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-30 group-focus-within:opacity-0 transition-opacity">
                        <FaKeyboard size={10} />
                        <span className="text-[8px] font-bold">/</span>
                    </div>
                </div>

                {/* Technical Divider */}
                <div className="h-4 w-[1px] bg-white/5 hidden md:block"></div>

                {/* System Metrics */}
                <div className="hidden lg:flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="mono-label">System Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                            <span className="mono-value !text-[10px]">Operational</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="mono-label">Active Flux</span>
                        <span className="mono-value !text-[10px]">1,280 MHz</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Clock & Uptime */}
                <div className="hidden sm:flex flex-col items-end">
                    <span className="mono-label flex items-center gap-1.5"><FaClock size={8}/> Current Time / UTC+5:30</span>
                    <span className="mono-value !text-[12px] tabular-nums">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                    </span>
                </div>

                <div className="h-6 w-[1px] bg-white/5"></div>

                {/* Action Icons */}
                <div className="flex items-center gap-4">
                    <button className="relative text-gray-500 hover:text-white transition-colors">
                        <FaBell size={16} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff5c00] rounded-full border-2 border-[#0c0c0e]"></span>
                    </button>
                    <button className="text-gray-500 hover:text-white transition-colors">
                        <FaCodeBranch size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ArchitectHeader;
