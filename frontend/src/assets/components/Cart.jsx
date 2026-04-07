
import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import { Trash2 } from "lucide-react";
import img from "../img/dance2.gif";
import API from "../api/api";

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
    country: "",
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

  // Estimate weight (if item.weight not defined, assume 5kg per item)
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
          theme: { color: "#06B6D4" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          setMessage(`[ALERT] PAYMENT_FAILED: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // COD path
        setLoading(false);
        setMessage("SYSTEM_MSG: ORDER COMPILED SUCCESSFULLY. CASH ON DELIVERY ENGAGED.");
        clearCart();
        setTimeout(() => navigate("/dashboard/customer/orders"), 2000);
      }
    } catch (err) {
      setLoading(false);
      setMessage(
        `SYSTEM_FAILURE: ${err.response?.data?.message || err.message}`
      );
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
        image: item.images?.[0],
        qty: item.quantity,
        price: item.price,
        seller: item.seller,
      })),
      shippingAddress,
      itemsPrice: itemsTotal,
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
      setTimeout(() => navigate("/customer/quotations"), 2000);
    } catch (err) {
      setLoading(false);
      setMessage(`ERROR: QUOTATION_FAILURE: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    // Light background text-slate-900 ke sath
    <div className="bg-slate-50 min-h-screen text-slate-900 font-mono relative overflow-hidden">
      {/* Light Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(159, 187, 32, 0.77)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        <Nev />

        <div className="max-w-8xl mx-auto p-4 sm:p-6 pt-24">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-200 pb-4">
            <span className="w-3 h-3 bg-cyan-500 animate-pulse"></span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-slate-800">
              User_Cart <span className="text-cyan-500 font-light">v2.0</span>
            </h2>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-500 mt-10 border border-slate-200 bg-white p-12 shadow-[8px_8px_0px_rgba(6,182,212,0.1)]">
              <img
                src={img}
                alt="Empty cart"
                className="w-64 object-contain opacity-50 grayscale contrast-150 mb-6"
              />
              <p className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">
                thanks for shopping with us
              </p>
              <p className="text-cyan-600 bg-cyan-50 px-4 py-1 border border-cyan-100 mt-2">
                &gt;
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 🟠 LEFT SIDE — CART ITEMS */}
              <div className="lg:w-2/3 bg-white border border-slate-200 shadow-[4px_4px_0px_rgba(226,232,240,1)] p-4 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-50 border border-slate-200 hover:border-cyan-400 transition-all duration-300 group flex flex-col relative shadow-sm hover:shadow-[4px_4px_0px_rgba(6,182,212,0.2)]"
                    >
                      <div className="relative overflow-hidden bg-slate-200">
                        <img
                          src={item.images?.[0]}
                          alt={item.name}
                          className="w-full h-48 object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                        />
                        {/* Light Scanline Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none mix-blend-overlay"></div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="absolute top-2 right-2 p-2 bg-white text-pink-500 hover:bg-pink-500 hover:text-white border border-pink-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-col flex-grow p-4">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-cyan-600 truncate uppercase tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-pink-600 font-black text-lg mt-1 tracking-wider">
                          ₹{item.price}
                        </p>

                        <div className="flex items-center justify-between mt-4 border-t border-slate-200 pt-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => decreaseQuantity(item._id)}
                              className="w-8 h-8 bg-white border border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 flex items-center justify-center font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="w-10 text-center font-bold text-slate-800 bg-white border-y border-slate-300 py-[3px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item._id)}
                              className="w-8 h-8 bg-white border border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 flex items-center justify-center font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right text-xs text-slate-500 font-bold uppercase">
                            Sub: <span className="text-slate-800">₹{(item.price * item.quantity).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 💳 RIGHT SIDE — SHIPPING & PAYMENT */}
              <div className="lg:w-1/3 flex flex-col gap-6">
                {/* Shipping */}
                <div className="bg-white border-t-4 border-t-cyan-500 border border-slate-200 p-6 shadow-[4px_4px_0px_rgba(226,232,240,1)]">
                  <h3 className="text-xl font-bold mb-4 text-cyan-600 uppercase tracking-widest border-b border-slate-100 pb-2">
                    &gt; Logistics_Data
                  </h3>
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {[
                      { label: "Full Name", name: "fullName" },
                      { label: "Address", name: "address" },
                      { label: "City", name: "city" },
                      { label: "Postal Code", name: "postalCode" },
                      { label: "Country", name: "country" },
                      { label: "Phone", name: "phone" },
                    ].map((field) => (
                      <input
                        key={field.name}
                        type="text"
                        name={field.name}
                        placeholder={`[ ${field.label.toUpperCase()} ]`}
                        value={shippingAddress[field.name]}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 transition-all rounded-none"
                        required
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Protocol:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 text-slate-800 outline-none focus:border-cyan-500 rounded-none cursor-pointer uppercase font-semibold"
                    >
                      <option value="COD">C.O.D. (Standard)</option>
                      <option value="Razorpay">Razorpay (Secure)</option>
                    </select>
                  </div>
                </div>

                {/* Shipping info / Delivery quote */}
                {shippingAddress.postalCode?.length === 6 && (
                  <div className="bg-slate-50 border border-slate-200 p-4 mb-6 shadow-inner">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Quote:</h4>
                    {calcLoading ? (
                      <div className="text-cyan-600 text-sm font-semibold animate-pulse">CALCULATING ROUTE & LOAD...</div>
                    ) : deliveryData?.error ? (
                      <div className="text-red-500 text-sm font-bold">{deliveryData.error}</div>
                    ) : deliveryData ? (
                      <div className="space-y-1 text-sm text-slate-700">
                        <div className="flex justify-between"><span>Zone:</span> <strong>{deliveryData.zone}</strong></div>
                        <div className="flex justify-between"><span>Total Weight:</span> <strong>{totalWeightKg} kg</strong></div>
                        <div className="flex justify-between">
                          <span>Logistics:</span>
                          <strong className={deliveryData.multiVehicle ? "text-pink-600" : ""}>
                            {deliveryData.vehicleCount}x {deliveryData.vehicleLabel}
                          </strong>
                        </div>
                        {deliveryData.note && <div className="text-xs text-pink-500 font-medium mt-1 uppercase">{deliveryData.note}</div>}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Total & Checkout */}
                <div className="bg-white border-t-4 border-t-pink-500 border border-slate-200 p-6 shadow-[4px_4px_0px_rgba(226,232,240,1)]">
                  <div className="space-y-2 mb-4 text-sm font-semibold text-slate-600 border-b border-slate-100 pb-4">
                    <div className="flex justify-between"><span>Items Subtotal:</span> <span>₹{itemsTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between">
                      <span>Delivery Base:</span>
                      <span>{deliveryData?.totalCharge ? `₹${deliveryData.totalCharge.toFixed(2)}` : "TBD"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-slate-500 uppercase text-sm font-bold">Total_Cost:</span>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                      ₹{total.toFixed(2)}
                    </h3>
                  </div>

                  {isQuotationRequired && (
                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-xs font-bold uppercase leading-relaxed">
                      [ ALERT ] ORDER_VALUE outside standard threshold (₹{config.settings?.minCartValue} - ₹{config.settings?.maxCartValue}).
                      <br />Professional review required. Submit for quotation.
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {isQuotationRequired ? (
                      <button
                        onClick={() => setShowQuotationModal(true)}
                        disabled={loading}
                        className="w-full px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(245,158,11,0.3)]"
                      >
                        {loading ? "INITIALIZING..." : "REQUEST_QUOTATION"}
                      </button>
                    ) : (
                      <button
                        onClick={handleCheckout}
                        disabled={loading || calcLoading || !deliveryData || deliveryData.error}
                        className="w-full px-6 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(6,182,212,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                      >
                        {loading ? "INITIALIZING..." : "EXECUTE_ORDER"}
                      </button>
                    )}

                    <button
                      onClick={clearCart}
                      className="w-full px-6 py-3 bg-white border-2 border-slate-200 hover:border-pink-500 text-slate-600 hover:text-pink-600 font-bold uppercase tracking-widest transition-all"
                    >
                      PURGE_CART
                    </button>
                  </div>

                  {message && (
                    <div className={`mt-4 p-3 border-l-4 text-sm font-bold uppercase tracking-wide bg-slate-50 ${message.includes('ERROR') || message.includes('FAILURE') ? 'border-red-500 text-red-600' : 'border-cyan-500 text-cyan-600'}`}>
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quotation Submission Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 shadow-[10px_10px_0px_rgba(0,0,0,1)] w-full max-w-lg p-8 relative">
            <h3 className="text-2xl font-black uppercase mb-6 border-b-2 border-slate-100 pb-2">Quotation_Finalize</h3>
            <p className="text-sm text-slate-600 mb-6 font-bold uppercase">Briefly describe your requirements or special instructions for the admin review:</p>
            <textarea
              className="w-full p-4 bg-slate-50 border border-slate-300 focus:border-cyan-500 outline-none text-sm mb-6"
              rows={4}
              placeholder="e.g. Bulk order for construction site, need bulk discount..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowQuotationModal(false)}
                className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-500 font-bold uppercase hover:border-pink-500 hover:text-pink-500 transition-all"
              >
                Abort
              </button>
              <button
                onClick={handleQuotationRequest}
                className="flex-1 py-3 bg-cyan-500 text-white font-black uppercase hover:bg-cyan-600 transition-all shadow-[4px_4px_0px_rgba(6,182,212,0.3)]"
              >
                Submit_Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;