import React, { useEffect, useState, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import {
    FaWallet, FaCheckCircle, FaClock, FaShoppingCart, FaBoxOpen, FaArrowUp,
    FaQrcode, FaCopy, FaDownload, FaStore
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { QRCodeCanvas } from "qrcode.react";

const SellerHome = () => {
    const { user } = useContext(AuthContext);
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
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Generate Shop URL based on the current domain and seller ID
    const shopUrl = `${window.location.origin}/shop/${user?._id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shopUrl);
        toast.success("Shop Link Copied!");
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById("shop-qr-code");
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${user?.businessName || 'My_Shop'}_QR.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success("QR Code Downloaded!");
        } else {
            toast.error("Could not find QR Code to download");
        }
    };

    const stats = [
        { name: "Total Sales", value: `₹${(revenue?.totalSales || 0).toLocaleString()}`, icon: <FaWallet />, bg: "bg-orange-50 text-orange-600" },
        { name: "Paid Revenue", value: `₹${(revenue?.paidSales || 0).toLocaleString()}`, icon: <FaCheckCircle />, bg: "bg-emerald-50 text-emerald-600" },
        { name: "Pending", value: `₹${(revenue?.pendingSales || 0).toLocaleString()}`, icon: <FaClock />, bg: "bg-amber-50 text-amber-600" },
        { name: "Items Sold", value: revenue?.totalItemsSold || 0, icon: <FaShoppingCart />, bg: "bg-blue-50 text-blue-600" },
        { name: "Total Orders", value: revenue?.totalOrders || 0, icon: <FaBoxOpen />, bg: "bg-violet-50 text-violet-600" },
        { name: "Products Listed", value: products.length, icon: <FaBoxOpen />, bg: "bg-cyan-50 text-cyan-600" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || "Seller"}</h1>
                <p className="text-sm text-gray-500 mt-1">Here's your seller performance overview.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${card.bg}`}>{card.icon}</div>
                        </div>
                        <p className="text-[22px] font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{card.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{card.name}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            {revenue?.monthlyChart?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={revenue.monthlyChart}>
                            <XAxis dataKey="month" stroke="#cbd5e1" fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke="#cbd5e1" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                            <Bar dataKey="amount" fill="#f97316" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Recent Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Your Products ({products.length})</h2>
                    {products.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No products listed yet</p>
                    ) : (
                        <div className="space-y-2">
                            {products.slice(0, 6).map((p) => (
                                <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 hover:bg-gray-100/80 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={p.images?.[0]?.url ? `${p.images[0].url}` : "https://via.placeholder.com/40"} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{p.name}</p>
                                            <p className="text-[10px] text-gray-400">{p.category} • Stock: {p.stock}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">₹{p.price?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Shop QR Code Widget */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl border border-blue-500 p-6 flex flex-col items-center justify-center text-center text-white relative overflow-hidden shadow-lg shadow-blue-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30 -translate-x-10 translate-y-10"></div>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                            <FaStore className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold mb-1">My Shop</h2>
                        <p className="text-blue-100 text-xs mb-5">Share this QR code with customers</p>

                        <div className="bg-white p-3 rounded-2xl shadow-inner mb-5 overflow-hidden flex items-center justify-center" style={{ width: 164, height: 164 }}>
                            <QRCodeCanvas
                                id="shop-qr-code"
                                value={shopUrl}
                                size={140}
                                fgColor="#1e3a8a"
                                level={"H"}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-2 w-full">
                            <button
                                onClick={handleCopyLink}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors"
                            >
                                <FaCopy /> Link
                            </button>
                            <button
                                onClick={handleDownloadQR}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-blue-600 hover:bg-blue-50 shadow-sm rounded-xl text-sm font-bold transition-colors"
                            >
                                <FaDownload /> Save QR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerHome;
