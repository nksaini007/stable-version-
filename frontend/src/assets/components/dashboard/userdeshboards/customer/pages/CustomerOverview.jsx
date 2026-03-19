import React, { useEffect, useState, useMemo, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaWallet,
  FaArrowRight,
  FaStar,
  FaShoppingBag,
  FaHammer,
  FaHeadset,
  FaUserCircle,
  FaCrown,
  FaChevronRight
} from "react-icons/fa";
import { Link } from "react-router-dom";

const MetricCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-sm shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{value}</p>
      </div>
    </div>
  </motion.div>
);

const QuickAction = ({ title, icon, color, path, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
  >
    <Link
      to={path}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 hover:bg-orange-50/30 transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white mb-2 shadow-sm transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{title}</span>
    </Link>
  </motion.div>
);

const CustomerOverview = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spending, setSpending] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, spendingRes] = await Promise.all([
          API.get("/orders/myorders"),
          API.get("/payments/customer/spending")
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setSpending(spendingRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const active = orders.filter(o => !["delivered", "cancelled", "returned"].includes((o.orderStatus || "").toLowerCase())).length;
    const delivered = orders.filter(o => (o.orderStatus || "").toLowerCase() === "delivered").length;
    return {
      total: orders.length,
      active,
      delivered,
      wallet: spending?.totalAmount || 0
    };
  }, [orders, spending]);

  return (
    <div className="space-y-8">
      {/* Hero Welcome - Simpler & Lighter */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-[80px] opacity-40"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-md text-[10px] font-bold uppercase tracking-wider">Customer Portal</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3"
            >
              Hello, <span className="text-orange-600">{user?.name?.split(' ')[0] || "there"}</span>!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed"
            >
              Manage your construction projects and track your orders all in one simple place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/project-categories" className="px-6 py-2.5 bg-gray-900 text-white hover:bg-black rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-gray-900/10">
                New Project <FaArrowRight />
              </Link>
              <Link to="/customer/orders" className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-all">
                Track Orders
              </Link>
            </motion.div>
          </div>
          <div className="hidden md:block w-32 h-32 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-500 text-5xl transform rotate-12 shadow-inner">
             <FaShoppingBag />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total Orders" value={metrics.total} icon={<FaShoppingBag />} color="bg-indigo-500" delay={0.1} />
        <MetricCard title="Active Shipments" value={metrics.active} icon={<FaTruck />} color="bg-orange-500" delay={0.2} />
        <MetricCard title="Delivered Items" value={metrics.delivered} icon={<FaCheckCircle />} color="bg-emerald-500" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List - Mini */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link to="/customer/orders" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">View All <FaArrowRight size={10}/></Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />)
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
                <FaBox size={40} className="mx-auto text-gray-200 mb-4" />
                <p className="font-bold text-gray-400">No recent orders found</p>
                <Link to="/project-categories" className="text-orange-500 text-sm font-bold mt-2 inline-block">Start Shopping</Link>
              </div>
            ) : (
              orders.slice(0, 4).map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                    {order.orderItems?.[0]?.image ? (
                      <img src={order.orderItems[0].image} className="w-full h-full object-cover" />
                    ) : <FaBox size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <h4 className="text-sm font-bold text-gray-900 truncate">{order.orderItems?.[0]?.name || "Multiple Items"}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${order.isPaid ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                      }`}>
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Side */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction title="Track" icon={<FaTruck />} color="bg-orange-500" path="/customer/orders" delay={0.1} />
              <QuickAction title="Projects" icon={<FaHammer />} color="bg-indigo-500" path="/my-construction" delay={0.2} />
              <QuickAction title="Help" icon={<FaHeadset />} color="bg-emerald-500" path="/support" delay={0.3} />
              <QuickAction title="Account" icon={<FaUserCircle />} color="bg-gray-800" path="/profile" delay={0.4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
