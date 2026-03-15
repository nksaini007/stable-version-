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
  FaUserCircle
} from "react-icons/fa";
import { Link } from "react-router-dom";

const MetricCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group cursor-default"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-current/10 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
        Active
      </div>
    </div>
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{title}</h3>
    <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
  </motion.div>
);

const QuickAction = ({ title, icon, color, path, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
  >
    <Link
      to={path}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group"
    >
      <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white mb-3 shadow-lg transition-transform group-hover:rotate-12`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{title}</span>
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
      {/* Hero Welcome */}
      <div className="relative overflow-hidden bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">Verified Member</span>
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => <FaStar key={i} size={10} />)}
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black mb-4 leading-tight"
          >
            Welcome Back, <br className="sm:hidden" />
            <span className="text-orange-500">{user?.name?.split(' ')[0] || "Friend"}</span>!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-gray-400 text-lg sm:text-lg mb-8"
          >
            Your construction journey continues here. Track your orders, manage your projects, and explore new materials.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/project-categories" className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/30">
              Start Project <FaArrowRight />
            </Link>
            <Link to="/customer/orders" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-bold transition-all">
              Track Order
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Orders" value={metrics.total} icon={<FaShoppingBag />} color="bg-indigo-500" delay={0.1} />
        <MetricCard title="Active Shipments" value={metrics.active} icon={<FaTruck />} color="bg-orange-500" delay={0.2} />
        <MetricCard title="Delivered Items" value={metrics.delivered} icon={<FaCheckCircle />} color="bg-emerald-500" delay={0.3} />
        <MetricCard title="Wallet Spend" value={`₹${metrics.wallet.toLocaleString()}`} icon={<FaWallet />} color="bg-purple-500" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List - Mini */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Orders</h3>
            <Link to="/customer/orders" className="text-sm font-bold text-orange-600 hover:underline">View All</Link>
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
                  className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                    {order.orderItems?.[0]?.image ? (
                      <img src={order.orderItems[0].image} className="w-full h-full object-cover" />
                    ) : <FaBox size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <h4 className="text-base font-bold text-gray-900 truncate">{order.orderItems?.[0]?.name || "Multiple Items"}</h4>
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
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction title="Track" icon={<FaTruck />} color="bg-orange-500" path="/customer/orders" delay={0.1} />
              <QuickAction title="Projects" icon={<FaHammer />} color="bg-indigo-500" path="/my-construction" delay={0.2} />
              <QuickAction title="Help" icon={<FaHeadset />} color="bg-emerald-500" path="/customer/support" delay={0.3} />
              <QuickAction title="Privacy" icon={<FaUserCircle />} color="bg-gray-800" path="/profile" delay={0.4} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white shadow-xl">
            <h4 className="text-xl font-black mb-2">Need Expert Help?</h4>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Our architects are ready to guide you through your dream project.</p>
            <Link to="/project-categories" className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-center block hover:scale-[1.02] transition-transform">
              Consult Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
