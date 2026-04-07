
import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import { Trash2, ShieldCheck, Truck, FileText, ChevronRight, AlertCircle, Package } from "lucide-react";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const navigate = useNavigate();

  // Redirect unsigned users to login
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

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalWeightKg = cartItems.reduce(
    (sum, item) => sum + (item.weight || 5) * item.quantity,
    0
  );

  const total = itemsTotal + (deliveryData?.totalCharge || 0);

  // Fetch Config for thresholds
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await API.get("/config");
        if (data) setConfig(data);
      } catch (err) { console.error("Config fetch failed", err); }
    };
    fetchConfig();
  }, []);

  // Auto-calculate delivery when pincode changes
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
    if (cartItems.length === 0) {
      setMessage("ERROR: INVENTORY EMPTY!");
      return;
    }

    if (deliveryData?.error || !deliveryData) {
      setMessage("ERROR: VALID DELIVERY PINCODE REQUIRED!");
      return;
    }

    for (let key in shippingAddress) {
      if (!shippingAddress[key]) {
        setMessage(`ERROR: DATA_MISSING_IN [${key.toUpperCase()}]`);
        return;
      }
    }

    setLoading(true);
    setMessage("");

    const orderItems = cartItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
      image: item.images?.[0],
      price: item.price,
      product: item._id,
      variantId: item.variantId,
      seller: {
        _id: item.seller,
        name: item.sellerName || "Unknown Entity",
      },
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
              setMessage("VERIFYING PAYMENT SIGNAL...");
              const verifyRes = await API.post(
                "/orders/verify-payment",
                {
                  orderId: data._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.success) {
                setLoading(false);
                setMessage("SYSTEM_MSG: PAYMENT VERIFIED. ORDER FINALIZED.");
                clearCart();
                setTimeout(() => navigate("/dashboard/customer/orders"), 2000);
              }
            } catch (err) {
              setLoading(false);
              setMessage(`ERROR: VERIFICATION_FAILED: ${err.response?.data?.message || err.message}`);
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            contact: shippingAddress.phone,
          },
          theme: { color: "#ff5c00" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          setMessage(`[ALERT] PAYMENT_FAILED: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        setLoading(false);
        setMessage("SYSTEM_MSG: ORDER COMPILED SUCCESSFULLY. CASH ON DELIVERY ENGAGED.");
        clearCart();
        setTimeout(() => navigate("/dashboard/customer/orders"), 2000);
      }
    } catch (err) {
      setLoading(false);
      setMessage(`SYSTEM_FAILURE: ${err.response?.data?.message || err.message}`);
    }
  };

  const isQuotationRequired = itemsTotal > (config.settings?.maxCartValue || 50000) || itemsTotal < (config.settings?.minCartValue || 0);

  const handleQuotationRequest = async () => {
    setLoading(true);
    setMessage("");

    const quotationData = {
      items: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        qty: item.quantity,
        price: item.price,
        variantId: item.variantId,
        seller: item.seller,
      })),
      shippingAddress,
      customerNote,
    };

    try {
      const token = localStorage.getItem("token");
      await API.post(`/quotations`, quotationData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      setMessage("SYSTEM_MSG: QUOTATION REQUEST LOGGED. ADMIN REVIEW PENDING.");
      setShowQuotationModal(false);
      setTimeout(() => navigate("/dashboard/customer/quotations"), 2000);
    } catch (err) {
      setLoading(false);
      setMessage(`ERROR: QUOTATION_FAILURE: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-mono selection:bg-[#ff5c00] selection:text-black tech-grid relative flex flex-col pt-24">
      <Nev />
      <div className="scanline"></div>

      <div className="max-w-[1800px] mx-auto w-full px-6 md:px-12 py-10 relative z-10 flex-1">
        
        {/* Header Terminal */}
        <div className="relative mb-14 border-l-4 border-[#ff5c00] pl-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[#ff5c00] text-[10px] font-black tracking-[0.5em] uppercase mb-2 animate-pulse">
              <ShieldCheck size={14} />
              ACQUISITION_PROTOCOL_v.2.4 :: SECURE_NODE
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase leading-tight">
              Cart <span className="text-[#ff5c00]">Manifest</span>
            </h1>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 backdrop-blur-md hidden md:block">
             <div className="text-[9px] text-white/40 uppercase mb-1">SYSTEM_STATUS</div>
             <div className="text-xs font-black flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                TERMINAL_ACTIVE // ENCRYPTION_ENABLED
             </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-sm relative group">
            <div className="corner-decal decal-tl !border-white/20"></div>
            <div className="corner-decal decal-br !border-white/20"></div>
            <Package size={64} className="text-white/10 mb-8 group-hover:text-[#ff5c00] transition-colors duration-500" />
            <p className="text-[12px] font-black opacity-30 uppercase tracking-[0.5em] mb-8">INVENTORY_UNITS_UNALLOCATED</p>
            <Link to="/products" className="px-10 py-4 bg-[#ff5c00] text-black font-black uppercase tracking-widest hover:bg-white transition-all">REP_POPULATE_INVENTORY</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* 🛠️ LEFT: INVENTORY FEED */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-4 mb-8">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">ALLOCATED_CARGO</h2>
                 <div className="flex-1 h-[1px] bg-white/10"></div>
              </div>

              <div className="space-y-4">
                {cartItems.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item._id + (item.variantId || "")} 
                    className="bg-white/5 border border-white/10 hover:border-[#ff5c00] transition-all p-4 relative group"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                       {/* Spec Image */}
                       <div className="w-full md:w-32 h-32 bg-black/40 border border-white/5 relative overflow-hidden flex-shrink-0">
                          <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                       </div>

                       {/* Specs */}
                       <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap gap-2">
                             <span className="text-[8px] bg-white/10 px-2 py-0.5 font-black uppercase tracking-widest text-[#ff5c00]">{item.category}</span>
                             <span className="text-[8px] bg-white/5 px-2 py-0.5 font-black uppercase tracking-widest text-white/40">{item.subcategory}</span>
                          </div>
                          <h3 className="text-xl font-black uppercase text-white group-hover:text-[#ff5c00] transition-colors">{item.name}</h3>
                          
                          {item.selectedVariant && (
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/60">
                               <div className="w-2 h-2 bg-[#ff5c00] rounded-full"></div>
                               VARIANT_SPEC :: {item.selectedVariant}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-4">
                             <div className="flex items-center border border-white/10 bg-black/40">
                                <button onClick={() => decreaseQuantity(item._id)} className="w-8 h-8 flex items-center justify-center hover:bg-[#ff5c00] hover:text-black transition-colors">−</button>
                                <span className="w-10 text-center text-xs font-black">{item.quantity}</span>
                                <button onClick={() => increaseQuantity(item._id)} className="w-8 h-8 flex items-center justify-center hover:bg-[#ff5c00] hover:text-black transition-colors">+</button>
                             </div>
                             <button onClick={() => removeFromCart(item._id)} className="text-white/20 hover:text-red-500 transition-colors uppercase text-[9px] font-black flex items-center gap-1">
                                <Trash2 size={12} /> PURGE_ITEM
                             </button>
                          </div>
                       </div>

                       {/* Price Unit */}
                       <div className="text-right flex flex-col justify-between">
                          <div className="space-y-1">
                             <div className="text-2xl font-black text-white">₹{item.price.toLocaleString()}</div>
                             {item.mrp > item.price && (
                               <div className="text-[10px] text-white/20 line-through font-black text-right">MRP: ₹{item.mrp.toLocaleString()}</div>
                             )}
                          </div>
                          <div className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                             SUB: ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button onClick={clearCart} className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-red-500 transition-colors flex items-center gap-2">
                 [!] INITIALIZE_LOGISTICS_PURGE
              </button>
            </div>

            {/* 🧾 RIGHT: LOGISTICS HUB */}
            <div className="lg:col-span-4 space-y-8">
               
               {/* Shipping Protocol */}
               <div className="bg-white text-black p-8 relative shadow-[10px_10px_0px_#ff5c00]">
                  <div className="corner-decal decal-tl !border-black/20"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2 border-b border-black/5 pb-4">
                    <Truck size={14} className="text-[#ff5c00]" />
                    LOGISTICS_PROTOCOL :: DESTINATION
                  </h3>

                  <div className="space-y-4 mb-8">
                     {[
                       { label: "Entity Name", name: "fullName" },
                       { label: "Target Address", name: "address" },
                       { label: "Sector (City)", name: "city" },
                       { label: "Post Code", name: "postalCode" },
                       { label: "Contact Channel", name: "phone" },
                     ].map((field) => (
                       <div key={field.name} className="space-y-1">
                          <label className="text-[7px] font-black uppercase text-black/40 ml-1">{field.label}</label>
                          <input
                            type="text"
                            name={field.name}
                            placeholder={`SET_${field.name.toUpperCase()}`}
                            value={shippingAddress[field.name]}
                            onChange={handleInputChange}
                            className="w-full bg-[#f5f5f5] border border-black/5 p-3 text-xs font-black outline-none focus:border-[#ff5c00] transition-colors"
                          />
                       </div>
                     ))}
                  </div>

                  {/* Logistics Status Report */}
                  <AnimatePresence>
                    {shippingAddress.postalCode?.length === 6 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 border-l-2 border-[#ff5c00] bg-black/5 p-4 overflow-hidden"
                      >
                         <h4 className="text-[8px] font-black uppercase text-black/60 mb-2 underline decoration-[#ff5c00]">LOGISTICS_RECON_REPORT</h4>
                         {calcLoading ? (
                           <div className="text-[10px] font-black animate-pulse uppercase tracking-widest text-[#ff5c00]">CALCULATING_ROUTE_LOAD...</div>
                         ) : deliveryData?.error ? (
                           <div className="text-[10px] font-black text-red-500 uppercase">{deliveryData.error}</div>
                         ) : deliveryData ? (
                            <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase">
                               <div className="space-y-1">
                                  <div className="text-black/40 text-[7px]">ZONE_TAG</div>
                                  <div>{deliveryData.zone}</div>
                               </div>
                               <div className="space-y-1">
                                  <div className="text-black/40 text-[7px]">PAYLOAD_WEIGHT</div>
                                  <div>{totalWeightKg} KG</div>
                               </div>
                               <div className="space-y-1">
                                  <div className="text-black/40 text-[7px]">FLEET_REQUIREMENT</div>
                                  <div>{deliveryData.vehicleCount}x {deliveryData.vehicleLabel}</div>
                               </div>
                               <div className="space-y-1">
                                  <div className="text-black/40 text-[7px]">DISPATCH_STATUS</div>
                                  <div className="text-[#ff5c00]">READY</div>
                               </div>
                            </div>
                         ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Financial Summary */}
                  <div className="space-y-3 mb-8 border-t border-black/5 pt-6">
                     <div className="flex justify-between text-[10px] font-black uppercase text-black/40">
                        <span>ASSET_VALUATION</span>
                        <span>₹{itemsTotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-black uppercase text-black/40">
                        <span>LOGISTICS_CHARGE</span>
                        <span>{deliveryData?.totalCharge ? `₹${deliveryData.totalCharge.toLocaleString()}` : "TBD"}</span>
                     </div>
                     <div className="flex justify-between items-end pt-4 border-t-2 border-black">
                        <span className="text-xs font-black uppercase">TOTAL_SECURE_COST</span>
                        <div className="text-right">
                           <div className="text-3xl font-black leading-none uppercase">₹{total.toLocaleString()}</div>
                           <div className="text-[7px] text-green-600 font-bold mt-1 flex items-center justify-end gap-1">
                             <ShieldCheck size={8} /> SERVER_VERIFIED_PRICE
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Payment Matrix */}
                  <div className="grid grid-cols-2 gap-2 mb-8">
                     {["COD", "Razorpay"].map((method) => (
                       <button
                         key={method}
                         onClick={() => setPaymentMethod(method)}
                         className={`py-3 text-[9px] font-black uppercase border-2 transition-all ${paymentMethod === method ? "bg-black text-white border-black" : "border-black/10 text-black shadow-inner"}`}
                       >
                         {method === "COD" ? "Cash_On_Dispatch" : "Secure_Gateway"}
                       </button>
                     ))}
                  </div>

                  {/* Action Terminal */}
                  <div className="space-y-4">
                    {isQuotationRequired ? (
                      <button
                        onClick={() => setShowQuotationModal(true)}
                        disabled={loading}
                        className="w-full px-8 py-5 bg-[#ff5c00] text-black font-black uppercase tracking-widest shadow-[6px_6px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 group"
                      >
                        <FileText size={18} />
                        {loading ? "PROCESSING_INQUIRY..." : "INITIATE_QUOTATION_PROTOCOL"}
                      </button>
                    ) : (
                      <button
                        onClick={handleCheckout}
                        disabled={loading || calcLoading || !deliveryData || deliveryData.error}
                        className="w-full px-8 py-5 bg-black text-white font-black uppercase tracking-widest shadow-[6px_6px_0px_#ff5c00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-black/20 disabled:shadow-none flex items-center justify-center gap-4 group"
                      >
                        {loading ? "PROCESSING_TRANSACTION..." : "EXECUTE_FINAL_ORDER"}
                        <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                      </button>
                    )}
                  </div>

                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 border-l-4 text-[9px] font-black uppercase tracking-widest bg-black/5 ${message.includes('ERROR') || message.includes('FAILURE') ? 'border-red-500 text-red-600' : 'border-[#ff5c00] text-black'}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5" />
                        <span>{message}</span>
                      </div>
                    </motion.div>
                  )}
               </div>

               {/* Threshold Alert for Quotation */}
               {isQuotationRequired && (
                 <div className="bg-[#ff5c00]/10 border border-[#ff5c00] p-6 relative overflow-hidden">
                    <div className="text-[10px] font-black text-[#ff5c00] uppercase mb-2">SYSTEM_THRESHOLD_WARNING</div>
                    <p className="text-[10px] text-white/60 font-medium leading-relaxed uppercase">
                      The current inventory valuation (₹{itemsTotal.toLocaleString()}) falls outside standard transaction bounds. 
                      Standard checkout is disabled. Manual quotation protocol engaged for professional valuation and logistics optimization.
                    </p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* 📋 QUOTATION PROTOCOL MODAL */}
      <AnimatePresence>
        {showQuotationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black shadow-[20px_20px_0px_#ff5c00] w-full max-w-2xl p-10 relative overflow-hidden"
            >
              <div className="corner-decal decal-tl !border-black/20"></div>
              <div className="corner-decal decal-br !border-black/20"></div>

              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                    <FileText size={24} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black uppercase text-black leading-tight tracking-tighter">Quotation <span className="text-[#ff5c00]">Request</span></h3>
                    <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">PROTOCOL_ID :: QUO_INIT_00{Date.now().toString().slice(-4)}</p>
                 </div>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                   <label className="text-[10px] font-black uppercase text-black/60 block mb-2">Technical Note / Custom Requirements</label>
                   <textarea
                     className="w-full p-5 bg-black/5 border border-black/10 focus:border-[#ff5c00] outline-none text-black text-xs font-medium min-h-[160px]"
                     placeholder="Specify bulk discount needs, custom lead times, or site-specific logistics instructions..."
                     value={customerNote}
                     onChange={(e) => setCustomerNote(e.target.value)}
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-black/5 p-4 border border-black/10">
                   <div className="space-y-1">
                      <div className="text-[8px] font-black text-black/40 uppercase">ENTITY_SIGNAL</div>
                      <div className="text-xs font-black text-black uppercase truncate">{shippingAddress.fullName || "GUEST_UNIT"}</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-[8px] font-black text-black/40 uppercase">VALUATION_ESTIMATE</div>
                      <div className="text-xs font-black text-black uppercase">₹{itemsTotal.toLocaleString()}</div>
                   </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="flex-1 py-4 bg-black/5 border-2 border-black text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                >
                  ABORT_SESSION
                </button>
                <button
                  onClick={handleQuotationRequest}
                  className="flex-1 py-4 bg-[#ff5c00] text-black font-black uppercase tracking-widest shadow-[6px_6px_0px_#000] hover:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  <FileText size={16} />
                  SUBMIT_INQUIRY
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