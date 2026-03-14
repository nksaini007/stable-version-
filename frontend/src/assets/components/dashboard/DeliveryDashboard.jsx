import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  FaTruck,
  FaRoute,
  FaWallet,
  FaCheckCircle,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaArrowRight,
  FaChartLine,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import API from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import Nev from "../Nev";

const DeliveryDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || "overview";

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    pendingOrders: 0,
    completedToday: 0,
    totalEarnings: 0,
    weeklyEarnings: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabFromUrl); // overview | assigned | payments
  const [actionLoading, setActionLoading] = useState(null);

  // Sync tab with router prop
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        API.get("/orders/delivery/my-orders"),
        API.get("/orders/delivery/stats"),
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching delivery data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pickup order
  const handlePickup = async (orderId) => {
    try {
      setActionLoading(orderId);
      await API.put("/orders/delivery/pickup", { orderId });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pickup");
    } finally {
      setActionLoading(null);
    }
  };

  // Confirm delivery
  const handleDeliver = async (orderId) => {
    try {
      setActionLoading(orderId);
      await API.put("/orders/delivery/confirm", { orderId });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm delivery");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter orders
  const assignedOrders = orders.filter((o) => !o.isDelivered && o.orderStatus !== "Cancelled");
  const completedOrders = orders.filter((o) => o.isDelivered);

  const statusBadge = (status) => {
    const map = {
      Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
      "Out for Delivery": "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
      Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
      Cancelled: "bg-red-500/20 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
      Pending: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return map[status] || map.Pending;
  };

  const renderOrderCard = (order) => (
    <div
      key={order._id}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Order Header */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-cyan-400/80 bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-400/20">
              #{order._id.slice(-8).toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(
                order.orderStatus
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <FaUser className="text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium text-gray-200">{order.user?.name || "Unknown"}</p>
              </div>
            </div>
            {order.user?.phone && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <FaPhone className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="font-medium text-gray-200">{order.user.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 md:col-span-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FaMapMarkerAlt className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Delivery Address</p>
                <p className="font-medium text-gray-200 leading-tight">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}{" "}
                  - {order.shippingAddress?.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-wrap gap-2 pt-2">
            {order.orderItems.map((item, idx) => (
              <span
                key={idx}
                className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                {item.name} <span className="text-gray-500 font-medium">×{item.qty}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-col items-end justify-between min-w-[200px] gap-6">
          <div className="text-right bg-gradient-to-br from-white/10 to-transparent p-4 rounded-xl border border-white/10 w-full">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Value</p>
            <p className="text-2xl font-bold text-white mb-2">
              ₹{order.totalPrice?.toLocaleString()}
            </p>
            <div className="flex items-center justify-end gap-2 text-sm">
              <span className="text-gray-400">{order.paymentMethod}</span>
              {order.paymentMethod === "COD" && !order.isPaid ? (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Collect Cash
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Paid
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!order.isDelivered && order.orderStatus !== "Cancelled" && (
            <div className="w-full">
              {order.orderStatus === "Shipped" && (
                <button
                  onClick={() => handlePickup(order._id)}
                  disabled={actionLoading === order._id}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/50 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all font-semibold disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  {actionLoading === order._id ? (
                    <span className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  ) : (
                    <FaTruck className="text-lg" />
                  )}
                  Pick Up Order
                </button>
              )}
              {order.orderStatus === "Out for Delivery" && (
                <button
                  onClick={() => handleDeliver(order._id)}
                  disabled={actionLoading === order._id}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/50 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all font-semibold disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  {actionLoading === order._id ? (
                    <span className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <FaCheckCircle className="text-lg" />
                  )}
                  Mark Delivered
                </button>
              )}
            </div>
          )}

          {order.isDelivered && (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <FaCheckCircle className="text-lg" />
              <span>
                Delivered on{" "}
                {order.deliveredAt &&
                  new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Order Tracking Timeline */}
      {order.tracking && order.tracking.length > 0 && (
        <div className="bg-white/[0.02] border-t border-white/5 px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {order.tracking.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-xs text-gray-400 whitespace-nowrap"
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${idx === order.tracking.length - 1
                    ? "border-cyan-400 bg-cyan-400/20 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "border-gray-600 bg-gray-600/20"
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full ${idx === order.tracking.length - 1 ? "bg-cyan-400" : "bg-gray-500"}`} />
                </div>
                <div className="flex flex-col">
                  <span className={idx === order.tracking.length - 1 ? "text-cyan-400 font-medium" : "text-gray-500"}>
                    {t.status}
                  </span>
                  {t.date && (
                    <span className="text-[10px] text-gray-500">
                      {new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {idx < order.tracking.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-700/50 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1c] bg-gradient-to-br from-[#0a0f1c] via-[#111827] to-[#0f172a] text-gray-100 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none z-0"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                  {user?.name || "Partner"}
                </span>
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Manage your deliveries, track earnings, and stay on top of your schedule.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-10 mx-auto scrollbar-hide">
            {[
              { id: "overview", label: "Overview", icon: <FaChartLine /> },
              { id: "assigned", label: "Assigned Orders", icon: <FaRoute />, count: assignedOrders.length },
              { id: "payments", label: "Payments & Earnings", icon: <FaWallet /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/30"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-cyan-500/30 text-cyan-200" : "bg-white/10 text-gray-300"
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-cyan-400 font-medium animate-pulse">Syncing Dashboard...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* === OVERVIEW TAB === */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        title: "Total Deliveries",
                        value: stats.totalDeliveries,
                        icon: <FaTruck className="text-2xl" />,
                        colors: "from-cyan-500 to-blue-600",
                        bgColors: "bg-cyan-500/10 border-cyan-500/20",
                        iconColor: "text-cyan-400 bg-cyan-400/10",
                      },
                      {
                        title: "Pending Orders",
                        value: stats.pendingOrders,
                        icon: <FaRoute className="text-2xl" />,
                        colors: "from-amber-400 to-orange-500",
                        bgColors: "bg-amber-500/10 border-amber-500/20",
                        iconColor: "text-amber-400 bg-amber-400/10",
                      },
                      {
                        title: "Completed Today",
                        value: stats.completedToday,
                        icon: <FaCheckCircle className="text-2xl" />,
                        colors: "from-emerald-400 to-teal-500",
                        bgColors: "bg-emerald-500/10 border-emerald-500/20",
                        iconColor: "text-emerald-400 bg-emerald-400/10",
                      },
                      {
                        title: "Total Earnings",
                        value: `₹${stats.totalEarnings.toLocaleString()}`,
                        icon: <FaWallet className="text-2xl" />,
                        colors: "from-purple-400 to-pink-500",
                        bgColors: "bg-purple-500/10 border-purple-500/20",
                        iconColor: "text-purple-400 bg-purple-400/10",
                      },
                    ].map((card, idx) => (
                      <div
                        key={idx}
                        className={`relative overflow-hidden rounded-3xl ${card.bgColors} border backdrop-blur-xl p-6 group hover:scale-[1.03] transition-all duration-300`}
                      >
                        {/* Background glow */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${card.colors} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">{card.title}</p>
                            <h3 className="text-3xl font-bold bg-white bg-clip-text text-transparent">
                              {card.value}
                            </h3>
                          </div>
                          <div className={`p-4 rounded-2xl ${card.iconColor} shadow-inner`}>
                            {card.icon}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Banner */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-cyan-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-white mb-2">Ready to hit the road?</h2>
                      <p className="text-cyan-100/80">You have {assignedOrders.length} orders waiting to be delivered today.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("assigned")}
                      className="relative z-10 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center gap-2"
                    >
                      View Assigned Orders <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* === ASSIGNED ORDERS TAB === */}
              {activeTab === "assigned" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg"><FaRoute /></span>
                      Active Deliveries
                    </h2>
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium text-gray-300">
                      {assignedOrders.length} Orders
                    </span>
                  </div>

                  {assignedOrders.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                      <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6">
                        <FaBoxOpen className="text-5xl text-cyan-400/50" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">You're all caught up!</h3>
                      <p className="text-gray-400 max-w-sm">
                        There are no pending orders assigned to you at the moment. Take a breather!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {assignedOrders.map(renderOrderCard)}
                    </div>
                  )}
                </div>
              )}

              {/* === PAYMENTS & EARNINGS TAB === */}
              {activeTab === "payments" && (
                <div className="space-y-8">
                  {/* Earnings Header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-purple-500/30 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group">
                      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
                      <div className="relative z-10">
                        <p className="text-purple-200/80 font-medium mb-2 flex items-center gap-2">
                          <FaWallet /> Total Lifetime Earnings
                        </p>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 drop-shadow-sm">
                          ₹{stats.totalEarnings.toLocaleString()}
                        </h2>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-center gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Completed Deliveries</p>
                        <p className="text-2xl font-bold text-white">{completedOrders.length}</p>
                      </div>
                      <div className="h-px w-full bg-white/10"></div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Pending COD Collections</p>
                        <p className="text-2xl font-bold text-amber-400">
                          ₹{completedOrders.filter(o => o.paymentMethod === "COD" && !o.isPaid).reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chart Section */}
                  {stats.weeklyEarnings.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                          <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><FaChartLine /></span>
                          Weekly Earnings Trend
                        </h2>
                      </div>

                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.weeklyEarnings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                              dataKey="day"
                              stroke="#94a3b8"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              dy={10}
                            />
                            <YAxis
                              stroke="#94a3b8"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                backdropFilter: "blur(10px)",
                                borderRadius: "16px",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                                color: "#f8fafc",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                                padding: "12px 16px"
                              }}
                              itemStyle={{ color: "#a78bfa", fontWeight: "bold" }}
                              formatter={(val) => [`₹${val}`, "Earnings"]}
                              labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="amount"
                              stroke="url(#colorEarnings)"
                              strokeWidth={4}
                              dot={{ r: 4, fill: "#a78bfa", stroke: "#4c1d95", strokeWidth: 2 }}
                              activeDot={{ r: 8, fill: "#c4b5fd", stroke: "#4c1d95", strokeWidth: 2, className: "animate-ping" }}
                            />
                            <defs>
                              <linearGradient id="colorEarnings" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="50%" stopColor="#c084fc" />
                                <stop offset="100%" stopColor="#e879f9" />
                              </linearGradient>
                            </defs>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Payment History List */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Recent Completed Deliveries</h2>

                    {completedOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No completed deliveries yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-xs text-gray-400 uppercase bg-white/5 rounded-lg border-b border-white/10">
                            <tr>
                              <th className="px-4 py-3 font-medium rounded-tl-lg">Order ID</th>
                              <th className="px-4 py-3 font-medium">Customer</th>
                              <th className="px-4 py-3 font-medium">Date</th>
                              <th className="px-4 py-3 font-medium">Payment Type</th>
                              <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {completedOrders.slice(0, 10).map((order) => (
                              <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-4 font-mono text-cyan-400/80">
                                  #{order._id.slice(-8).toUpperCase()}
                                </td>
                                <td className="px-4 py-4 text-gray-300">
                                  {order.user?.name || "Unknown"}
                                </td>
                                <td className="px-4 py-4 text-gray-400">
                                  {order.deliveredAt
                                    ? new Date(order.deliveredAt).toLocaleDateString()
                                    : "N/A"}
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentMethod === "COD"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    }`}>
                                    {order.paymentMethod}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-white">
                                  ₹{order.totalPrice?.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
