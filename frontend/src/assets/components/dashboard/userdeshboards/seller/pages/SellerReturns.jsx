import React, { useEffect, useState, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { LanguageContext } from "../../../../../context/LanguageContext";
import { translations } from "../../../../../translations";
import { FaUndo, FaCheckCircle, FaExclamationCircle, FaSearch, FaBox, FaTimes } from "react-icons/fa";
import { getOptimizedImage } from "../../../../../utils/imageUtils";

const SellerReturns = () => {
    const { language } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/orders/seller/orders");
            const dataArray = Array.isArray(data) ? data : (data.orders || []);
            // Filter orders that have at least one 'Returned' or 'Refunded' item
            const returnOrders = dataArray.filter(order => 
                order.orderItems && Array.isArray(order.orderItems) && order.orderItems.some(item => ["Returned", "Refunded", "Return Requested"].includes(item.itemStatus))
            );
            setOrders(returnOrders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const handleRefund = async (orderId, productId) => {
        if (!window.confirm("Confirm refund for this item? This will mark the transaction as resolved.")) return;
        try {
            await API.put("/orders/item-status", {
                orderId,
                productId,
                status: "Refunded"
            });
            fetchReturns();
        } catch (err) {
            alert("Refund failed");
        }
    };

    const filtered = (orders || []).filter(o => 
        (o._id && o._id.toLowerCase().includes(search.toLowerCase())) ||
        (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Returns & Refunds</h1>
                    <p className="text-[14px] text-gray-500 mt-1">Manage customer returns and process rapid refunds</p>
                </div>
            </div>

            <div className="relative max-w-md group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search by Order ID or Customer..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-[#141414] border border-[#262626] rounded-xl text-white text-[14px] focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-700 font-medium"
                />
            </div>

            <div className="premium-card overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-[#262626] text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="col-span-5">Order & Product</div>
                    <div className="col-span-3 text-center">Customer</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-500">
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#262626]">
                            <FaUndo size={24} className="opacity-20" />
                        </div>
                        <p className="text-lg font-black text-white/20 uppercase tracking-[0.2em] text-[12px]">No Active Returns</p>
                        <p className="text-[11px] text-gray-700 mt-2">All customer concerns are currently resolved.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#262626]">
                        {filtered.map(order => (
                            <React.Fragment key={order._id}>
                                {(order.orderItems || []).filter(item => ["Returned", "Refunded", "Return Requested"].includes(item.itemStatus)).map((item, idx) => (
                                    <div key={`${order._id}-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-[#1a1a1a] transition-colors group">
                                        <div className="col-span-5 flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-[#262626] flex-shrink-0">
                                                <img src={getOptimizedImage(item.image, 100)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-bold text-white truncate">{item.name}</h4>
                                                <p className="text-[10px] text-gray-500 uppercase font-black">Order ID: <span className="text-orange-500/80">#{order._id.slice(-8)}</span></p>
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 text-center">
                                            <p className="text-[14px] font-bold text-white">{order.shippingAddress.fullName}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div className="md:col-span-2 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                item.itemStatus === "Refunded" 
                                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" 
                                                : "bg-orange-500/5 border-orange-500/20 text-orange-500"
                                            }`}>
                                                {item.itemStatus}
                                            </span>
                                        </div>
                                        <div className="md:col-span-2 flex justify-end">
                                            {item.itemStatus === "Returned" ? (
                                                <button 
                                                    onClick={() => handleRefund(order._id, item.product)}
                                                    className="px-6 py-2 bg-white text-black text-[11px] font-black rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                                                >
                                                    Issue Refund
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-emerald-500 text-[11px] font-black uppercase tracking-tighter">
                                                    <FaCheckCircle /> Refunded
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerReturns;
