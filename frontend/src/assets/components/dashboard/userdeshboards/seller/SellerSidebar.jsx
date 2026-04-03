import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaHome, FaBox, FaClipboardList, FaMoneyBillWave,
    FaSignOutAlt, FaChevronLeft, FaStore, FaBullhorn, FaTimes, FaUserCircle
} from "react-icons/fa";
import { AuthContext } from "../../../../assets/context/AuthContext";
import { LanguageContext } from "../../../../context/LanguageContext";
import { translations } from "../../../../translations";
import logo from "../../../../logo.png";

const SellerSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
    const navigate = useNavigate();

    const menuItems = [
        { name: t.dashboard, path: "/seller", icon: <FaHome />, id: "dashboard" },
        { name: t.products, path: "/seller/products", icon: <FaBox />, id: "products" },
        { name: t.orders, path: "/seller/orders", icon: <FaClipboardList />, id: "orders" },
        { name: t.ads, path: "/seller/ads", icon: <FaBullhorn />, id: "ads" },
        { name: t.payments, path: "/seller/payments", icon: <FaMoneyBillWave />, id: "payments" },
    ];

    const handleLogout = () => { 
        logout(); 
        navigate("/login"); 
    };

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            ${collapsed ? "md:w-[80px]" : "md:w-64"} w-64
            min-h-screen premium-sidebar flex flex-col transition-all duration-300
        `}>
            {/* Desktop Collapse Button */}
            <button onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex absolute -right-3 top-7 w-6 h-6 bg-[#1a1a1a] border border-[#262626] rounded-full items-center justify-center text-gray-400 hover:text-white transition-all z-50">
                <FaChevronLeft className={`text-[10px] transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>

            {/* Logo Section */}
            <div className={`px-6 py-8 flex items-center gap-3 ${collapsed ? "md:justify-center" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                    <img src={logo} alt="S" className="w-6 h-6 object-contain brightness-0 invert" />
                </div>
                <h1 className={`text-lg font-bold tracking-tight text-white ${collapsed ? "md:hidden" : ""}`}>
                    Stinchar
                </h1>
            </div>

            {/* Menu Section */}
            <div className="px-4 mb-4">
                <p className={`text-[10px] font-bold text-gray-500 mb-4 px-2 uppercase tracking-widest ${collapsed ? "md:hidden" : ""}`}>
                    {t.menu}
                </p>
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink 
                            key={item.id} 
                            to={item.path} 
                            end={item.path === "/seller"}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed ? item.name : ""}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all
                                ${isActive 
                                    ? "bg-[#1a1a1a] text-white border border-[#262626]" 
                                    : "text-gray-500 hover:text-gray-300 hover:bg-[#141414]"
                                }
                                ${collapsed ? "md:justify-center px-0" : ""}
                            `}
                        >
                            <span className="text-[16px]">{item.icon}</span>
                            <span className={`${collapsed ? "md:hidden" : ""}`}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto border-t border-[#262626] p-4">
                {/* User Profile - Matching Ref Image */}
                <div className={`flex items-center gap-3 p-2 rounded-xl bg-[#141414] border border-[#262626] mb-3 ${collapsed ? "md:justify-center border-none bg-transparent p-0" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-[#262626]">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <FaUserCircle className="text-gray-500 text-2xl" />
                        )}
                    </div>
                    <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
                        <p className="text-[12px] font-semibold text-white truncate">{user?.name || "Seller"}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>

                <button onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-red-500 hover:bg-red-500/10 transition-all ${collapsed ? "md:justify-center" : ""}`}>
                    <FaSignOutAlt className="text-[15px]" />
                    <span className={`${collapsed ? "md:hidden" : ""}`}>{t.logout}</span>
                </button>
            </div>
        </aside>
    );
};

export default SellerSidebar;
