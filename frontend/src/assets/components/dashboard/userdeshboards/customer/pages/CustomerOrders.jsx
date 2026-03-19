import React, { useEffect, useState, useMemo } from "react";
import API from "../../../../../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, 
  FaFilter, 
  FaBoxOpen, 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaChevronDown,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExclamationCircle
} from "react-icons/fa";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: <FaClock /> },
  confirmed: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", icon: <FaCheckCircle /> },
  processing: { label: "Processing", color: "text-purple-600", bg: "bg-purple-50", icon: <FaBoxOpen /> },
  shipped: { label: "Shipped", color: "text-indigo-600", bg: "bg-indigo-50", icon: <FaTruck /> },
  delivered: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-50", icon: <FaCheckCircle /> },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: <FaTimesCircle /> },
};

const OrderRow = ({ order, isExpanded, onToggle, onCancel }) => {
  const status = (order.orderStatus || "pending").toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? "border-orange-200 shadow-sm ring-1 ring-orange-100" : "border-gray-50 hover:shadow-md"}`}>
      <div 
        className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center text-2xl shrink-0`}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-gray-900 truncate">
               {order.orderItems?.[0]?.name || "Package"}
               {order.orderItems?.length > 1 && <span className="text-gray-400 font-medium ml-1 text-xs">+ {order.orderItems.length - 1} more items</span>}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">#{order._id.slice(-8).toUpperCase()}</span>
              <span className="text-gray-200">|</span>
              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider"><FaCalendarAlt size={10}/> {date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="text-right">
             <p className="text-base font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
             <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md inline-block ${config.bg} ${config.color} tracking-wider`}>
                {config.label}
             </div>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-gray-300">
             <FaChevronDown />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-5 sm:p-6 bg-gray-50/30 space-y-6">
               {/* Order Progress Visualization */}
               <div className="relative pt-6 pb-2">
                  <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
                  <div className="flex justify-between relative z-10">
                     {Object.keys(STATUS_CONFIG).filter(k => k !== 'cancelled').map((key, i) => {
                        const stepConfig = STATUS_CONFIG[key];
                        const isDone = Object.keys(STATUS_CONFIG).indexOf(status) >= Object.keys(STATUS_CONFIG).indexOf(key);
                        const isCurrent = status === key;
                        return (
                          <div key={key} className="flex flex-col items-center">
                             <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ring-1 ${isDone ? "bg-orange-500 ring-orange-500" : "bg-gray-300 ring-gray-300"}`} />
                             <span className={`text-[9px] font-bold mt-2 uppercase tracking-tighter ${isCurrent ? "text-orange-600" : "text-gray-400"}`}>{stepConfig.label}</span>
                          </div>
                        );
                     })}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address & Payment Info */}
                  <div className="space-y-4">
                     <div>
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</h5>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-3">
                           <FaMapMarkerAlt className="text-orange-500 mt-1" />
                           <div className="text-xs">
                              <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                              <p className="text-gray-500 leading-relaxed mt-1">{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}</p>
                              <p className="text-gray-400 mt-1">Contact: {order.shippingAddress?.phone}</p>
                           </div>
                        </div>
                     </div>
                     <div>
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h5>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500 font-medium">Method</span>
                              <span className="font-bold text-gray-900 capitalize">{order.paymentMethod}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500 font-medium">Status</span>
                              <span className={`font-bold ${order.isPaid ? 'text-emerald-600' : 'text-orange-600'}`}>{order.isPaid ? 'PAID' : 'PENDING'}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Item List */}
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ordered Items</h5>
                    <div className="space-y-2">
                       {order.orderItems?.map((item, i) => (
                         <div key={i} className="bg-white p-3 rounded-xl border border-gray-50 flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                               {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 text-xs font-bold text-gray-800 truncate">{item.name}</div>
                            <div className="text-right shrink-0">
                               <p className="text-[10px] text-gray-400 font-bold">{item.qty} × ₹{item.price}</p>
                               <p className="text-sm font-bold text-gray-900 leading-none">₹{(item.qty * item.price).toLocaleString()}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  {status === "pending" && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onCancel(order._id); }}
                      className="px-4 py-2 rounded-xl border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
                    Download Invoice
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/myorders");
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Sure you want to cancel this?")) return;
    try {
      await API.put(`/orders/cancel/${id}`);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: 'Cancelled' } : o));
    } catch (err) {
       alert("Could not cancel order.");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = statusFilter === 'all' || (o.orderStatus || '').toLowerCase() === statusFilter;
      const matchSearch = (o._id || '').toLowerCase().includes(query.toLowerCase()) || 
                          (o.orderItems || []).some(i => i.name?.toLowerCase().includes(query.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [orders, query, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-gray-50 rounded-xl px-4 flex items-center gap-3 border border-transparent focus-within:border-orange-100 focus-within:bg-white transition-all">
          <FaSearch className="text-gray-300" size={14} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full py-2.5 bg-transparent outline-none text-xs font-medium placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-2">
           <select 
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value)}
             className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl border-none text-sm font-bold text-gray-600 outline-none transition-colors"
           >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
           </select>
           <button className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
              <FaFilter size={16} />
           </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-100">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBoxOpen size={30} className="text-gray-200" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-1">No Orders Found</h3>
             <p className="text-xs text-gray-400 font-medium">Try adjusting your filters or search terms.</p>
             <Link to="/project-categories" className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs inline-block hover:bg-black transition-all">Browse Products</Link>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderRow 
              key={order._id} 
              order={order} 
              isExpanded={expandedId === order._id}
              onToggle={() => setExpandedId(expandedId === order._id ? null : order._id)}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>

      {!loading && filteredOrders.length > 0 && (
         <div className="flex items-center justify-center gap-3 py-6">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-orange-500 shadow-sm cursor-pointer hover:bg-orange-50 font-black">1</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">End of History</div>
         </div>
      )}
    </div>
  );
};

export default CustomerOrders;
