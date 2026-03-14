import React, { useEffect, useState } from "react";
import API from "../../../../../api/api";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaCreditCard,
  FaMoneyCheck,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | paid | unpaid | cod | online
  const [markingId, setMarkingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, chartRes] = await Promise.all([
        API.get("/payments/admin/all"),
        API.get("/payments/admin/revenue-chart"),
      ]);
      setPayments(paymentsRes.data || []);

      const months = chartRes.data.months || [];
      const values = chartRes.data.values || [];
      setChartData(months.map((m, i) => ({ month: m, revenue: values[i] || 0 })));
    } catch (err) {
      console.error("Payment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkPaid = async (orderId) => {
    try {
      setMarkingId(orderId);
      await API.put("/payments/admin/mark-paid", { orderId });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as paid");
    } finally {
      setMarkingId(null);
    }
  };

  // Computed stats
  const totalRevenue = payments.reduce((s, p) => s + (p.totalPrice || 0), 0);
  const paidAmount = payments.filter((p) => p.isPaid).reduce((s, p) => s + (p.totalPrice || 0), 0);
  const unpaidAmount = payments.filter((p) => !p.isPaid && p.orderStatus !== "Cancelled").reduce((s, p) => s + (p.totalPrice || 0), 0);
  const codOrders = payments.filter((p) => p.paymentMethod === "COD").length;
  const onlineOrders = payments.filter((p) => p.paymentMethod !== "COD").length;

  // Filter & search
  const filteredPayments = payments
    .filter((p) => {
      if (filter === "paid") return p.isPaid;
      if (filter === "unpaid") return !p.isPaid && p.orderStatus !== "Cancelled";
      if (filter === "cod") return p.paymentMethod === "COD";
      if (filter === "online") return p.paymentMethod !== "COD";
      return true;
    })
    .filter((p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p._id.toLowerCase().includes(s) ||
        p.customer?.name?.toLowerCase().includes(s) ||
        p.customer?.email?.toLowerCase().includes(s)
      );
    });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track all payments, revenue, and manage payment statuses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: <FaMoneyBillWave />, bg: "bg-blue-50 text-blue-600" },
          { label: "Paid", value: `₹${paidAmount.toLocaleString()}`, icon: <FaCheckCircle />, bg: "bg-emerald-50 text-emerald-600" },
          { label: "Unpaid", value: `₹${unpaidAmount.toLocaleString()}`, icon: <FaClock />, bg: "bg-amber-50 text-amber-600" },
          { label: "COD Orders", value: codOrders, icon: <FaMoneyCheck />, bg: "bg-violet-50 text-violet-600" },
          { label: "Online Payments", value: onlineOrders, icon: <FaCreditCard />, bg: "bg-cyan-50 text-cyan-600" },
        ].map((s, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb" }}
                formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
            No data yet
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "paid", label: "Paid" },
            { key: "unpaid", label: "Unpaid" },
            { key: "cod", label: "COD" },
            { key: "online", label: "Online" },
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
            placeholder="Search by ID, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-72"
          />
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No payments found</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-gray-800">#{p._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-800">{p.customer?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{p.customer?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">₹{p.totalPrice?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{p.itemCount} items</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${p.paymentMethod === "COD"
                          ? "text-violet-600 bg-violet-50"
                          : "text-cyan-600 bg-cyan-50"
                        }`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${p.orderStatus === "Delivered" ? "text-emerald-600 bg-emerald-50" :
                          p.orderStatus === "Cancelled" ? "text-red-600 bg-red-50" :
                            "text-blue-600 bg-blue-50"
                        }`}>
                        {p.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.isPaid ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                          <FaCheckCircle /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                          <FaClock /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      {!p.isPaid && p.orderStatus !== "Cancelled" ? (
                        <button
                          onClick={() => handleMarkPaid(p.orderId)}
                          disabled={markingId === p.orderId}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition disabled:opacity-50"
                        >
                          {markingId === p.orderId ? "..." : "Mark Paid"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
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

export default PaymentManagement;
