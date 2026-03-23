import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../../../api/api";
import {
  FaUsers,
  FaBox,
  FaClipboardList,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaClock,
  FaArrowUp,
  FaHardHat,
  FaLayerGroup,
  FaMap,
  FaEnvelope,
  FaTools,
  FaCalendarAlt,
  FaNewspaper,
  FaChevronRight,
} from "react-icons/fa";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [extraCounts, setExtraCounts] = useState({
    services: 0,
    bookings: 0,
    planCategories: 0,
    plans: 0,
    messages: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes, ordersRes] = await Promise.all([
          API.get("/payments/admin/stats"),
          API.get("/payments/admin/revenue-chart"),
          API.get("/payments/admin/recent-orders"),
        ]);

        setStats(statsRes.data);

        const chart = chartRes.data || {};
        if (chart.months && chart.values) {
          setChartData(chart.months.map((m, i) => ({ month: m, revenue: chart.values[i] || 0 })));
        } else if (Array.isArray(chart)) {
          setChartData(chart.map((d) => ({ month: d.month, revenue: d.revenue })));
        }

        setRecentOrders(ordersRes.data || []);

        // Fetch extra counts in parallel (fail gracefully)
        const results = await Promise.allSettled([
          API.get("/services/admin/all"),
          API.get("/bookings"),
          API.get("/plan-categories"),
          API.get("/construction-plans"),
          API.get("/messages"),
          API.get("/posts"),
        ]);

        setExtraCounts({
          services: results[0].status === "fulfilled" ? (results[0].value.data?.length || 0) : 0,
          bookings: results[1].status === "fulfilled" ? (results[1].value.data?.length || 0) : 0,
          planCategories: results[2].status === "fulfilled" ? (results[2].value.data?.categories?.length || 0) : 0,
          plans: results[3].status === "fulfilled" ? (results[3].value.data?.plans?.length || 0) : 0,
          messages: results[4].status === "fulfilled" ? (Array.isArray(results[4].value.data) ? results[4].value.data.length : results[4].value.data?.messages?.length || 0) : 0,
          posts: results[5].status === "fulfilled" ? (Array.isArray(results[5].value.data) ? results[5].value.data.length : results[5].value.data?.posts?.length || 0) : 0,
        });
      } catch (err) {
        console.error("Admin stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { name: "Total Users", value: stats?.users || 0, icon: <FaUsers />, bg: "bg-blue-500/20", text: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]", path: "/admin/users" },
    { name: "Products", value: stats?.products || 0, icon: <FaBox />, bg: "bg-emerald-500/20", text: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]", path: "/admin/products" },
    { name: "Total Orders", value: stats?.orders || 0, icon: <FaClipboardList />, bg: "bg-violet-500/20", text: "text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]", path: "/admin/orders" },
    { name: "Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FaMoneyBillWave />, bg: "bg-amber-500/20", text: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]", path: "/admin/payments" },
  ];

  const secondaryCards = [
    { name: "Paid Revenue", value: `₹${(stats?.paidRevenue || 0).toLocaleString()}`, icon: <FaCheckCircle />, bg: "bg-green-500/20", text: "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]" },
    { name: "Pending Revenue", value: `₹${(stats?.pendingRevenue || 0).toLocaleString()}`, icon: <FaClock />, bg: "bg-orange-500/20", text: "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" },
    { name: "Delivered", value: stats?.deliveredOrders || 0, icon: <FaTruck />, bg: "bg-cyan-500/20", text: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" },
    { name: "Cancelled", value: stats?.cancelledOrders || 0, icon: <FaTimesCircle />, bg: "bg-red-500/20", text: "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]" },
  ];

  const quickLinks = [
    { name: "Services", count: extraCounts.services, icon: <FaTools />, path: "/admin/services", color: "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:border-orange-400/50" },
    { name: "Bookings", count: extraCounts.bookings, icon: <FaCalendarAlt />, path: "/admin/bookings", color: "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-400/50" },
    { name: "Plan Categories", count: extraCounts.planCategories, icon: <FaLayerGroup />, path: "/admin/plan-categories", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:border-indigo-400/50" },
    { name: "Blueprints", count: extraCounts.plans, icon: <FaMap />, path: "/admin/plans", color: "border-teal-500/30 bg-teal-500/10 text-teal-400 hover:shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:border-teal-400/50" },
    { name: "Inquiries", count: extraCounts.messages, icon: <FaEnvelope />, path: "/admin/messages", color: "border-pink-500/30 bg-pink-500/10 text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:border-pink-400/50" },
    { name: "Posts", count: extraCounts.posts, icon: <FaNewspaper />, path: "/admin/posts", color: "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:border-purple-400/50" },
  ];

  const statusColor = (s) => {
    const map = {
      pending: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      shipped: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      delivered: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      cancelled: "text-red-400 bg-red-500/20 border-red-500/30",
    };
    return map[(s || "").toLowerCase()] || "text-gray-400 bg-white/5 border-white/10";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-sm">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => card.path && navigate(card.path)}
            className="bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-5 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-white/10 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${card.bg} ${card.text}`}>
                {card.icon}
              </div>
              <FaChevronRight className="text-gray-500 text-xs group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">{card.name}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {secondaryCards.map((card, idx) => (
          <div key={idx} className="bg-[#111111]/80 backdrop-blur-xl rounded-xl border border-white/5 p-4 flex items-center gap-4 hover:border-white/10 hover:bg-white/5 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${card.bg} ${card.text}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mt-0.5">{card.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Links */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4 tracking-wide">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link, idx) => (
            <div
              key={idx}
              onClick={() => navigate(link.path)}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 bg-[#111111]/80 backdrop-blur-xl z-10 ${link.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl drop-shadow-md">{link.icon}</span>
                <span className="text-xl font-bold drop-shadow-md">{link.count}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider">{link.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-6 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">Revenue Trend</h2>
              <p className="text-xs text-gray-400 mt-1">Monthly revenue over last 12 months</p>
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full tracking-wider">Last 12 months</div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#333"
                  fontSize={11}
                  tick={{ fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#333"
                  fontSize={11}
                  tick={{ fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050505",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                  formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#adminRevenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
              No revenue data
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-5 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white tracking-wide">Recent Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-[11px] uppercase font-bold text-blue-400 hover:text-blue-300 transition-colors drop-shadow-[0_0_5px_rgba(96,165,250,0.4)]"
            >
              View All →
            </button>
          </div>
          <div className="space-y-2.5">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 8).map((order, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 mb-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.02)] transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                      {(order.shippingAddress?.fullName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-[110px] tracking-wide">
                        {order.shippingAddress?.fullName || "Customer"}
                      </p>
                      <p className="text-[10px] font-medium text-gray-500 mt-0.5">
                        #{order._id?.slice(-5)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white tracking-wide mb-1">
                      ₹{order.totalPrice?.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${statusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus || "Pending"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-300 text-sm">
                No recent orders
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
