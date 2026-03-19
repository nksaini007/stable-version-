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
    { name: "Total Users", value: stats?.users || 0, icon: <FaUsers />, bg: "bg-blue-50", text: "text-blue-600", path: "/admin/users" },
    { name: "Products", value: stats?.products || 0, icon: <FaBox />, bg: "bg-emerald-50", text: "text-emerald-600", path: "/admin/products" },
    { name: "Total Orders", value: stats?.orders || 0, icon: <FaClipboardList />, bg: "bg-violet-50", text: "text-violet-600", path: "/admin/orders" },
    { name: "Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FaMoneyBillWave />, bg: "bg-amber-50", text: "text-amber-600", path: "/admin/payments" },
  ];

  const secondaryCards = [
    { name: "Paid Revenue", value: `₹${(stats?.paidRevenue || 0).toLocaleString()}`, icon: <FaCheckCircle />, bg: "bg-green-50", text: "text-green-600" },
    { name: "Pending Revenue", value: `₹${(stats?.pendingRevenue || 0).toLocaleString()}`, icon: <FaClock />, bg: "bg-orange-50", text: "text-orange-600" },
    { name: "Delivered", value: stats?.deliveredOrders || 0, icon: <FaTruck />, bg: "bg-cyan-50", text: "text-cyan-600" },
    { name: "Cancelled", value: stats?.cancelledOrders || 0, icon: <FaTimesCircle />, bg: "bg-red-50", text: "text-red-600" },
  ];

  const quickLinks = [
    { name: "Services", count: extraCounts.services, icon: <FaTools />, path: "/admin/services", color: "border-orange-200 bg-orange-50 text-orange-700" },
    { name: "Bookings", count: extraCounts.bookings, icon: <FaCalendarAlt />, path: "/admin/bookings", color: "border-blue-200 bg-blue-50 text-blue-700" },
    { name: "Plan Categories", count: extraCounts.planCategories, icon: <FaLayerGroup />, path: "/admin/plan-categories", color: "border-indigo-200 bg-indigo-50 text-indigo-700" },
    { name: "Blueprints", count: extraCounts.plans, icon: <FaMap />, path: "/admin/plans", color: "border-teal-200 bg-teal-50 text-teal-700" },
    { name: "Inquiries", count: extraCounts.messages, icon: <FaEnvelope />, path: "/admin/messages", color: "border-pink-200 bg-pink-50 text-pink-700" },
    { name: "Posts", count: extraCounts.posts, icon: <FaNewspaper />, path: "/admin/posts", color: "border-purple-200 bg-purple-50 text-purple-700" },
  ];

  const statusColor = (s) => {
    const map = {
      pending: "text-amber-600 bg-amber-50",
      shipped: "text-blue-600 bg-blue-50",
      delivered: "text-emerald-600 bg-emerald-50",
      cancelled: "text-red-600 bg-red-50",
    };
    return map[(s || "").toLowerCase()] || "text-gray-500 bg-gray-50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => card.path && navigate(card.path)}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${card.bg} ${card.text}`}>
                {card.icon}
              </div>
              <FaChevronRight className="text-gray-300 text-xs group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.name}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {secondaryCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${card.bg} ${card.text}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{card.value}</p>
              <p className="text-[11px] text-gray-400">{card.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Links */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link, idx) => (
            <div
              key={idx}
              onClick={() => navigate(link.path)}
              className={`rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${link.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{link.icon}</span>
                <span className="text-xl font-bold">{link.count}</span>
              </div>
              <p className="text-xs font-semibold">{link.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Revenue Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly revenue over last 12 months</p>
            </div>
            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Last 12 months</div>
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
                  stroke="#cbd5e1"
                  fontSize={11}
                  tick={{ fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#cbd5e1"
                  fontSize={11}
                  tick={{ fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
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
            <div className="h-60 flex items-center justify-center text-gray-300 border-2 border-dashed rounded-xl">
              No revenue data
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-2.5">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 8).map((order, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {(order.shippingAddress?.fullName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 truncate max-w-[110px]">
                        {order.shippingAddress?.fullName || "Customer"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        #{order._id?.slice(-5)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-800">
                      ₹{order.totalPrice?.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(
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
