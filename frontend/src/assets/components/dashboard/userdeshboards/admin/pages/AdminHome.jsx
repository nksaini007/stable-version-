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
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header Area (Tempo Style) */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex bg-[#1A1B1E] border border-[#2A2B2F] rounded-lg p-1 w-max">
          <button className="px-4 py-1.5 bg-[#2A2B2F] text-white text-xs font-semibold rounded-md shadow-sm">30 Days</button>
          <button className="px-4 py-1.5 text-[#8E929C] hover:text-white text-xs font-semibold rounded-md transition-colors">3 Months</button>
          <button className="px-4 py-1.5 text-[#8E929C] hover:text-white text-xs font-semibold rounded-md transition-colors">1 year</button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#1A1B1E] border border-[#2A2B2F] text-[#8E929C] hover:text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
            <FaClipboardList /> Export
          </button>
          <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
            New <FaChevronRight className="rotate-90 text-[10px]" />
          </button>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => card.path && navigate(card.path)}
            className="bg-[#1A1B1E] rounded-xl border border-[#2A2B2F] p-5 cursor-pointer hover:border-gray-600 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#8E929C] text-sm">{card.icon}</span>
              <span className="text-xs text-[#8E929C] font-medium">{card.name}</span>
            </div>
            <p className="text-[22px] font-bold text-white mb-2">{card.value}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-emerald-400">+12%</span>
              <span className="text-[10px] text-[#8E929C]">· Last 30 Days</span>
            </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl p-6 relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine className="text-[#8E929C] text-sm" />
                <h2 className="text-xs font-semibold text-[#8E929C]">Revenue Flow</h2>
              </div>
              <p className="text-2xl font-bold text-white mb-1">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="font-semibold text-emerald-400">+20%</span>
                <span className="text-[#8E929C]">· Last 30 Days</span>
              </div>
            </div>
            <button className="text-[#8E929C] hover:text-white">···</button>
          </div>
          
          {/* Subtle info box overlapping chart */}
          <div className="absolute left-6 top-32 z-10 bg-[#2A2B2F]/60 backdrop-blur-md border border-[#3A3B3F] p-3 rounded-lg w-48 hidden md:block">
            <p className="text-[10px] text-white font-bold mb-1">New Record Achieved!</p>
            <p className="text-[#8E929C] text-[9px] leading-relaxed mb-2">This month had the highest revenue since start.</p>
            <div className="flex items-center justify-between text-[#8E929C]">
              <FaChevronLeft className="text-[8px] cursor-pointer hover:text-white" />
              <div className="flex gap-1"><div className="w-3 h-0.5 bg-white rounded"></div><div className="w-1 h-0.5 bg-gray-500 rounded"></div></div>
              <FaChevronRight className="text-[8px] cursor-pointer hover:text-white" />
            </div>
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
                  stroke="#A78BFA"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-[#8E929C] text-xs">
              No revenue data
            </div>
          )}
        </div>

        {/* Recent Orders Tempo List */}
        <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <FaClock className="text-[#8E929C] text-sm" />
              <h2 className="text-xs font-semibold text-[#8E929C]">Recent Orders Breakdown</h2>
            </div>
            <button className="text-[#8E929C] hover:text-white">···</button>
          </div>
          <div className="space-y-0 text-sm">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-[#2A2B2F] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <div>
                      <p className="text-xs text-[#8E929C]">
                        {order.shippingAddress?.fullName || "Customer"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-white mb-0.5">
                      ₹{order.totalPrice?.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        order.orderStatus?.toLowerCase() === 'delivered' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : order.orderStatus?.toLowerCase() === 'cancelled'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-indigo-500/10 text-indigo-400'
                      }`}
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
