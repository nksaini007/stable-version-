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
  FaShoppingBag,
  FaHammer,
  FaHeadset,
  FaUserCircle,
  FaChevronRight,
  FaFileInvoice
} from "react-icons/fa";
import { Link } from "react-router-dom";

// Inject Outfit Font and reset global styles that might be breaking the dashboard
const FontLoader = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&display=swap');
      
      .customer-theme {
        font-family: 'Outfit', sans-serif !important;
      }
      
      /* Reset global h1/h2/h3/h4 overrides that force uppercase and extra bold */
      .customer-theme h1, 
      .customer-theme h2, 
      .customer-theme h3, 
      .customer-theme h4, 
      .customer-theme p, 
      .customer-theme span {
        font-family: 'Outfit', sans-serif !important;
        text-transform: none !important;
        letter-spacing: normal !important;
      }
      
      /* Only specific elements should be uppercase if we tell them to */
      .customer-theme .force-uppercase {
        text-transform: uppercase !important;
        letter-spacing: 0.1em !important;
      }

      /* Force background wrapper to ensure no black bleed */
      .customer-theme-wrapper {
        min-height: 100vh;
        background-color: #FAFAFA !important;
        padding: 24px;
        border-radius: 20px;
      }
    `}
  </style>
);

const MetricCard = ({ title, value, icon, iconColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-3 px-4 sm:p-4 sm:px-5 rounded-xl border border-zinc-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 group flex items-center justify-between gap-4"
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center shadow-sm shrink-0`}>
        {icon}
      </div>
      <h3 className="text-[10px] sm:text-[11px] font-medium text-zinc-500 force-uppercase tracking-wide">{title}</h3>
    </div>
    <p className="text-xl sm:text-2xl font-light text-zinc-800 tracking-tight leading-none !font-light">{value}</p>
  </motion.div>
);

const QuickAction = ({ title, icon, path, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
  >
    <Link
      to={path}
      className="flex items-center gap-4 p-4 bg-zinc-50/50 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-md"
    >
      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 transition-transform group-hover:scale-105 shadow-sm">
        {icon}
      </div>
      <span className="text-[12px] font-medium text-zinc-700 tracking-wide !font-medium">{title}</span>
      <FaChevronRight size={10} className="text-zinc-300 ml-auto group-hover:text-zinc-600 transition-colors" />
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
    <div className="customer-theme customer-theme-wrapper">
      <FontLoader />
      
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Hero Welcome - Minimalist Executive Style */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-zinc-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] relative overflow-hidden">
          {/* Subtle decorative accent */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-100 rounded-full blur-[80px] opacity-60"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
                <span className="text-[11px] font-medium text-zinc-500 force-uppercase">Workspace</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-light text-zinc-800 mb-2 !font-light"
              >
                Good to see you, <span className="!font-normal text-zinc-900">{user?.name?.split(' ')[0] || "there"}</span>.
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-500 text-[14px] max-w-md leading-relaxed font-light mb-8 !font-light"
              >
                Here is an overview of your recent activity, active projects, and latest orders. Everything is running smoothly.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/project-categories" className="px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-[12px] font-medium transition-all shadow-md flex items-center gap-2">
                  Start New Project
                </Link>
                <Link to="/dashboard/customer/orders" className="px-6 py-3 bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 rounded-xl text-[12px] font-medium transition-all shadow-sm hover:shadow-md">
                  View History
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MetricCard title="Total Orders" value={metrics.total} icon={<FaShoppingBag size={10} />} iconColor="bg-slate-50 text-slate-600" delay={0.1} />
          <MetricCard title="Active Shipping" value={metrics.active} icon={<FaTruck size={10} />} iconColor="bg-slate-50 text-slate-600" delay={0.2} />
          <MetricCard title="Completed" value={metrics.delivered} icon={<FaCheckCircle size={10} />} iconColor="bg-slate-50 text-slate-600" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders List - Ultra Minimal */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-[14px] font-medium text-zinc-800 tracking-wide !font-medium">Recent Activity</h3>
              <Link to="/dashboard/customer/orders" className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
                See All <FaArrowRight size={10}/>
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-zinc-100 shadow-sm" />)
              ) : orders.length === 0 ? (
                <div className="bg-white py-12 rounded-2xl border border-dashed border-zinc-200 text-center shadow-sm">
                  <FaBox size={32} className="mx-auto text-zinc-200 mb-4" />
                  <p className="text-[13px] font-light text-zinc-500 !font-light">No activity to show yet.</p>
                </div>
              ) : (
                orders.slice(0, 4).map((order, idx) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-zinc-200 transition-all duration-300 flex items-center gap-5 group"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-zinc-400 overflow-hidden shrink-0 border border-zinc-100 group-hover:scale-105 transition-transform">
                      {order.orderItems?.[0]?.image ? (
                        <img src={order.orderItems[0].image} className="w-full h-full object-cover" />
                      ) : <FaBox size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-zinc-400 force-uppercase mb-1">ID: {order._id.slice(-6).toUpperCase()}</p>
                      <h4 className="text-[14px] font-medium text-zinc-800 truncate !font-medium">{order.orderItems?.[0]?.name || "Multiple Items"}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-medium text-zinc-800 mb-1 !font-medium">₹{order.totalPrice?.toLocaleString()}</p>
                      <span className={`text-[10px] font-medium px-3 py-1 rounded-lg force-uppercase ${order.isPaid ? "bg-zinc-100 text-zinc-700" : "bg-zinc-50 text-zinc-400 border border-zinc-100"
                        }`}>
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-[14px] font-medium text-zinc-800 tracking-wide !font-medium">Shortcuts</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col gap-3">
              <QuickAction title="Order Tracking" icon={<FaTruck size={14} />} path="/dashboard/customer/orders" delay={0.1} />
              <QuickAction title="My Construction" icon={<FaHammer size={14} />} path="/my-construction" delay={0.2} />
              <QuickAction title="Quotations" icon={<FaFileInvoice size={14} />} path="/dashboard/customer/quotations" delay={0.3} />
              <QuickAction title="Support Center" icon={<FaHeadset size={14} />} path="/dashboard/customer/support" delay={0.4} />
              <QuickAction title="Profile Settings" icon={<FaUserCircle size={14} />} path="/dashboard/customer/profile" delay={0.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
