import React, { useEffect, useState } from "react";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import API from "../../../../../api/api";
import { FaSearch, FaBoxOpen, FaClipboardList, FaClock, FaCheckCircle, FaTruck, FaTimesCircle } from "react-icons/fa";

const parseJwt = (token) => { try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; } };

const statusColor = (s) => {
    const map = {
        Pending: "text-amber-600 bg-amber-50", Processing: "text-violet-600 bg-violet-50",
        Shipped: "text-blue-600 bg-blue-50", Delivered: "text-emerald-600 bg-emerald-50",
        Cancelled: "text-red-600 bg-red-50",
    };
    return map[s] || "text-gray-500 bg-gray-50";
};

const SellerOrdersPage = () => {
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
            const filtered = (data.orders || data || []).filter(o => o.orderItems.some(i => i.seller === sid || i.seller?._id === sid));
            setOrders(filtered);
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Track and manage your customer orders</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
                {[{ key: "all", label: "All", icon: <FaClipboardList />, count: counts.all },
                { key: "Pending", label: "Pending", icon: <FaClock />, count: counts.Pending },
                { key: "Shipped", label: "Shipped", icon: <FaTruck />, count: counts.Shipped },
                { key: "Delivered", label: "Delivered", icon: <FaCheckCircle />, count: counts.Delivered },
                { key: "Cancelled", label: "Cancelled", icon: <FaTimesCircle />, count: counts.Cancelled },
                ].map(t => (
                    <button key={t.key} onClick={() => setFilter(t.key)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${filter === t.key ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                        {t.icon} {t.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${filter === t.key ? "bg-white/20" : "bg-gray-100"}`}>{t.count}</span>
                    </button>
                ))}
            </div>

            <div className="relative max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400 outline-none bg-white" />
            </div>

            {/* Orders */}
            {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400"><FaBoxOpen className="text-4xl mx-auto mb-3 opacity-50" /><p>No orders found</p></div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => {
                        const sellerItems = order.orderItems.filter(i => i.seller === sellerId || i.seller?._id === sellerId);
                        return (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                {/* Header */}
                                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 gap-2 sm:gap-0">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <span className="text-xs font-mono font-semibold text-gray-700">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                                        <span className="text-[11px] text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</span>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-sm font-bold text-gray-800">₹{getSellerTotal(order).toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400">{order.user?.name || "Customer"}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-4 space-y-3">
                                    {sellerItems.map(item => (
                                        <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-center gap-3">
                                                <img src={getOptimizedImage(item.image, 200)} alt="" className="w-10 h-10 rounded-lg object-cover border" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">{item.name}</p>
                                                    <p className="text-[11px] text-gray-400">Qty: {item.qty} × ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <select value={item.itemStatus || "Pending"} disabled={updating === `${order._id}-${item.product}`}
                                                onChange={(e) => handleItemStatus(order._id, item.product, e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-400 outline-none bg-white">
                                                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                    <span>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</span>
                                    <span>{order.paymentMethod} {order.isPaid ? "• Paid" : "• Unpaid"}</span>
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
