import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SellerSidebar from "./SellerSidebar";
import { FaBars } from "react-icons/fa";

const SellerLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);

    const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        const distance = touchStartX - touchEndX;
        if (distance > 50) setMobileOpen(false); // Swipe Left
        if (distance < -50) setMobileOpen(true); // Swipe Right
        setTouchStartX(null);
        setTouchEndX(null);
    };

    return (
        <div
            className="h-screen flex bg-[#f8fafc] overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <SellerSidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 h-14 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden text-gray-600 hover:text-orange-500 transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <FaBars size={20} />
                        </button>
                        <h2 className="text-sm font-semibold text-gray-700">Seller Dashboard</h2>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:block">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <div className="p-4 md:p-6"><Outlet /></div>
            </main>
        </div>
    );
};

export default SellerLayout;
