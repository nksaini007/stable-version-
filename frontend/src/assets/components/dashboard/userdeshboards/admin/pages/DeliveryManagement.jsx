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
            Pending: "text-gray-400 bg-gray-100",
            Confirmed: "text-blue-600 bg-blue-50",
            Processing: "text-indigo-600 bg-indigo-50",
            Shipped: "text-cyan-600 bg-cyan-50",
            "Out for Delivery": "text-amber-600 bg-amber-50",
            Delivered: "text-emerald-600 bg-emerald-50",
            Cancelled: "text-red-600 bg-red-50",
        };
        return map[status] || "text-gray-500 bg-gray-50";
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
                <h1 className="text-2xl font-bold text-gray-800">Delivery Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Assign delivery partners and track all shipments
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", value: totalOrders, icon: <FaBoxOpen />, color: "text-blue-600 bg-blue-50" },
                    { label: "Unassigned", value: unassigned, icon: <FaClock />, color: "text-amber-600 bg-amber-50" },
                    { label: "In Transit", value: inTransit, icon: <FaTruck />, color: "text-cyan-600 bg-cyan-50" },
                    { label: "Delivered", value: delivered, icon: <FaCheckCircle />, color: "text-emerald-600 bg-emerald-50" },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
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
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                    />
                </div>
            </div>

            {/* Delivery Persons Count */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
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
                <div className="text-center py-12 text-gray-400">
                    <FaBoxOpen className="text-4xl mx-auto mb-3 opacity-50" />
                    <p>No orders found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destination</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Partner</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-mono font-medium text-gray-800">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {order.shippingAddress?.fullName || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
                                                <span className="truncate max-w-[160px]">
                                                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-800">
                                                ₹{order.totalPrice?.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400">{order.paymentMethod}</p>
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
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {(typeof order.deliveryPerson === "object"
                                                            ? order.deliveryPerson.name
                                                            : ""
                                                        )?.charAt(0)?.toUpperCase() || "D"}
                                                    </div>
                                                    <span className="text-sm text-gray-700">
                                                        {typeof order.deliveryPerson === "object"
                                                            ? order.deliveryPerson.name
                                                            : "Assigned"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <select
                                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
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
                                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
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
                                                    <span className="text-xs text-gray-400 italic">
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
