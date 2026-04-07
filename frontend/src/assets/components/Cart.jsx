
import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import { Trash2, ShieldCheck, Truck, FileText, ChevronRight, AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const navigate = useNavigate();

  // Security: Redirect unsigned users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "India",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryData, setDeliveryData] = useState(null);
  const [config, setConfig] = useState({ settings: { minCartValue: 500, maxCartValue: 50000 } });
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [customerNote, setCustomerNote] = useState("");

  const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeightKg = cartItems.reduce((sum, item) => sum + (item.weight || 5) * item.quantity, 0);
  const total = itemsTotal + (deliveryData?.totalCharge || 0);

  // Fetch Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await API.get("/config");
        if (data) setConfig(data);
      } catch (err) { console.error("Config fetch failed", err); }
    };
    fetchConfig();
  }, []);

  // Delivery Calculation
  useEffect(() => {
    if (shippingAddress.postalCode?.length === 6) {
      calculateDelivery();
    } else {
      setDeliveryData(null);
    }
  }, [shippingAddress.postalCode, cartItems]);

  const calculateDelivery = async () => {
    try {
      setCalcLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await API.post(
        `/delivery-pricing/calculate`,
        { pincode: shippingAddress.postalCode, weightKg: totalWeightKg, itemsPrice: itemsTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveryData(data);
    } catch (err) {
      setDeliveryData({ error: err.response?.data?.message || "Delivery unserviceable" });
    } finally {
      setCalcLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return setMessage("SYSTEM_ERROR: Empty Cart");
    if (deliveryData?.error || !deliveryData) return setMessage("SYSTEM_ERROR: Invalid Pincode");

    setLoading(true);
    setMessage("");

    const orderItems = cartItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
      image: item.images?.[0],
      price: item.price,
      product: item._id,
      variantId: item.variantId,
      seller: { _id: item.seller, name: item.sellerName || "Partner" },
    }));

    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsTotal,
      taxPrice: 0,
      shippingPrice: deliveryData?.totalCharge || 0,
      totalPrice: total,
      deliveryZone: deliveryData?.zone,
      deliveryVehicleType: deliveryData?.vehicleType,
      multiVehicle: deliveryData?.multiVehicle || false,
    };

    try {
      const token = localStorage.getItem("token");
      const { data } = await API.post(`/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (paymentMethod === "Razorpay") {
        const options = {
          key: data.razorpayKey,
          amount: Math.round(data.totalPrice * 100),
          currency: "INR",
          name: "Stinchar",
          description: "Purchase Order Payment",
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            try {
              setLoading(true);
              setMessage("VERIFYING TRANSACTION SIGNAL...");
              const verifyRes = await API.post("/orders/verify-payment", {
                orderId: data._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }, { headers: { Authorization: `Bearer ${token}` } });

              if (verifyRes.data.success) {
                clearCart();
                navigate("/dashboard/customer/orders");
              }
            } catch (err) {
              setLoading(false);
              setMessage(`SECURITY_ERROR: Payment Verification Failed`);
            }
          },
          prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone },
          theme: { color: "#fbbf24" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        clearCart();
        navigate("/dashboard/customer/orders");
      }
    } catch (err) {
      setLoading(false);
      setMessage(`SYSTEM_FAILURE: ${err.response?.data?.message || err.message}`);
    }
  };

  const isQuotationRequired = itemsTotal > (config.settings?.maxCartValue || 50000) || itemsTotal < (config.settings?.minCartValue || 0);

  const handleQuotationRequest = async () => {
    setLoading(true);
    const quotationData = {
      items: cartItems.map(item => ({ product: item._id, name: item.name, qty: item.quantity, price: item.price, variantId: item.variantId, seller: item.seller })),
      shippingAddress,
      customerNote,
    };
    try {
      const token = localStorage.getItem("token");
      await API.post(`/quotations`, quotationData, { headers: { Authorization: `Bearer ${token}` } });
      clearCart();
      navigate("/dashboard/customer/quotations");
    } catch (err) {
      setLoading(false);
      setMessage(`ERROR: Quotation Submission Failed`);
    }
  };

  return (
    <div className="bg-[#0f172a] min-h-screen text-slate-100 font-sans selection:bg-amber-400 selection:text-black pt-28 pb-20">
      <Nev />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Studio <span className="text-amber-400 font-medium">Cart</span>
             </h1>
             <p className="mt-3 text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShoppingBag size={16} className="text-amber-400" />
                {cartItems.length} Products Allocated to Manifest
             </p>
          </motion.div>
          <Link to="/products" className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 w-fit">
             <ArrowLeft size={14} /> Continue Selection
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center justify-center bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
             <div className="p-8 bg-slate-800/40 rounded-full mb-8">
               <ShoppingBag size={48} className="text-slate-600" />
             </div>
             <p className="text-xl font-bold text-slate-500 mb-8">Your cart is currently empty</p>
             <Link to="/products" className="px-10 py-4 bg-amber-400 text-slate-900 font-bold rounded-xl hover:bg-white transition-all shadow-xl shadow-amber-400/10">Browse Inventory</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* 📋 PART 1: Item Manifest */}
            <div className="lg:col-span-12 xl:col-span-7">
               <div className="space-y-4">
                  {cartItems.map((item, idx) => (
                    <motion.div 
                      layout
                      key={item._id + (item.variantId || "")} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 group hover:border-amber-400/30 transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row gap-8">
                         <div className="w-full sm:w-28 h-28 bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800">
                            <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         </div>

                         <div className="flex-1 flex flex-col justify-between">
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">{item.category}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">• {item.subcategory}</span>
                               </div>
                               <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase">{item.name}</h3>
                               {item.selectedVariant && (
                                 <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-2 tracking-tight">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                    {item.selectedVariant}
                                 </p>
                               )}
                            </div>

                            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-800/50">
                               <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
                                  <button onClick={() => decreaseQuantity(item._id, item.variantId)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors">−</button>
                                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                  <button onClick={() => increaseQuantity(item._id, item.variantId)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors">+</button>
                               </div>
                               <button onClick={() => removeFromCart(item._id, item.variantId)} className="text-slate-500 hover:text-red-400 text-xs font-bold transition-colors">REMOVE</button>
                            </div>
                         </div>

                         <div className="sm:text-right flex flex-col justify-between">
                            <div>
                               <div className="text-2xl font-bold text-white">₹{item.price.toLocaleString()}</div>
                               {item.mrp > item.price && (
                                 <div className="text-xs text-slate-500 line-through mt-1">₹{item.mrp.toLocaleString()}</div>
                               )}
                            </div>
                            <div className="text-[10px] font-black text-slate-600 bg-slate-950/50 px-2 py-1 rounded w-fit sm:ml-auto">
                               SUB_TOTAL: ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
               {cartItems.length > 0 && (
                  <button onClick={clearCart} className="mt-8 text-slate-500 hover:text-slate-300 text-[10px] font-bold tracking-widest uppercase transition-colors px-4 py-2 border border-slate-800 rounded-lg">Purge Manifest</button>
               )}
            </div>

            {/* 📦 PART 2: Logistics Desk */}
            <div className="lg:col-span-12 xl:col-span-5">
               <div className="sticky top-32 space-y-8">
                  
                  {/* Address Section */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                     <h3 className="text-base font-bold text-white mb-8 flex items-center gap-3">
                        <Truck size={20} className="text-amber-400" />
                        Logistics <span className="text-amber-400/60 font-medium">Protocol</span>
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                        {[
                          { label: "Target Name", name: "fullName", placeholder: "e.g. John Doe", span: "col-span-2" },
                          { label: "Post Code", name: "postalCode", placeholder: "6-Digits Required", span: "col-span-1" },
                          { label: "City", name: "city", placeholder: "Settlement Unit", span: "col-span-1" },
                          { label: "Address", name: "address", placeholder: "Full Street Data", span: "col-span-2" },
                          { label: "Comm Channel", name: "phone", placeholder: "Mobile Identifier", span: "col-span-2" },
                        ].map((field) => (
                          <div key={field.name} className={field.span}>
                             <label className="text-[9px] font-black uppercase text-slate-500 ml-1 mb-1.5 block tracking-widest">{field.label}</label>
                             <input
                               type="text"
                               name={field.name}
                               placeholder={field.placeholder}
                               value={shippingAddress[field.name]}
                               onChange={handleInputChange}
                               className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 placeholder:text-slate-700 text-sm font-semibold focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/10 outline-none transition-all shadow-inner"
                             />
                          </div>
                        ))}
                     </div>

                     {/* Delivery Intel */}
                     <AnimatePresence>
                       {shippingAddress.postalCode?.length === 6 && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-10 bg-slate-950/50 border border-slate-800 rounded-2xl p-5 overflow-hidden">
                            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-4 inline-block border-b-2 border-amber-400/20 pb-1">Logistics Recon</h4>
                            {calcLoading ? (
                              <div className="text-xs font-bold text-slate-500 animate-pulse">Calculating Dispatch Variables...</div>
                            ) : deliveryData?.error ? (
                              <div className="text-xs font-bold text-red-400 uppercase">{deliveryData.error}</div>
                            ) : deliveryData ? (
                               <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                                  <div>
                                     <span className="text-[10px] text-slate-600 block uppercase font-black tracking-tight mb-0.5">Fleet</span>
                                     <span className="font-bold text-slate-300">{deliveryData.vehicleCount}x {deliveryData.vehicleLabel}</span>
                                  </div>
                                  <div>
                                     <span className="text-[10px] text-slate-600 block uppercase font-black tracking-tight mb-0.5">Zone</span>
                                     <span className="font-bold text-slate-300">{deliveryData.zone} Block</span>
                                  </div>
                                  <div>
                                     <span className="text-[10px] text-slate-600 block uppercase font-black tracking-tight mb-0.5">Payload</span>
                                     <span className="font-bold text-slate-300">{totalWeightKg} KG Net</span>
                                  </div>
                                  <div>
                                     <span className="text-[10px] text-slate-600 block uppercase font-black tracking-tight mb-0.5">Origin</span>
                                     <span className="font-bold text-green-500">Secure Node</span>
                                  </div>
                               </div>
                            ) : null}
                         </motion.div>
                       )}
                     </AnimatePresence>

                     {/* Financial Manifest */}
                     <div className="space-y-4 border-t border-slate-800 pt-8 mb-8 font-sans">
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                           <span>Total Asset Value</span>
                           <span className="text-slate-200">₹{itemsTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                           <span>Estimated Dispatch Cost</span>
                           <span className="text-slate-200">{deliveryData?.totalCharge ? `₹${deliveryData.totalCharge.toLocaleString()}` : "Pending Recon"}</span>
                        </div>
                        <div className="flex justify-between items-end pt-4">
                           <span className="text-sm font-bold text-white uppercase tracking-tighter">Gross Secure Total</span>
                           <div className="text-right">
                              <span className="text-3xl font-black text-amber-400 leading-none tracking-tight">₹{total.toLocaleString()}</span>
                              <p className="text-[9px] font-bold text-slate-600 uppercase flex items-center justify-end gap-1 mt-1.5">
                                 <ShieldCheck size={10} className="text-green-500/50" /> Secure Price Verified
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Payment Protocol */}
                     <div className="grid grid-cols-2 gap-3 mb-10">
                        {["COD", "Razorpay"].map((m) => (
                           <button
                             key={m}
                             onClick={() => setPaymentMethod(m)}
                             className={`px-4 py-3 text-[11px] font-black uppercase rounded-xl transition-all border ${paymentMethod === m ? "bg-amber-400 text-slate-900 border-amber-400 shadow-lg shadow-amber-400/10" : "bg-slate-950 text-slate-500 border-slate-800"}`}
                           >
                              {m === "COD" ? "Manual Dispatch" : "Digital Crypt"}
                           </button>
                        ))}
                     </div>

                     {/* Executive Action */}
                     <div className="space-y-5">
                       {isQuotationRequired ? (
                         <button
                           onClick={() => setShowQuotationModal(true)}
                           disabled={loading}
                           className="w-full py-5 bg-white text-slate-900 font-extrabold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all"
                         >
                           <FileText size={18} /> {loading ? "Communicating..." : "Request Studio Quotation"}
                         </button>
                       ) : (
                         <button
                           onClick={handleCheckout}
                           disabled={loading || calcLoading || !deliveryData || deliveryData.error}
                           className="w-full py-5 bg-amber-400 text-slate-900 font-extrabold uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-400/10 flex items-center justify-center gap-3 hover:bg-white hover:translate-y-[-2px] transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
                         >
                           {loading ? "Processing..." : "Confirm & Execute Order"}
                           <ChevronRight size={18} />
                         </button>
                       )}
                     </div>

                     {message && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-4 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                           <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed flex items-start gap-3">
                              <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                              {message}
                           </p>
                        </motion.div>
                     )}
                  </div>
                  
                  <div className="bg-amber-400 shadow-2xl p-0.5 rounded-3xl group">
                     <div className="bg-slate-950 rounded-[inherit] px-8 py-6 relative overflow-hidden">
                        <div className="flex items-center gap-5">
                           <div className="p-3 bg-amber-400/10 rounded-full">
                              <FileText size={20} className="text-amber-400" />
                           </div>
                           <div>
                              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Enterprise Pricing?</h4>
                              <p className="text-xs text-slate-500">Manual valuation for bulk/architect units.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* 📋 MODAL: QUOTATION OVERLAY */}
      <AnimatePresence>
        {showQuotationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-amber-400"></div>
               
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center">
                     <FileText size={28} className="text-amber-400" />
                  </div>
                  <div>
                     <h3 className="text-3xl font-bold text-white tracking-tight">Studio <span className="text-amber-400">Inquiry</span></h3>
                     <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Protocol ID: INQ_{Date.now().toString().slice(-4)}</p>
                  </div>
               </div>

               <div className="space-y-6 mb-10">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 px-1">Detailed Requirements (Optional)</label>
                    <textarea
                      placeholder="e.g. Need delivery by next Tuesday, special protective packaging, etc."
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm font-medium text-white focus:border-amber-400/50 outline-none transition-all min-h-[160px] shadow-inner"
                    />
                  </div>
                  <div className="flex gap-10 px-2">
                     <div>
                        <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Entity Name</span>
                        <span className="text-sm font-bold text-slate-300">{shippingAddress.fullName || "GUEST"}</span>
                     </div>
                     <div>
                        <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">估算估值 (Valuation)</span>
                        <span className="text-sm font-bold text-amber-400">₹{itemsTotal.toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => setShowQuotationModal(false)} className="flex-1 py-4 bg-slate-800/50 text-slate-400 font-bold rounded-2xl hover:bg-slate-800 transition-all uppercase text-xs tracking-widest">Abort</button>
                  <button onClick={handleQuotationRequest} className="flex-1 py-4 bg-amber-400 text-slate-900 font-extrabold rounded-2xl shadow-xl shadow-amber-400/10 hover:bg-white transition-all uppercase text-xs tracking-widest">Submit Proposal</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Cart;