import React, { useEffect, useState, useContext } from "react";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../assets/context/AuthContext";
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

const SellerHome = () => {
    const { user } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
    const [revenue, setRevenue] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [revRes, prodRes] = await Promise.all([
                    API.get("/payments/seller/revenue"),
                    API.get("/products"),
                ]);
                setRevenue(revRes.data);
                setProducts(prodRes.data || []);
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
        { name: t.total_orders, value: revenue?.totalOrders || 0, icon: <FaBoxOpen />, color: "text-violet-500" },
        { name: t.products_listed, value: products.length, icon: <FaBoxOpen />, color: "text-cyan-500" },
    ];

    return (
        <div className="space-y-8">
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 premium-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-semibold text-white">{t.monthly_revenue}</h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border border-[#262626] rounded-lg text-[11px] text-gray-400">
                            Last 6 Months
                        </div>
                    </div>
                    {revenue?.monthlyChart?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenue.monthlyChart}>
                                <XAxis 
                                    dataKey="month" 
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
                        <div className="h-[300px] flex items-center justify-center text-gray-600 text-sm">
                            Insufficient data for chart
                        </div>
                    )}
                </div>

                {/* My Shop QR Code Widget */}
                <div className="premium-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl"></div>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="w-14 h-14 bg-[#1a1a1a] border border-[#262626] rounded-2xl flex items-center justify-center mb-4 text-orange-500 shadow-xl">
                            <FaStore size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{t.my_shop}</h2>
                        <p className="text-gray-500 text-[13px] mb-8">{t.share_qr}</p>

                        <div className="bg-white p-4 rounded-3xl shadow-inner mb-8 overflow-hidden flex items-center justify-center border-8 border-[#1a1a1a]" style={{ width: 180, height: 180 }}>
                            <QRCodeCanvas
                                id="shop-qr-code"
                                value={shopUrl}
                                size={148}
                                fgColor="#0a0a0a"
                                level={"H"}
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full">
                            <button
                                onClick={handleCopyLink}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] border border-[#262626] hover:bg-[#222] rounded-xl text-[13px] font-medium text-white transition-colors"
                            >
                                <FaCopy size={14} /> {t.link}
                            </button>
                            <button
                                onClick={handleDownloadQR}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-100 rounded-xl text-[13px] font-bold text-black shadow-lg transition-colors"
                            >
                                <FaDownload size={14} /> {t.save_qr}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Products Card */}
            <div className="premium-card overflow-hidden">
                <div className="p-6 border-b border-[#262626] flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{t.your_products} ({products.length})</h2>
                    <button className="text-[12px] font-medium text-orange-500 hover:text-orange-400 transition-colors">View All</button>
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
