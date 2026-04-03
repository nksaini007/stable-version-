import React, { useState, useContext } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import SellerSidebar from "./SellerSidebar";
import { FaBars, FaChevronRight, FaGlobe, FaBell, FaSearch } from "react-icons/fa";
import { LanguageProvider, LanguageContext } from "../../../../context/LanguageContext";
import { translations } from "../../../../translations";
import "./seller_premium.css";

const SellerLayoutContent = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
    const location = useLocation();

    // Generate simple breadcrumbs
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className="h-screen flex premium-dashboard overflow-hidden">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <SellerSidebar 
                collapsed={collapsed} 
                setCollapsed={setCollapsed} 
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Premium Header */}
                <header className="sticky top-0 z-30 h-16 premium-header flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-400 hover:text-white transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <FaBars size={18} />
                        </button>
                        
                        {/* Breadcrumbs */}
                        <nav className="hidden sm:flex items-center gap-2 text-[13px]">
                            {pathnames.map((name, index) => {
                                const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                                const isLast = index === pathnames.length - 1;
                                return (
                                    <React.Fragment key={name}>
                                        {index > 0 && <FaChevronRight size={10} className="text-gray-600" />}
                                        <Link
                                            to={routeTo}
                                            className={`${isLast ? "text-white font-medium" : "text-gray-500 hover:text-gray-300"} capitalize`}
                                        >
                                            {t[name] || name}
                                        </Link>
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        {/* Global Search Mockup */}
                        <div className="hidden lg:flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-1.5 w-64">
                            <FaSearch size={12} className="text-gray-500" />
                            <input 
                                type="text" 
                                placeholder={t.search} 
                                className="bg-transparent border-none text-[12px] text-white focus:outline-none w-full"
                            />
                        </div>

                        {/* Language Switcher */}
                        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] rounded-lg px-2 py-1">
                            <FaGlobe size={12} className="text-gray-400" />
                            <select 
                                value={language}
                                onChange={(e) => toggleLanguage(e.target.value)}
                                className="bg-transparent text-white text-[12px] focus:outline-none cursor-pointer border-none py-0.5"
                            >
                                <option value="en" className="bg-[#1a1a1a]">ENG</option>
                                <option value="hi" className="bg-[#1a1a1a]">HIN</option>
                            </select>
                        </div>

                        <button className="text-gray-400 hover:text-white transition-colors relative">
                            <FaBell size={18} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#0a0a0a]"></span>
                        </button>
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

const SellerLayout = () => (
    <LanguageProvider>
        <SellerLayoutContent />
    </LanguageProvider>
);

export default SellerLayout;
