import React, { useEffect, useState, useContext } from "react";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { LanguageContext } from "../../../../../context/LanguageContext";
import { translations } from "../../../../../translations";
import {
    FaWallet, FaCheckCircle, FaClock, FaShoppingCart, FaBoxOpen,
    FaCopy, FaDownload, FaStore
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { QRCodeCanvas } from "qrcode.react";

import { useNavigate } from "react-router-dom";

const SellerHome = () => {
    const { user } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const t = translations[language] || translations.en;
    const [revenue, setRevenue] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartInterval, setChartInterval] = useState("monthly"); // daily, weekly, monthly

    useEffect(() => {
        const load = async () => {
            try {
                const [revRes, prodRes] = await Promise.all([
                    API.get("/payments/seller/revenue"),
                    API.get("/products"),
                ]);
                setRevenue(revRes.data);
                setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    const shopUrl = `${window.location.origin}/shop/${user?._id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shopUrl);
        toast.success("Shop Link Copied!");
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById("shop-qr-code");
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${user?.businessName || 'My_Shop'}_QR.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success("QR Code Downloaded!");
        }
    };

    const stats = [
        { name: t.total_sales, value: `₹${(revenue?.totalSales || 0).toLocaleString()}`, icon: <FaWallet />, color: "text-orange-500" },
        { name: t.paid_revenue, value: `₹${(revenue?.paidSales || 0).toLocaleString()}`, icon: <FaCheckCircle />, color: "text-emerald-500" },
        { name: t.pending, value: `₹${(revenue?.pendingSales || 0).toLocaleString()}`, icon: <FaClock />, color: "text-amber-500" },
        { name: t.items_sold, value: revenue?.totalItemsSold || 0, icon: <FaShoppingCart />, color: "text-blue-500" },
        { name: "Shop Visitors", value: revenue?.shopVisitors || 0, icon: <FaStore />, color: "text-violet-500" },
        { name: "Shortlist / Likes", value: revenue?.shopLikes || 0, icon: <FaCheckCircle />, color: "text-cyan-500" },
    ];

    // Filter for alerts
    const outOfStock = (products || []).filter(p => !p.stock || p.stock === 0);
    const lowStock = (products || []).filter(p => p.stock > 0 && p.stock <= 10);

    // Chart Interval State
    const chartData = revenue?.[`${chartInterval}Chart`] || [];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {t.welcome}, {user?.name || "Seller"}
                </h1>
                <p className="text-[14px] text-gray-500">{t.performance_overview}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((card, idx) => (
                    <div key={idx} className="premium-card p-6 flex flex-col gap-4 group hover:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-[18px] ${card.color}`}>
                                {card.icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-[28px] font-bold text-white">{card.value}</p>
                            <p className="text-[12px] font-medium text-gray-500 tracking-wide uppercase">{card.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stock Intelligence Section */}
            {(outOfStock.length > 0 || lowStock.length > 0) && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-2 h-6 bg-orange-600 rounded-full"></div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest">{t.stock_intelligence}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {outOfStock.map(p => (
                            <div key={p._id} className="premium-card border-red-900/20 bg-red-900/5 p-4 flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                                    <FaBoxOpen size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14px] font-bold text-white truncate">{p.name}</p>
                                    <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider">{t.out_of_stock}</p>
                                </div>
                                <button
                                    onClick={() => navigate("/seller/products", { state: { filter: "out_of_stock", search: p.name } })}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[11px] font-bold shadow-lg shadow-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {t.restock_now}
                                </button>
                            </div>
                        ))}
                        {lowStock.map(p => (
                            <div key={p._id} className="premium-card border-amber-900/20 bg-amber-900/5 p-4 flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                                    <FaClock size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14px] font-bold text-white truncate">{p.name}</p>
                                    <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">{t.low_stock} ({p.stock})</p>
                                </div>
                                <button
                                    onClick={() => navigate("/seller/products", { state: { filter: "low_stock", search: p.name } })}
                                    className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[11px] font-bold shadow-lg shadow-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {t.restock_now}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 premium-card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-lg font-semibold text-white">{t.monthly_revenue}</h2>
                        <div className="flex items-center bg-[#1a1a1a] border border-[#262626] rounded-xl p-1 gap-1">
                            {["daily", "weekly", "monthly"].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setChartInterval(mode)}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                                        chartInterval === mode ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" : "text-gray-500 hover:text-white"
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    {chartData?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#444" 
                                    fontSize={11} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#444" 
                                    fontSize={11} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} 
                                />
                                <Tooltip 
                                    cursor={{ fill: '#1a1a1a' }}
                                    contentStyle={{ backgroundColor: "#0a0a0a", borderRadius: "12px", border: "1px solid #262626", color: "#fff", fontSize: "12px" }} 
                                    itemStyle={{ color: '#f97316' }}
                                    formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} 
                                />
                                <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-600 text-sm italic">
                            No data available for this period
                        </div>
                    )}
                </div>

                {/* Top Selling Products Card */}
                <div className="premium-card p-6 flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-[13px]">Top Selling Items</h2>
                    {revenue?.topProducts?.length > 0 ? (
                        <div className="space-y-4 flex-1">
                            {revenue.topProducts.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-4 group p-2 rounded-xl hover:bg-white/[0.02] transition-all">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-[#262626] overflow-hidden">
                                            <img src={getOptimizedImage(p.image, 100)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -top-2 -left-2 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-[10px] font-black italic shadow-lg">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-bold text-white truncate">{p.name}</p>
                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">{p.qty} Units Sold</p>
                                    </div>
                                    <p className="text-[13px] font-bold text-orange-500">₹{(p.price || 0).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
                            <FaBoxOpen size={40} className="mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No Sales Data</p>
                        </div>
                    )}
                    
                    <button onClick={() => navigate("/seller/products")} className="w-full mt-6 py-3 bg-[#1a1a1a] border border-[#262626] hover:bg-[#222] rounded-xl text-[12px] font-bold text-gray-400 transition-all uppercase tracking-widest">
                        Manage Catalog
                    </button>
                </div>
            </div>

            {/* My Shop QR Code Widget (Moved down for better flow) */}
            <div className="premium-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[120px]"></div>
                
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-14 h-14 bg-[#1a1a1a] border border-[#262626] rounded-2xl flex items-center justify-center mb-4 text-orange-500 shadow-xl">
                        <FaStore size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">{t.my_shop}</h2>
                    <p className="text-gray-500 text-[14px] max-w-md mb-8">{t.share_qr}</p>
                    
                    <div className="flex items-center gap-3 w-full max-w-sm">
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1a1a1a] border border-[#262626] hover:bg-[#222] rounded-xl text-[13px] font-bold text-white transition-colors"
                        >
                            <FaCopy size={14} /> {t.link}
                        </button>
                        <button
                            onClick={handleDownloadQR}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-gray-100 rounded-xl text-[13px] font-black text-black shadow-lg transition-colors"
                        >
                            <FaDownload size={14} /> {t.save_qr}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-[40px] shadow-2xl relative border-[12px] border-[#1a1a1a]">
                    <div className="absolute inset-0 border border-white/10 rounded-[30px] pointer-events-none"></div>
                    <QRCodeCanvas
                        id="shop-qr-code"
                        value={shopUrl}
                        size={160}
                        fgColor="#0a0a0a"
                        level={"H"}
                    />
                </div>
            </div>

            {/* Recent Products Card */}
            <div className="premium-card overflow-hidden">
                <div className="p-6 border-b border-[#262626] flex items-center justify-between bg-white/[0.01]">
                    <h2 className="text-lg font-semibold text-white uppercase tracking-widest text-[13px]">{t.your_products} ({products.length})</h2>
                    <button onClick={() => navigate("/seller/products")} className="text-[12px] font-bold text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-widest">
                        View Full Catalog
                    </button>
                </div>
                <div className="p-2">
                    {products.length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-12">No products listed yet</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {products.slice(0, 6).map((p) => (
                                <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-[#262626]">
                                    <img src={getOptimizedImage(p.images?.[0]?.url, 100)} alt="" className="w-14 h-14 rounded-xl object-cover border border-[#262626]" />
                                    <div className="min-w-0">
                                        <p className="text-[14px] font-semibold text-white truncate">{p.name}</p>
                                        <p className="text-[11px] text-gray-500">{p.category} • {p.stock} in stock</p>
                                        <p className="text-[14px] font-bold text-orange-500 mt-1">₹{p.price?.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerHome;
