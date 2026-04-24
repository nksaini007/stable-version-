import React, { useEffect, useState, useMemo } from "react";
import API from "../../../../../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
  FaUndoAlt,
  FaFileInvoice
} from "react-icons/fa";
import ReturnRequestModal from "../../../order/ReturnRequestModal";
import { generateInvoice } from "../../../../../utils/invoiceGenerator";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: <FaClock /> },
  confirmed: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", icon: <FaCheckCircle /> },
  processing: { label: "Processing", color: "text-purple-600", bg: "bg-purple-50", icon: <FaBoxOpen /> },
  shipped: { label: "Shipped", color: "text-indigo-600", bg: "bg-indigo-50", icon: <FaTruck /> },
  delivered: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-50", icon: <FaCheckCircle /> },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: <FaTimesCircle /> },
  "return requested": { label: "Return Req", color: "text-orange-600", bg: "bg-orange-50", icon: <FaUndoAlt /> },
  "return approved": { label: "Return Appr", color: "text-teal-600", bg: "bg-teal-50", icon: <FaCheckCircle /> },
  "return picked up": { label: "Return Picked", color: "text-indigo-600", bg: "bg-indigo-50", icon: <FaTruck /> },
  "refunded": { label: "Refunded", color: "text-emerald-600", bg: "bg-emerald-50", icon: <FaCheckCircle /> },
};

