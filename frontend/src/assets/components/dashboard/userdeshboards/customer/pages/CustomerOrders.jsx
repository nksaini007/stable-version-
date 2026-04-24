import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  FaUndoAlt
} from "react-icons/fa";
import ReturnRequestModal from "../../../order/ReturnRequestModal";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-zinc-500", bg: "bg-zinc-50 border border-zinc-200", icon: <FaClock /> },
  confirmed: { label: "Confirmed", color: "text-zinc-600", bg: "bg-zinc-100 border border-zinc-200", icon: <FaCheckCircle /> },
  processing: { label: "Processing", color: "text-zinc-700", bg: "bg-zinc-100 border border-zinc-300", icon: <FaBoxOpen /> },
  shipped: { label: "Shipped", color: "text-zinc-800", bg: "bg-zinc-200 border border-zinc-300", icon: <FaTruck /> },
  delivered: { label: "Delivered", color: "text-zinc-900", bg: "bg-zinc-100 border border-zinc-900", icon: <FaCheckCircle /> },
  cancelled: { label: "Cancelled", color: "text-zinc-400", bg: "bg-zinc-50 border border-zinc-100", icon: <FaTimesCircle /> },
};

const OrderRow = ({ order, isExpanded, onToggle, onCancel, onRequestReturn }) => {
  const status = (order.orderStatus || "pending").toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`bg-white rounded-xl transition-all duration-300 ${isExpanded ? "border border-zinc-300 shadow-md ring-1 ring-zinc-100" : "border border-zinc-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)]"}`}>
      <div 
        className="p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-lg ${config.bg} ${config.color} flex items-center justify-center text-sm shrink-0`}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-medium text-zinc-900 truncate tracking-tight !font-medium">
               {order.orderItems?.[0]?.name || "Package"}
               {order.orderItems?.length > 1 && <span className="text-zinc-400 font-normal ml-1 text-[10px]">+ {order.orderItems.length - 1} more items</span>}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">#{order._id.slice(-8).toUpperCase()}</span>
              <span className="text-zinc-200">|</span>
              <span className="text-[9px] font-medium text-zinc-500 flex items-center gap-1 uppercase tracking-widest"><FaCalendarAlt size={8}/> {date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="text-right flex flex-col items-end">
             <p className="text-sm font-medium text-zinc-900 !font-medium">₹{order.totalPrice?.toLocaleString()}</p>
             <div className={`text-[8px] font-medium uppercase px-2 py-0.5 rounded mt-1 inline-block ${config.bg} ${config.color} tracking-widest`}>
                {config.label}
             </div>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-zinc-300">
             <FaChevronDown size={12} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-zinc-100"
          >
            <div className="p-5 bg-zinc-50/30 space-y-6">
               {/* Order Progress Visualization */}
               <div className="relative pt-4 pb-2">
                  <div className="absolute top-5 left-4 right-4 h-[2px] bg-zinc-100 rounded-full"></div>
                  <div className="flex justify-between relative z-10 px-4">
                     {Object.keys(STATUS_CONFIG).filter(k => k !== 'cancelled').map((key, i) => {
                        const stepConfig = STATUS_CONFIG[key];
                        const isDone = Object.keys(STATUS_CONFIG).indexOf(status) >= Object.keys(STATUS_CONFIG).indexOf(key);
                        const isCurrent = status === key;
                        return (
                          <div key={key} className="flex flex-col items-center">
                             <div className={`w-2.5 h-2.5 rounded-full border border-white shadow-sm ring-1 ${isDone ? "bg-zinc-900 ring-zinc-900" : "bg-zinc-200 ring-zinc-200"}`} />
                             <span className={`text-[8px] font-medium mt-2 uppercase tracking-widest ${isCurrent ? "text-zinc-900" : "text-zinc-400"}`}>{stepConfig.label}</span>
                          </div>
                        );
                     })}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address & Payment Info */}
                  <div className="space-y-4">
                     <div>
                        <h5 className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mb-1.5">Delivery Address</h5>
                        <div className="bg-white p-3 rounded-xl border border-zinc-100 flex gap-3">
                           <FaMapMarkerAlt size={10} className="text-zinc-400 mt-0.5" />
                           <div className="text-[11px] font-light text-zinc-600 !font-light">
                              <p className="font-medium text-zinc-900 mb-0.5 !font-medium">{order.shippingAddress?.fullName}</p>
                              <p className="leading-relaxed">{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}</p>
                              <p className="mt-0.5">Contact: {order.shippingAddress?.phone}</p>
                           </div>
                        </div>
                     </div>
                     <div>
                        <h5 className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mb-1.5">Payment Details</h5>
                        <div className="bg-white p-3 rounded-xl border border-zinc-100 space-y-1.5">
                           <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-500">Method</span>
                              <span className="font-medium text-zinc-900 uppercase !font-medium">{order.paymentMethod}</span>
                           </div>
                           <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-500">Status</span>
                              <span className={`font-medium !font-medium ${order.isPaid ? 'text-zinc-900' : 'text-zinc-500'}`}>{order.isPaid ? 'PAID' : 'PENDING'}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Item List */}
                  <div>
                    <h5 className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mb-1.5">Ordered Items</h5>
                    <div className="space-y-2">
                       {order.orderItems?.map((item, i) => {
                         const itemStatus = (item.itemStatus || "pending").toLowerCase();
                         const canReturn = itemStatus === "delivered";
                         return (
                         <div key={i} className="bg-white p-2.5 rounded-xl border border-zinc-100 flex items-center gap-3 group">
                            <div className="w-8 h-8 bg-zinc-50 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                               {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="text-[11px] font-medium text-zinc-800 truncate !font-medium">{item.name}</div>
                               {item.returnDetails?.isReturnRequested && (
                                   <div className="text-[8px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
                                      Return {item.returnDetails.status}
                                   </div>
                               )}
                            </div>
                            <div className="text-right shrink-0">
                               <p className="text-[9px] text-zinc-400">{item.qty} × ₹{item.price}</p>
                               <p className="text-[11px] font-medium text-zinc-900 leading-none mt-0.5 !font-medium">₹{(item.qty * item.price).toLocaleString()}</p>
                            </div>

                            {canReturn && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); onRequestReturn(order, item); }}
                                 className="ml-2 w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors opacity-0 group-hover:opacity-100 border border-transparent hover:border-zinc-200"
                                 title="Request Return"
                               >
                                 <FaUndoAlt size={10} />
                               </button>
                            )}
                         </div>
                       )})}
                    </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                  {status === "pending" && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onCancel(order._id); }}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-[9px] font-medium uppercase tracking-widest hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-[9px] font-medium uppercase tracking-widest hover:bg-black transition-all shadow-sm">
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

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState(null);

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

  const handleRequestReturn = (order, item) => {
     setSelectedOrderForReturn(order);
     setSelectedItemForReturn(item);
     setReturnModalOpen(true);
  };

  const handleReturnSuccess = (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
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
    <div className="max-w-4xl mx-auto space-y-6 customer-theme">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
              <h1 className="text-xl font-medium text-zinc-900 tracking-tight">Recent Orders</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Track & Manage Your Purchases</p>
          </div>
          <div className="w-full sm:w-auto flex gap-2">
            <div className="flex-1 sm:w-48 bg-white border border-zinc-200 rounded-xl px-3 flex items-center gap-2 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all shadow-sm">
                <FaSearch className="text-zinc-400" size={10} />
                <input 
                    type="text" 
                    placeholder="Search ID or Item..." 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full py-2 bg-transparent outline-none text-[11px] font-medium placeholder:text-zinc-400"
                />
            </div>
            <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-medium text-zinc-600 outline-none transition-colors shadow-sm uppercase tracking-widest"
            >
                <option value="all">ALL</option>
                <option value="pending">PENDING</option>
                <option value="processing">PROCESSING</option>
                <option value="shipped">SHIPPED</option>
                <option value="delivered">DELIVERED</option>
                <option value="cancelled">CANCELLED</option>
            </select>
          </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-16 bg-zinc-50 border border-zinc-100 rounded-xl animate-pulse" />)
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200">
             <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-100">
                <FaBoxOpen size={16} className="text-zinc-300" />
             </div>
             <h3 className="text-sm font-medium text-zinc-900 mb-1">No Orders Found</h3>
             <p className="text-[10px] text-zinc-400 tracking-wide">Try adjusting your filters or search terms.</p>
             <Link to="/project-categories" className="mt-4 px-5 py-2 bg-zinc-900 text-white rounded-lg font-medium text-[10px] tracking-widest uppercase inline-block hover:bg-black transition-all shadow-sm">Browse Catalog</Link>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderRow 
              key={order._id} 
              order={order} 
              isExpanded={expandedId === order._id}
              onToggle={() => setExpandedId(expandedId === order._id ? null : order._id)}
              onCancel={handleCancel}
              onRequestReturn={handleRequestReturn}
            />
          ))
        )}
      </div>

      {!loading && filteredOrders.length > 0 && (
         <div className="flex items-center justify-center gap-3 py-6">
            <div className="h-px bg-zinc-100 flex-1 max-w-[100px]"></div>
            <div className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest">End of History</div>
            <div className="h-px bg-zinc-100 flex-1 max-w-[100px]"></div>
         </div>
      )}

      <ReturnRequestModal 
        isOpen={returnModalOpen}
        onClose={() => { setReturnModalOpen(false); setSelectedOrderForReturn(null); setSelectedItemForReturn(null); }}
        order={selectedOrderForReturn}
        item={selectedItemForReturn}
        onSuccess={handleReturnSuccess}
      />
    </div>
  );
};

export default CustomerOrders;
