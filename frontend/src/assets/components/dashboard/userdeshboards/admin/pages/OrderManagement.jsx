import React, { useEffect, useState } from "react";
import API from "../../../../../api/api";
import { FaSearch, FaEye, FaTrash, FaEdit, FaClipboardList, FaClock, FaCheckCircle, FaTruck, FaTimesCircle } from "react-icons/fa";

const statusMeta = (s) => {
  const map = {
    pending: { label: "Pending", color: "text-amber-600 bg-amber-50" },
    shipped: { label: "Shipped", color: "text-blue-400 bg-blue-50" },
    delivered: { label: "Delivered", color: "text-emerald-600 bg-emerald-50" },
    cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50" },
    confirmed: { label: "Confirmed", color: "text-indigo-400 bg-indigo-50" },
    processing: { label: "Processing", color: "text-violet-600 bg-violet-50" },
  };
  const key = (s || "unknown").toLowerCase();
  return map[key] || { label: s || "Unknown", color: "text-[#8E929C] bg-[#121212]" };
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/admin/all");
        if (!mounted) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Failed to fetch orders");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await API.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Counts
  const counts = {
    all: orders.length,
    pending: orders.filter(o => (o.orderStatus || "").toLowerCase() === "pending").length,
    shipped: orders.filter(o => (o.orderStatus || "").toLowerCase() === "shipped").length,
    delivered: orders.filter(o => (o.orderStatus || "").toLowerCase() === "delivered").length,
    cancelled: orders.filter(o => (o.orderStatus || "").toLowerCase() === "cancelled").length,
  };

  const filtered = orders
    .filter(o => statusFilter === "all" || (o.orderStatus || "").toLowerCase() === statusFilter)
    .filter(o => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (o._id || "").toLowerCase().includes(s) ||
        (o.shippingAddress?.fullName || "").toLowerCase().includes(s) ||
        (o.orderStatus || "").toLowerCase().includes(s);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Order Management</h1>
        <p className="text-sm text-[#8E929C] mt-1">Track and manage all customer orders</p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All Orders", icon: <FaClipboardList />, count: counts.all },
          { key: "pending", label: "Pending", icon: <FaClock />, count: counts.pending },
          { key: "shipped", label: "Shipped", icon: <FaTruck />, count: counts.shipped },
          { key: "delivered", label: "Delivered", icon: <FaCheckCircle />, count: counts.delivered },
          { key: "cancelled", label: "Cancelled", icon: <FaTimesCircle />, count: counts.cancelled },
        ].map(tab => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === tab.key
                ? "bg-white text-black  -blue-600/20"
                : "bg-[#1A1B1E] border border-[#2A2B2F] text-[#8E929C] border border-[#2A2B2F] hover:bg-[#121212]"
              }`}>
            {tab.icon}
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === tab.key ? "bg-[#1A1B1E] border border-[#2A2B2F]/20" : "bg-[#121212]"
              }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm" />
        <input type="text" placeholder="Search by ID, customer, or status..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#2A2B2F] text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-[#1A1B1E] border border-[#2A2B2F]" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">No orders found</div>
      ) : (
        <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl border border-[#2A2B2F] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#121212]/80 border-b border-[#2A2B2F]">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Payment</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Total</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => {
                  const meta = statusMeta(order.orderStatus);
                  return (
                    <tr key={order._id} className="hover:bg-[#121212]/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-xs font-mono font-semibold text-gray-200">#{order._id?.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-200">{order.shippingAddress?.fullName || "N/A"}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#8E929C]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#8E929C]">
                        {order.paymentMethod || "—"} <span className={`ml-1 ${order.isPaid ? "text-emerald-600" : "text-amber-600"}`}>({order.isPaid ? "Paid" : "Unpaid"})</span>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-white">₹{order.totalPrice?.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleDelete(order._id)} className="text-red-400 hover:text-red-600 transition text-sm"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
