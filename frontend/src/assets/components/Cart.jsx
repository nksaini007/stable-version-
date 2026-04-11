
import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import { Trash2, ShieldCheck, Truck, FileText, ChevronRight, AlertCircle, ShoppingBag, ArrowLeft, Info, HelpCircle } from "lucide-react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";


const Cart = () => {
  const navigate = useNavigate();

  // Security: Redirect unsigned users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    verifyCart,
    isVerifying,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);


  // Zero-Trust: Verify cart on load
  useEffect(() => {
    verifyCart();
  }, []);

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
  const totalWeightKg = cartItems.reduce((sum, item) => {
    const weightMatch = String(item.weight || "0").match(/(\d+(\.\d+)?)/);
    const unitWeight = weightMatch ? parseFloat(weightMatch[0]) : 0;
    return sum + unitWeight * item.quantity;
  }, 0);
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
    if (shippingAddress.postalCode?.length === 6) calculateDelivery();
    else setDeliveryData(null);
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
    if (cartItems.length === 0) return setMessage("SYSTEM_ERROR: Cart is empty");
    if (deliveryData?.error || !deliveryData) return setMessage("LOGISTICS_ERROR: Pincode verification pending");

    setLoading(true);
    setMessage("");

    const orderItems = cartItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
      image: item.images?.[0] || item.image,
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
          description: "Secure Order Payment",
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            setLoading(true);
            setMessage("VERIFYING_PAYMENT_SIGNATURE...");
            try {
              const verifyData = {
                orderId: data._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };
              
              const { data: verifyRes } = await API.post("/orders/verify-payment", verifyData, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (verifyRes.success) {
                clearCart();
                navigate("/dashboard/customer/orders");
              } else {
                throw new Error("Signature verification failed");
              }
            } catch (err) {
              setLoading(false);
              setMessage(`SECURITY_ERROR: Payment Verification Aborted`);
            }
          },
          prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone },
          theme: { color: "#064e3b" },
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
      userRole: user?.role
    };


    try {
      const token = localStorage.getItem("token");
      await API.post(`/quotations`, quotationData, { headers: { Authorization: `Bearer ${token}` } });
      clearCart();
      navigate("/dashboard/customer/quotations");
    } catch (err) {
      setLoading(false);
      setMessage(`ERROR: ${err.response?.data?.message || "Quotation Routing Failed"}`);
    }

  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pt-32 pb-24 relative overflow-hidden">
      <Nev />
      
      {/* Decorative Aura */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-slate-100 rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header Terminal */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                Manifest <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800 font-medium">Cart</span>
             </h1>
             <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                   <ShieldCheck size={14} /> {isVerifying ? "ENCRYPTED_SYNC_IN_PROGRESS..." : "E2E_ENCRYPTED_NODE"}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <HelpCircle size={12} /> SESSION_ID: {Date.now().toString().slice(-6)} // SIG_VERIFIED
                </div>
             </div>
          </motion.div>
          <Link to="/products" className="group flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold text-sm transition-all">
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-24 rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center border border-slate-100">
             <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-10 text-slate-200">
               <ShoppingBag size={48} />
             </div>
             <p className="text-2xl font-bold text-slate-400 mb-10">Your manifest is currently empty</p>
             <Link to="/products" className="px-12 py-5 bg-[#064e3b] text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/20 hover:scale-105 transition-all">Discover Inventory</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* 📋 INVENTORY FEED */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-10">
               <div className="space-y-6">
                  {cartItems.map((item, idx) => (
                    <motion.div 
                      layout
                      key={item._id + (item.variantId || "")} 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 group hover:border-emerald-200 transition-all flex flex-col md:flex-row gap-10"
                    >
                       <div className="w-full md:w-40 h-40 bg-slate-50 rounded-3xl overflow-hidden flex-shrink-0 border border-slate-100">
                          <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       </div>

                       <div className="flex-1 flex flex-col justify-between py-2">
                          <div>
                             <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black text-slate-500 uppercase tracking-widest">{item.category}</span>
                                {item.selectedVariant && (
                                  <span className="text-[10px] bg-emerald-50 px-3 py-1 rounded-full font-black text-emerald-700 uppercase tracking-widest">{item.selectedVariant}</span>
                                )}
                             </div>
                             <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">{item.name}</h3>
                          </div>

                          <div className="flex items-center gap-8 mt-8">
                             <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100 shadow-inner">
                                <button onClick={() => decreaseQuantity(item._id, item.variantId)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-700 transition-colors font-bold text-xl">−</button>
                                <span className="w-10 text-center font-extrabold text-slate-900">{item.quantity}</span>
                                <button onClick={() => increaseQuantity(item._id, item.variantId)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-700 transition-colors font-bold text-xl">+</button>
                             </div>
                             <button onClick={() => removeFromCart(item._id, item.variantId)} className="text-slate-300 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 group/btn">
                                <Trash2 size={14} className="group-hover/btn:rotate-12" /> Remove Item
                             </button>
                          </div>
                       </div>

                       <div className="md:text-right flex flex-col justify-between items-end py-2">
                          <div>
                             <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{item.price.toLocaleString()}</div>
                             {item.mrp > item.price && (
                               <div className="text-xs font-bold text-slate-300 line-through mt-1 italic">₹{item.mrp.toLocaleString()}</div>
                             )}
                          </div>
                          <div className="text-[10px] font-black text-emerald-900 bg-emerald-50 px-4 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm flex items-center gap-2">
                             {item.inStock === false && <AlertCircle size={10} className="text-red-500" />}
                             ITEM_SUB: ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
               
               <button onClick={clearCart} className="mx-auto block text-slate-300 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.4em] transition-colors py-4">
                  ! Initialize Manifest Purge
               </button>
            </div>

            {/* 🏺 LOGISTICS SLAB */}
            <div className="lg:col-span-12 xl:col-span-5 relative">
               <div className="sticky top-32">
                  <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 relative overflow-hidden backdrop-blur-3xl">
                     <div className="absolute top-0 right-0 w-4 h-full bg-[#064e3b]"></div>
                     
                     <h3 className="text-xl font-extrabold text-slate-900 mb-10 flex items-baseline gap-3">
                        Protocol <span className="text-emerald-700 font-medium lowercase italic">Logistics</span>
                     </h3>

                     <div className="space-y-6 mb-12">
                        {[
                          { label: "Target Name", name: "fullName", placeholder: "Official Identification" },
                          { label: "Destination Code", name: "postalCode", placeholder: "Primary Pincode" },
                          { label: "Sector Unit", name: "city", placeholder: "City / Settlement" },
                          { label: "Spatial Port", name: "address", placeholder: "Detailed Street Address" },
                          { label: "Signal Handle", name: "phone", placeholder: "Encrypted Contact UID" },
                        ].map((field) => (
                          <div key={field.name}>
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">{field.label}</label>
                             <input
                               type="text"
                               name={field.name}
                               placeholder={field.placeholder}
                               value={shippingAddress[field.name]}
                               onChange={handleInputChange}
                               className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-200 outline-none transition-all shadow-inner placeholder:text-slate-200"
                             />
                          </div>
                        ))}
                     </div>

                     <AnimatePresence>
                       {shippingAddress.postalCode?.length === 6 && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-2 bg-emerald-50 rounded-[2rem]">
                            <div className="bg-white border border-emerald-100 rounded-[1.8rem] p-6 shadow-sm">
                               <div className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Truck size={12} /> RECON_DATA_UNLOCKED
                               </div>
                               {calcLoading ? (
                                  <div className="text-xs font-bold text-emerald-800 animate-bounce">Recalculating dispatch assets...</div>
                               ) : deliveryData?.error ? (
                                  <div className="text-xs font-black text-red-500 uppercase">{deliveryData.error}</div>
                               ) : deliveryData ? (
                                  <div className="grid grid-cols-2 gap-6 text-xs">
                                     <div>
                                        <span className="text-[9px] text-slate-400 block uppercase font-bold mb-1">Fleet Unit</span>
                                        <span className="font-extrabold text-emerald-900">{deliveryData.vehicleCount}x {deliveryData.vehicleLabel}</span>
                                     </div>
                                     <div>
                                        <span className="text-[9px] text-slate-400 block uppercase font-bold mb-1">Spatial Zone</span>
                                        <span className="font-extrabold text-emerald-900">{deliveryData.zone}</span>
                                     </div>
                                     <div>
                                        <span className="text-[9px] text-slate-400 block uppercase font-bold mb-1">Payload Weight</span>
                                        <span className="font-extrabold text-emerald-900">{totalWeightKg} KG</span>
                                     </div>
                                     <div>
                                        <span className="text-[9px] text-slate-300 block uppercase font-bold mb-1">Status</span>
                                        <span className="font-extrabold text-[#064e3b] italic">Authorized</span>
                                     </div>
                                  </div>
                               ) : null}
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>

                     <div className="space-y-4 pt-10 border-t border-slate-50 mb-12">
                        <div className="flex justify-between text-sm font-bold text-slate-400">
                           <span>Total Valuation</span>
                           <span className="text-slate-800">₹{itemsTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-400">
                           <span>Dispatch Charges</span>
                           <span className="text-slate-800">{deliveryData?.totalCharge ? `₹${deliveryData.totalCharge.toLocaleString()}` : "TBD"}</span>
                        </div>
                        <div className="flex justify-between items-end pt-6 border-t-2 border-slate-50">
                           <span className="text-lg font-black text-slate-900 leading-none">GRAND_TOTAL</span>
                           <div className="text-right">
                              <span className="text-4xl font-extrabold text-[#064e3b] tracking-tighter">₹{total.toLocaleString()}</span>
                              <div className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mt-2 inline-flex items-center gap-1">
                                 <ShieldCheck size={10} /> SECURE_TRANSACTION
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-12">
                        {["COD", "Razorpay"].map((m) => (
                           <button
                             key={m}
                             onClick={() => setPaymentMethod(m)}
                             className={`px-4 py-4 text-[10px] font-black uppercase rounded-2xl transition-all border-2 ${paymentMethod === m ? "bg-[#064e3b] text-white border-[#064e3b] shadow-xl shadow-emerald-900/20" : "bg-white text-slate-300 border-slate-100"}`}
                           >
                              {m === "COD" ? "Manual Payment" : "Secure Gateway"}
                           </button>
                        ))}
                     </div>

                     <div className="space-y-5">
                       {isQuotationRequired ? (
                         <button
                           onClick={() => setShowQuotationModal(true)}
                           disabled={loading}
                           className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-widest rounded-[1.8rem] hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3"
                         >
                           <FileText size={20} className="text-emerald-400 italic" />
                           {loading ? "Routing inquiry..." : "Initiate Studio Quotation"}
                         </button>
                       ) : (
                         <button
                           onClick={handleCheckout}
                           disabled={loading || calcLoading || !deliveryData || deliveryData.error}
                           className="w-full py-6 bg-[#064e3b] text-white font-black uppercase tracking-widest rounded-[1.8rem] shadow-[0_20px_40px_-15px_rgba(6,78,59,0.3)] hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-20 disabled:scale-100 flex items-center justify-center gap-3"
                         >
                           {loading ? "Verifying..." : "Execute Financial Order"} <ChevronRight size={20} />
                         </button>
                       )}
                     </div>

                     {message && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-10 p-5 rounded-3xl border-2 ${message.includes('ERROR') || message.includes('FAILURE') ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-800'} text-[10px] font-black uppercase tracking-widest flex items-start gap-4`}>
                           <AlertCircle size={16} className="flex-shrink-0" />
                           <span>{message}</span>
                        </motion.div>
                     )}
                  </div>
                  
                  <div className="mt-8 bg-white/40 p-10 rounded-[3rem] border border-white/60 backdrop-blur-md">
                     <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed text-center">
                        Secure Transaction Node V: 0x47A83. All logistics and fiscal valuations are verified via the Stinchar Secure Database Protocol.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔮 QUOTATION HUB OVERLAY */}
      <AnimatePresence>
        {showQuotationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-white rounded-[4rem] shadow-2xl max-w-2xl w-full p-16 relative">
               <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-10 text-[#064e3b]">
                  <FileText size={40} />
               </div>
               
               <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter mb-4">Official <span className="text-emerald-700 italic font-medium">Inquiry</span></h3>
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-12 flex items-center gap-3">
                  <Info size={14} /> Protocol ID: SUB_INIT_{Date.now().toString().slice(-4)}
               </p>

               <div className="space-y-10 mb-16">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 ml-2 tracking-widest">Custom Requirements Manifest</label>
                    <textarea
                      placeholder="Specify architect units, alternate delivery timelines, or bulk pricing requests..."
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] p-8 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-100 outline-none transition-all min-h-[180px] shadow-inner"
                    />
                  </div>
                  <div className="flex gap-16 ml-2">
                     <div>
                        <span className="text-[9px] font-black text-slate-300 uppercase block mb-1">Entity Handle</span>
                        <span className="text-sm font-extrabold text-slate-900">{shippingAddress.fullName || "GUEST_USER"}</span>
                     </div>
                     <div>
                        <span className="text-[9px] font-black text-slate-300 uppercase block mb-1">Pre-Valuation</span>
                        <span className="text-sm font-extrabold text-emerald-900 uppercase">₹{itemsTotal.toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-6">
                  <button onClick={() => setShowQuotationModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-3xl hover:bg-slate-100 transition-all uppercase text-[11px] tracking-widest">Abort Inquiry</button>
                  <button 
                    onClick={handleQuotationRequest} 
                    disabled={loading || !shippingAddress.fullName || shippingAddress.postalCode.length < 6}
                    className="flex-1 py-5 bg-[#064e3b] text-white font-black rounded-3xl shadow-xl shadow-emerald-900/20 hover:scale-[1.03] transition-all uppercase text-[11px] tracking-widest disabled:opacity-30 disabled:grayscale"
                  >
                    Transmit Protocol
                  </button>

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