const OrderRow = ({ order, isExpanded, onToggle, onCancel, onRequestReturn }) => {
  const status = (order.orderStatus || "pending").toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`bg-[#1A1A1C] rounded-2xl border transition-all duration-300 ${isExpanded ? "border-orange-500/50 shadow-sm ring-1 ring-orange-500/20" : "border-white/5 hover:border-white/10"}`}>
      <div 
        className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center text-2xl shrink-0`}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white truncate">
               {order.orderItems?.[0]?.name || "Package"}
               {order.orderItems?.length > 1 && <span className="text-gray-500 font-medium ml-1 text-xs">+ {order.orderItems.length - 1} more items</span>}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">#{order._id.slice(-8).toUpperCase()}</span>
              <span className="text-gray-700">|</span>
              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider"><FaCalendarAlt size={10}/> {date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="text-right">
             <p className="text-base font-bold text-white">₹{order.totalPrice?.toLocaleString()}</p>
             <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md inline-block ${config.bg} ${config.color} tracking-wider mt-1`}>
                {config.label}
             </div>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-gray-500">
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
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5 sm:p-6 bg-black/20 space-y-6">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address & Payment Info */}
                  <div className="space-y-4">
                     <div>
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h5>
                        <div className="bg-[#1A1A1C] p-4 rounded-2xl border border-white/5 flex gap-3">
                           <FaMapMarkerAlt className="text-orange-500 mt-1" />
                           <div className="text-xs">
                              <p className="font-bold text-white">{order.shippingAddress?.fullName}</p>
                              <p className="text-gray-400 leading-relaxed mt-1">{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}</p>
                              <p className="text-gray-500 mt-1">Contact: {order.shippingAddress?.phone}</p>
                           </div>
                        </div>
                     </div>
                     <div>
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Logistics Manifest</h5>
                        <div className="bg-[#1A1A1C] p-4 rounded-2xl border border-white/5 space-y-2">
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500 font-medium">Payment Mode</span>
                              <span className="font-bold text-white capitalize">{order.paymentMethod}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500 font-medium">Status</span>
                              <span className={`font-bold ${order.isPaid ? 'text-emerald-500' : 'text-orange-500'}`}>{order.isPaid ? 'PAID' : 'PENDING'}</span>
                           </div>
                           <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                              <span className="text-gray-500 font-medium">Items Total</span>
                              <span className="font-bold text-white uppercase tracking-wider">₹{order.itemsPrice}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500 font-medium">Logistics Charge</span>
                              <span className="font-bold text-white uppercase tracking-wider">₹{order.shippingPrice}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Item List */}
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Acquired Inventory</h5>
                    <div className="space-y-2">
                       {order.orderItems?.map((item, i) => {
                         const itemStatus = (item.itemStatus || "pending").toLowerCase();
                         const canReturn = itemStatus === "delivered";
                         return (
                         <div key={i} className="bg-[#1A1A1C] p-3 rounded-xl border border-white/5 flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-black/50 rounded-lg overflow-hidden shrink-0 border border-white/5">
                               {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="text-xs font-bold text-white truncate">{item.name}</div>
                               {item.variantName && <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{item.variantName}</div>}
                               
                               {/* Return Status indicator */}
                               {item.returnDetails?.isReturnRequested && (
                                   <div className="text-[9px] text-orange-400 font-bold uppercase tracking-widest mt-1">
                                      Return {item.returnDetails.status}
                                   </div>
                               )}
                            </div>
                            <div className="text-right shrink-0">
                               <p className="text-[10px] text-gray-500 font-bold">{item.qty} × ₹{item.price}</p>
                               <p className="text-sm font-bold text-white leading-none mt-1">₹{(item.qty * item.price).toLocaleString()}</p>
                            </div>
                            
                            {canReturn && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); onRequestReturn(order, item); }}
                                 className="ml-2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                 title="Request Return"
                               >
                                 <FaUndoAlt size={12} />
                               </button>
                            )}
                         </div>
                       )})}
                    </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                  {status === "pending" && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onCancel(order._id); }}
                      className="px-4 py-2 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors"
                    >
                      Cancel Requisition
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 text-black text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center gap-2"
                  >
                    <FaFileInvoice size={12} /> Download Invoice
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArchitectOrders = () => {
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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/orders/myorders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Sure you want to cancel this requisition?")) return;
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
    <div className="min-h-screen bg-[#0C0C0C] text-white p-6 md:p-10 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-widest relative inline-block">
                    My Orders
                    <div className="absolute -bottom-2 lg:-bottom-4 left-0 w-1/3 h-1 bg-[#ff5c00]"></div>
                </h1>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-4 lg:mt-6">
                    Track architectural inventory requisitions.
                </p>
            </div>
            {/* Search & Filter Bar */}
            <div className="bg-[#1A1A1C] p-2 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-2 w-full md:w-auto overflow-hidden">
                <div className="flex-1 bg-black/30 rounded-xl px-4 flex items-center gap-3 border border-transparent focus-within:border-white/10 transition-all">
                <FaSearch className="text-gray-500" size={14} />
                <input 
                    type="text" 
                    placeholder="Search requisitions..." 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full py-2.5 bg-transparent outline-none text-xs font-bold text-white placeholder:text-gray-600 tracking-wider uppercase"
                />
                </div>
                <div className="flex gap-2 shrink-0">
                <select 
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-black/30 hover:bg-black/50 rounded-xl border border-white/5 text-[10px] font-bold text-gray-300 uppercase tracking-widest outline-none transition-colors appearance-none cursor-pointer"
                >
                    <option value="all">ALL STAGES</option>
                    <option value="pending">PENDING</option>
                    <option value="processing">PROCESSING</option>
                    <option value="shipped">SHIPPED</option>
                    <option value="delivered">DELIVERED</option>
                    <option value="cancelled">CANCELLED</option>
                </select>
                </div>
            </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4 pt-6">
            {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#1A1A1C] rounded-2xl animate-pulse border border-white/5" />)
            ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-[#1A1A1C] rounded-3xl border border-dashed border-white/10">
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <FaBoxOpen size={30} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-widest uppercase">No Requisitions Found</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                    System database shows zero entries for the current query parameters.
                </p>
                <Link to="/categories" className="mt-8 px-8 py-3 bg-[#ff5c00] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] inline-block hover:bg-[#e65300] transition-all">Acquire Inventory</Link>
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
            <div className="flex items-center justify-center gap-4 py-10 opacity-50">
                <div className="w-2 h-2 bg-[#ff5c00] rounded-full"></div>
                <div className="w-16 h-[1px] bg-white/20"></div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">EOF</div>
                <div className="w-16 h-[1px] bg-white/20"></div>
                <div className="w-2 h-2 bg-[#ff5c00] rounded-full"></div>
            </div>
        )}
      </div>

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

export default ArchitectOrders;
