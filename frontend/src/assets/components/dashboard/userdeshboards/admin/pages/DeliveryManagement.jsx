import React, { useEffect, useState } from "react";
import {
    FaTruck,
    FaUserCheck,
    FaBoxOpen,
    FaCheckCircle,
    FaClock,
    FaSearch,
    FaMapMarkerAlt,
} from "react-icons/fa";
import API from "../../../../../api/api";

const DeliveryManagement = () => {
    const [orders, setOrders] = useState([]);
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | unassigned | assigned | delivered
    const [search, setSearch] = useState("");
    const [assignLoading, setAssignLoading] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, dpRes] = await Promise.all([
                API.get("/orders/admin/all"),
                API.get("/orders/admin/delivery-persons"),
            ]);
            setOrders(ordersRes.data);
            setDeliveryPersons(dpRes.data);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (orderId, deliveryPersonId) => {
        if (!deliveryPersonId) return;
        try {
            setAssignLoading(orderId);
            await API.put("/orders/admin/assign-delivery", { orderId, deliveryPersonId });
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to assign");
        } finally {
            setAssignLoading(null);
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            await API.put("/orders/admin/order-status", { orderId, status });
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update");
        }
    };

    // Filter orders
    const filteredOrders = orders
        .filter((o) => {
            if (filter === "unassigned") return !o.deliveryPerson;
            if (filter === "assigned") return o.deliveryPerson && !o.isDelivered;
            if (filter === "delivered") return o.isDelivered;
            return true;
        })
        .filter((o) => {
            if (!search) return true;
            const s = search.toLowerCase();
            return (
                o._id.toLowerCase().includes(s) ||
                o.shippingAddress?.city?.toLowerCase().includes(s) ||
                o.shippingAddress?.fullName?.toLowerCase().includes(s) ||
                o.orderStatus?.toLowerCase().includes(s)
            );
        });

    const statusColor = (status) => {
        const map = {
            Pending: "text-[#6B7280] bg-[#121212]",
            Confirmed: "text-blue-400 bg-blue-50",
            Processing: "text-indigo-400 bg-indigo-50",
            Shipped: "text-cyan-600 bg-cyan-50",
            "Out for Delivery": "text-amber-600 bg-amber-50",
            Delivered: "text-emerald-600 bg-emerald-50",
            Cancelled: "text-red-600 bg-red-50",
        };
        return map[status] || "text-[#8E929C] bg-[#121212]";
    };

    // Count stats
    const totalOrders = orders.length;
    const unassigned = orders.filter((o) => !o.deliveryPerson && !o.isDelivered && o.orderStatus !== "Cancelled").length;
    const inTransit = orders.filter((o) => o.deliveryPerson && !o.isDelivered && o.orderStatus !== "Cancelled").length;
    const delivered = orders.filter((o) => o.isDelivered).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Delivery Management</h1>
                <p className="text-[#8E929C] text-sm mt-1">
                    Assign delivery partners and track all shipments
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", value: totalOrders, icon: <FaBoxOpen />, color: "text-blue-400 bg-blue-50" },
                    { label: "Unassigned", value: unassigned, icon: <FaClock />, color: "text-amber-600 bg-amber-50" },
                    { label: "In Transit", value: inTransit, icon: <FaTruck />, color: "text-cyan-600 bg-cyan-50" },
                    { label: "Delivered", value: delivered, icon: <FaCheckCircle />, color: "text-emerald-600 bg-emerald-50" },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl border border-[#2A2B2F] p-4 flex items-center justify-between hover: transition-"
                    >
                        <div>
                            <p className="text-sm text-[#8E929C]">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: "all", label: "All" },
                        { key: "unassigned", label: "Unassigned" },
                        { key: "assigned", label: "In Transit" },
                        { key: "delivered", label: "Delivered" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === tab.key
                                ? "bg-white text-black"
                                : "bg-[#121212] text-[#8E929C] hover:bg-[#2A2B2F]"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-lg border border-[#2A2B2F] text-sm focus:ring-2 focus:ring-0 focus:border-white outline-none w-64"
                    />
                </div>
            </div>

            {/* Delivery Persons Count */}
            <div className="flex items-center gap-2 text-sm text-[#8E929C]">
                <FaUserCheck className="text-blue-500" />
                <span>
                    <strong>{deliveryPersons.length}</strong> delivery partners registered
                </span>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280]">
                    <FaBoxOpen className="text-4xl mx-auto mb-3 opacity-50" />
                    <p>No orders found</p>
                </div>
            ) : (
                <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl border border-[#2A2B2F] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#121212] border-b border-[#2A2B2F]">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#8E929C] uppercase tracking-wider">Order</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#8E929C] uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#8E929C] uppercase tracking-wider">Destination</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#8E929C] uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#8E929C] uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#8E929C] uppercase tracking-wider">Delivery Partner</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#8E929C] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2B2F]">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-[#121212] transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-mono font-medium text-white">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-[#6B7280]">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-200">
                                            {order.shippingAddress?.fullName || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-[#8E929C]">
                                                <FaMapMarkerAlt className="text-[#6B7280] text-xs flex-shrink-0" />
                                                <span className="truncate max-w-[160px]">
                                                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-white">
                                                ₹{order.totalPrice?.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-[#6B7280]">{order.paymentMethod}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(
                                                    order.orderStatus
                                                )}`}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.deliveryPerson ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-400 flex items-center justify-center text-xs font-bold">
                                                        {(typeof order.deliveryPerson === "object"
                                                            ? order.deliveryPerson.name
                                                            : ""
                                                        )?.charAt(0)?.toUpperCase() || "D"}
                                                    </div>
                                                    <span className="text-sm text-gray-200">
                                                        {typeof order.deliveryPerson === "object"
                                                            ? order.deliveryPerson.name
                                                            : "Assigned"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <select
                                                    className="text-sm border border-[#2A2B2F] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-0 outline-none"
                                                    defaultValue=""
                                                    onChange={(e) => handleAssign(order._id, e.target.value)}
                                                    disabled={assignLoading === order._id || order.orderStatus === "Cancelled"}
                                                >
                                                    <option value="" disabled>
                                                        {assignLoading === order._id ? "Assigning..." : "Select partner"}
                                                    </option>
                                                    {deliveryPersons.map((dp) => (
                                                        <option key={dp._id} value={dp._id}>
                                                            {dp.name} — {dp.vehicleType || "N/A"}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
                                                <select
                                                    className="text-sm border border-[#2A2B2F] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-0 outline-none"
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                >
                                                    {[
                                                        "Pending",
                                                        "Confirmed",
                                                        "Processing",
                                                        "Shipped",
                                                        "Out for Delivery",
                                                        "Delivered",
                                                        "Cancelled",
                                                    ].map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {(order.orderStatus === "Cancelled" ||
                                                order.orderStatus === "Delivered") && (
                                                    <span className="text-xs text-[#6B7280] italic">
                                                        {order.orderStatus}
                                                    </span>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryManagement;
