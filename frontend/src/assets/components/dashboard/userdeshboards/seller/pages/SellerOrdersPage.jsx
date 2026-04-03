import React, { useEffect, useState, useContext } from "react";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import API from "../../../../../api/api";
import { LanguageContext } from "../../../../../context/LanguageContext";
import { translations } from "../../../../../translations";
import { FaSearch, FaBoxOpen, FaClipboardList, FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaChevronRight } from "react-icons/fa";

const parseJwt = (token) => { try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; } };

const statusColor = (s) => {
    const map = {
        Pending: "text-amber-500 bg-amber-500/10 border-amber-500/20", 
        Processing: "text-violet-500 bg-violet-500/10 border-violet-500/20",
        Shipped: "text-blue-500 bg-blue-500/10 border-blue-500/20", 
        Delivered: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        Cancelled: "text-red-500 bg-red-500/10 border-red-500/20",
    };
    return map[s] || "text-gray-500 bg-gray-500/10 border-gray-500/20";
};

const SellerOrdersPage = () => {
    const { language } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [updating, setUpdating] = useState(null);
    const [sellerId, setSellerId] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const decoded = parseJwt(token);
            const sid = decoded?.id || decoded?._id;
            setSellerId(sid);
            const { data } = await API.get("/orders/seller/orders");
            const filteredData = (data.orders || data || []).filter(o => o.orderItems.some(i => i.seller === sid || i.seller?._id === sid));
            setOrders(filteredData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleItemStatus = async (orderId, productId, status) => {
        try {
            setUpdating(`${orderId}-${productId}`);
            await API.put("/orders/seller/item-status", { orderId, productId, status });
            await fetchOrders();
        } catch (err) { alert(err.response?.data?.message || "Update failed"); }
        finally { setUpdating(null); }
    };

    const getSellerTotal = (order) => order.orderItems.filter(i => i.seller === sellerId || i.seller?._id === sellerId).reduce((s, i) => s + i.price * i.qty, 0);

    const counts = { all: orders.length, Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    orders.forEach(o => { const s = o.orderStatus; if (counts[s] !== undefined) counts[s]++; });

    const filtered = orders
        .filter(o => filter === "all" || o.orderStatus === filter)
        .filter(o => { if (!search) return true; const s = search.toLowerCase(); return o._id.toLowerCase().includes(s) || o.user?.name?.toLowerCase().includes(s) || o.orderItems.some(i => i.name?.toLowerCase().includes(s)); });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t.orders}</h1>
                    <p className="text-[14px] text-gray-500 mt-1">Efficiently manage and fulfill your orders</p>
                </div>
                <div className="relative flex-1 max-w-sm group">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by ID or customer..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="premium-input w-full pl-12"
                    />
                </div>
            </div>

            {/* Filter Pills - Knockturnals Style */}
            <div className="flex flex-wrap gap-3">
                {[{ key: "all", label: "All Orders", icon: <FaClipboardList />, count: counts.all },
                { key: "Pending", label: "Pending", icon: <FaClock />, count: counts.Pending },
                { key: "Shipped", label: "Shipped", icon: <FaTruck />, count: counts.Shipped },
                { key: "Delivered", label: "Delivered", icon: <FaCheckCircle />, count: counts.Delivered },
                { key: "Cancelled", label: "Cancelled", icon: <FaTimesCircle />, count: counts.Cancelled },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFilter(tab.key)}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${filter === tab.key ? "bg-[#1a1a1a] text-white border-[#262626] shadow-xl" : "bg-transparent text-gray-500 border-transparent hover:text-gray-300"}`}>
                        <span className={filter === tab.key ? "text-orange-500" : ""}>{tab.icon}</span>
                        {tab.label} 
                        <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${filter === tab.key ? "bg-orange-500/10 text-orange-500" : "bg-[#1a1a1a] text-gray-600"}`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="premium-card py-24 text-center">
                    <FaBoxOpen className="text-6xl mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium text-gray-500">No matching orders found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filtered.map(order => {
                        const sellerItems = order.orderItems.filter(i => i.seller === sellerId || i.seller?._id === sellerId);
                        return (
                            <div key={order._id} className="premium-card overflow-hidden group hover:border-gray-700 transition-colors">
                                {/* Header */}
                                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#262626] bg-[#141414]/50 group-hover:bg-[#141414] transition-colors">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="px-3 py-1 bg-orange-500/5 border border-orange-500/20 rounded-lg text-[11px] font-bold text-orange-500 tracking-widest uppercase">
                                            #{order._id.slice(-6)}
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wider ${statusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </div>
                                        <div className="w-1 h-1 bg-[#262626] rounded-full hidden md:block"></div>
                                        <span className="text-[12px] font-medium text-gray-500">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                        </span>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1">Assigned Total</p>
                                            <p className="text-xl font-black text-white">₹{getSellerTotal(order).toLocaleString()}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 hidden lg:flex">
                                            <FaChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-5 space-y-4">
                                    {sellerItems.map(item => (
                                        <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a]">
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#262626] bg-black shadow-inner flex-shrink-0">
                                                    <img src={getOptimizedImage(item.image, 200)} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[15px] font-bold text-white truncate">{item.name}</p>
                                                    <p className="text-[12px] font-medium text-gray-500 mt-1">
                                                        <span className="text-orange-500/80">Qty: {item.qty}</span> • <span className="text-gray-400">₹{item.price.toLocaleString()} ea</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-auto">
                                                <label className="text-[10px] font-bold text-gray-600 uppercase mb-2 block ml-1">Status Action</label>
                                                <select 
                                                    value={item.itemStatus || "Pending"} 
                                                    disabled={updating === `${order._id}-${item.product}`}
                                                    onChange={(e) => handleItemStatus(order._id, item.product, e.target.value)}
                                                    className="premium-input bg-[#1a1a1a] text-[13px] py-2 w-full sm:w-40"
                                                >
                                                    {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer Info */}
                                <div className="px-6 py-4 bg-[#141414]/30 border-t border-[#262626] flex flex-wrap items-center justify-between gap-4 text-[12px]">
                                    <div className="flex items-center gap-4 text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div> {order.shippingAddress?.city}</span>
                                        <span className="flex items-center gap-1.5 text-gray-700">•</span>
                                        <span>{order.user?.name || "Anonymous Guest"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-lg border font-bold text-[10px] uppercase tracking-tighter ${order.isPaid ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5"}`}>
                                            {order.paymentMethod} • {order.isPaid ? "Verified Paid" : "Payment Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SellerOrdersPage;
