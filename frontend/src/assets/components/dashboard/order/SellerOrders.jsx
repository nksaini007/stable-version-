import API from "../../../api/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Nev from "../../Nev";
import {
  FaBoxOpen,
  FaRupeeSign,
  FaTruck,
  FaUser,
  FaClipboardList,
  FaFileInvoice
} from "react-icons/fa";
import { generateInvoice } from "../../../utils/invoiceGenerator";

const statusSteps = ["Pending", "Processing", "Shipped", "Delivered"];

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  /* ---------------- FETCH SELLER ORDERS ---------------- */
  const fetchSellerOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login as seller");
        return;
      }

      const decoded = parseJwt(token);
      const currentSellerId = decoded?.id || decoded?._id;
      setSellerId(currentSellerId);

      const { data } = await API.get(
        `/orders/seller/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const filtered = (data.orders || data).filter((order) =>
        order.orderItems.some(
          (item) =>
            item.seller === currentSellerId ||
            item.seller?._id === currentSellerId
        )
      );

      setOrders(filtered);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE ITEM STATUS ---------------- */
  const handleItemStatusUpdate = async (orderId, productId, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      await API.put(
        `/orders/seller/item-status`,
        { orderId, productId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Status updated");
      fetchSellerOrders();
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* ---------------- PROCESS RETURN ---------------- */
  const handleProcessReturn = async (orderId, productId, status, sellerNote = "") => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      await API.put(
        `/orders/return/process`,
        { orderId, productId, status, sellerNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Return ${status}`);
      fetchSellerOrders();
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to process return");
    } finally {
      setUpdating(false);
    }
  };

  /* ---------------- SELLER TOTAL ---------------- */
  const getSellerOrderTotal = (order) => {
    return order.orderItems
      .filter(
        (item) =>
          item.seller === sellerId || item.seller?._id === sellerId
      )
      .reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  /* ---------------- JWT DECODE ---------------- */
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  /* ---------------- STATUS BAR ---------------- */
  const StatusBar = ({ status }) => {
    const activeIndex = statusSteps.indexOf(status);

    return (
      <div className="flex items-center gap-2 mt-2">
        {statusSteps.map((step, index) => (
          <div key={step} className="flex items-center w-full">
            <div
              className={`h-2 w-full rounded-full ${
                index <= activeIndex
                  ? "bg-green-500"
                  : "bg-gray-200"
              }`}
            />
            {index < statusSteps.length - 1 && (
              <div className="w-2" />
            )}
          </div>
        ))}
      </div>
    );
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FaClipboardList className="text-4xl animate-spin mb-3" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <>
      <Nev />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-6">
        <div className="max-w-7xl mx-auto">

          <header className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-purple-700">
              Seller Orders Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage only your products
            </p>
          </header>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-500">
              <FaBoxOpen className="text-6xl mb-4" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-xl"
                >
                  {/* HEADER */}
                  <div className="flex justify-between border-b pb-3 mb-4">
                    <div>
                      <h3 className="font-bold">
                        #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">Buyer</p>
                      <p className="flex items-center gap-1">
                        <FaUser /> {order.user?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="space-y-4">
                    {order.orderItems
                      .filter(
                        (item) =>
                          item.seller === sellerId ||
                          item.seller?._id === sellerId
                      )
                      .map((item) => (
                        <div
                          key={item._id}
                          className="bg-gray-50 p-4 rounded-xl border"
                        >
                          <div className="flex gap-4 items-center">
                            <img
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover border"
                            />

                            <div className="flex-1">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                Qty {item.qty} × ₹{item.price}
                              </p>

                              {item.returnDetails?.isReturnRequested && (
                                <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded-lg">
                                  <p className="text-xs font-bold text-orange-600">Return Reason: {item.returnDetails.reason}</p>
                                  {item.returnDetails.customerNote && <p className="text-[10px] text-gray-500 italic">"{item.returnDetails.customerNote}"</p>}
                                  {item.itemStatus === "Return Requested" && (
                                    <div className="flex gap-2 mt-2">
                                      <button 
                                        disabled={updating}
                                        onClick={() => handleProcessReturn(order._id, item.product, 'Approved')}
                                        className="text-[10px] px-3 py-1 bg-green-600 text-white rounded font-bold uppercase disabled:opacity-50"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        disabled={updating}
                                        onClick={() => handleProcessReturn(order._id, item.product, 'Rejected')}
                                        className="text-[10px] px-3 py-1 bg-red-600 text-white rounded font-bold uppercase disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {item.itemStatus !== "Return Requested" && (
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Return Status: {item.returnDetails.status}</p>
                                  )}
                                </div>
                              )}

                              <StatusBar status={item.itemStatus || "Pending"} />
                            </div>

                            <select
                              value={item.itemStatus || "Pending"}
                              disabled={updating || item.returnDetails?.isReturnRequested}
                              onChange={(e) =>
                                handleItemStatusUpdate(
                                  order._id,
                                  item.product,
                                  e.target.value
                                )
                              }
                              className="border rounded px-2 py-1 text-sm bg-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                              {item.returnDetails?.isReturnRequested && (
                                 <>
                                  <option value="Return Requested">Return Requested</option>
                                  <option value="Return Approved">Return Approved</option>
                                  <option value="Return Rejected">Return Rejected</option>
                                  <option value="Return Picked Up">Return Picked Up</option>
                                  <option value="Refunded">Refunded</option>
                                 </>
                              )}
                            </select>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* FOOTER */}
                  <footer className="flex justify-between items-center mt-5 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <FaTruck />
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.country}
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                        className="p-2.5 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-zinc-200 shadow-sm"
                        title="Download Invoice"
                      >
                        <FaFileInvoice size={12} /> Invoice
                      </button>
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        <FaRupeeSign />
                        {getSellerOrderTotal(order).toFixed(2)}
                      </div>
                    </div>
                  </footer>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SellerOrders;

// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { motion } from "framer-motion";
// // import { toast } from "react-toastify";
// // import Nev from "../../Nev";
// // import {
// //   FaBoxOpen,
// //   FaRupeeSign,
// //   FaTruck,
// //   FaUser,
// //   FaClipboardList,
// // } from "react-icons/fa";

// // /**
// //  * SellerOrders Component
// //  * Displays all seller-specific orders with status management.
// //  */
// // const SellerOrders = () => {
// //   const [orders, setOrders] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [updating, setUpdating] = useState(false);

// //   useEffect(() => {
// //     fetchSellerOrders();
// //   }, []);

// //   /** Fetch all seller orders */
// //   const fetchSellerOrders = async () => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) {
// //         toast.error("⚠️ Please log in as a seller!");
// //         setLoading(false);
// //         return;
// //       }

// //       const { data } = await axios.get(
// //         `/api/orders/seller/orders`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setOrders(Array.isArray(data) ? data : data.orders || []);
// //     } catch (err) {
// //       console.error("Error fetching seller orders:", err);
// //       toast.error("❌ Failed to load seller orders.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /** Update order item status */
// //   const handleItemStatusUpdate = async (orderId, productId, newStatus) => {
// //     try {
// //       setUpdating(true);
// //       const token = localStorage.getItem("token");
// //       if (!token) {
// //         toast.error("⚠️ Please log in!");
// //         return;
// //       }

// //       await axios.put(
// //         `/api/orders/seller/item-status`,
// //         { orderId, productId, status: newStatus },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       toast.success(`✅ Status updated to "${newStatus}"`);
// //       fetchSellerOrders();
// //     } catch (err) {
// //       console.error("Error updating item status:", err);
// //       toast.error("⚠️ Failed to update status.");
// //     } finally {
// //       setUpdating(false);
// //     }
// //   };

// //   /** Loading Screen */
// //   if (loading)
// //     return (
// //       <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
// //         <FaClipboardList className="text-5xl text-blue-500 mb-3 animate-spin-slow" />
// //         <p className="text-gray-700 text-lg font-medium">Loading your orders...</p>
// //       </div>
// //     );

// //   return (
// //     <>
// //     <Nev />
// //       <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-6">

// //         <div className="max-w-7xl mx-auto">
// //           {/* Header */}
// //           <header className="mb-10 text-center">
// //             <motion.h1
// //               initial={{ opacity: 0, y: -20 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
// //             >
// //               Seller Orders Dashboard
// //             </motion.h1>
// //             <p className="text-gray-600 mt-2">
// //               Manage your sales, track deliveries, and update statuses in real time.
// //             </p>
// //           </header>

// //           {/* No Orders */}
// //           {orders.length === 0 ? (
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               className="flex flex-col items-center justify-center py-20 text-gray-500 backdrop-blur-md bg-white/40 rounded-2xl shadow-md"
// //             >
// //               <FaBoxOpen className="text-7xl text-gray-400 mb-4" />
// //               <p className="text-lg font-medium">No orders found yet.</p>
// //             </motion.div>
// //           ) : (
// //             <div className="grid gap-8 md:grid-cols-2">
// //               {orders.map((order) => (
// //                 <motion.div
// //                   key={order._id}
// //                   initial={{ opacity: 0, y: 40 }}
// //                   animate={{ opacity: 1, y: 0 }}
// //                   transition={{ duration: 0.4 }}
// //                   className="rounded-3xl p-6 bg-white/70 backdrop-blur-xl shadow-xl border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all"
// //                 >
// //                   {/* Order Header */}
// //                   <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
// //                     <div>
// //                       <h3 className="font-bold text-gray-800 text-lg">
// //                         🧾 #{order._id.slice(-6).toUpperCase()}
// //                       </h3>
// //                       <p className="text-xs text-gray-500">
// //                         {new Date(order.createdAt).toLocaleString()}
// //                       </p>
// //                     </div>
// //                     <div className="text-right">
// //                       <p className="text-xs text-gray-500">Buyer</p>
// //                       <p className="font-medium text-gray-700 flex items-center justify-end gap-1">
// //                         <FaUser className="text-gray-400" />
// //                         {order.user?.name || "Unknown"}
// //                       </p>
// //                     </div>
// //                   </div>

// //                   {/* Order Items */}
// //                   <div className="space-y-4">
// //                     {order.orderItems.map((item) => (
// //                       <motion.div
// //                         key={item._id}
// //                         whileHover={{ scale: 1.02 }}
// //                         className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 shadow-sm"
// //                       >
// //                         <div className="flex items-center gap-3">
// //                           <img
// //                             src={item.image || "/placeholder.png"}
// //                             alt={item.name}
// //                             className="w-14 h-14 rounded-lg border object-cover shadow-sm"
// //                           />
// //                           <div>
// //                             <p className="font-semibold text-gray-800 text-sm">
// //                               {item.name}
// //                             </p>
// //                             <p className="text-xs text-gray-500">
// //                               Qty: {item.qty} × ₹{item.price}
// //                             </p>
// //                           </div>
// //                         </div>

// //                         {/* Status Dropdown */}
// //                         <div className="text-right">
// //                           <select
// //                             className="border border-gray-300 px-3 py-1 rounded-lg text-sm bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
// //                             value={item.itemStatus || "Pending"}
// //                             onChange={(e) =>
// //                               handleItemStatusUpdate(
// //                                 order._id,
// //                                 item.product,
// //                                 e.target.value
// //                               )
// //                             }
// //                             disabled={updating}
// //                           >
// //                             <option value="Pending">🕓 Pending</option>
// //                             <option value="Processing">⚙️ Processing</option>
// //                             <option value="Shipped">🚚 Shipped</option>
// //                             <option value="Delivered">✅ Delivered</option>
// //                             <option value="Cancelled">❌ Cancelled</option>
// //                           </select>

// //                           <span
// //                             className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${item.itemStatus === "Delivered"
// //                               ? "bg-green-100 text-green-700"
// //                               : item.itemStatus === "Shipped"
// //                                 ? "bg-blue-100 text-blue-700"
// //                                 : item.itemStatus === "Cancelled"
// //                                   ? "bg-red-100 text-red-700"
// //                                   : "bg-yellow-100 text-yellow-700"
// //                               }`}
// //                           >
// //                             {item.itemStatus}
// //                           </span>
// //                         </div>
// //                       </motion.div>
// //                     ))}
// //                   </div>

// //                   {/* Order Footer */}
// //                   <footer className="flex justify-between items-center mt-5 pt-3 border-t border-gray-200 text-sm text-gray-600">
// //                     <div className="flex items-center gap-2">
// //                       <FaTruck className="text-gray-400" />
// //                       <span>
// //                         {order.shippingAddress?.city},{" "}
// //                         {order.shippingAddress?.country}
// //                       </span>
// //                     </div>
// //                     <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
// //                       <FaRupeeSign /> {order.totalPrice?.toFixed(2)}
// //                     </div>
// //                   </footer>
// //                 </motion.div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default SellerOrders;
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import Nev from "../../Nev";
// import {
//   FaBoxOpen,
//   FaRupeeSign,
//   FaTruck,
//   FaUser,
//   FaClipboardList,
// } from "react-icons/fa";

// const SellerOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [sellerId, setSellerId] = useState(null);
//   const[salercost,setsalercost] = useState(0);
//   useEffect(() => {
//     fetchSellerOrders();
//   }, []);

//   /** Fetch only orders related to this seller */
//   const fetchSellerOrders = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("⚠️ Please log in as a seller!");
//         setLoading(false);
//         return;
//       }

//       // ✅ Fetch orders only for this seller (API should filter backend-side)
//       const { data } = await axios.get(
//         `/api/orders/seller/orders`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Some APIs send all orders — filter locally as safety fallback
//       const decodedToken = parseJwt(token);
//       const sellerId = decodedToken?.id || decodedToken?._id;
//       setSellerId(sellerId);

//       const filteredOrders = (data.orders || data).filter((order) =>
//         order.orderItems.some(
//           (item) => item.seller === sellerId || item.seller?._id === sellerId
//         )
//       );

//       setOrders(filteredOrders);
//     } catch (err) {
//       console.error("Error fetching seller orders:", err);
//       toast.error("❌ Failed to load seller orders.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** Update order item status */
//   const handleItemStatusUpdate = async (orderId, productId, newStatus) => {
//     try {
//       setUpdating(true);
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("⚠️ Please log in!");
//         return;
//       }

//       await axios.put(
//         `/api/orders/seller/item-status`,
//         { orderId, productId, status: newStatus },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       toast.success(`✅ Status updated to "${newStatus}"`);
//       fetchSellerOrders();
//     } catch (err) {
//       console.error("Error updating item status:", err);
//       toast.error("⚠️ Failed to update status.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   /** Decode JWT to extract sellerId */
//   const parseJwt = (token) => {
//     try {
//       return JSON.parse(atob(token.split(".")[1]));
//     } catch (e) {
//       return null;
//     }
//   };

//   /** Loading Screen */
//   if (loading)
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
//         <FaClipboardList className="text-5xl text-blue-500 mb-3 animate-spin-slow" />
//         <p className="text-gray-700 text-lg font-medium">Loading your orders...</p>
//       </div>
//     );



//     //////////////////

// ////////////////////////
//   return (
//     <>
//       <Nev />
//       <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-6">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <header className="mb-10 text-center">
//             <motion.h1
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
//             >
//               Seller Orders Dashboard
//             </motion.h1>
//             <p className="text-gray-600 mt-2">
//               Manage your sales, track deliveries, and update statuses in real time.
//             </p>
//           </header>

//           {/* No Orders */}
//           {orders.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="flex flex-col items-center justify-center py-20 text-gray-500 backdrop-blur-md bg-white/40 rounded-2xl shadow-md"
//             >
//               <FaBoxOpen className="text-7xl text-gray-400 mb-4" />
//               <p className="text-lg font-medium">No orders found for you yet.</p>
//             </motion.div>
//           ) : (
//             <div className="grid gap-8 md:grid-cols-2">
//               {orders.map((order) => (
//                 <motion.div
//                   key={order._id}
//                   initial={{ opacity: 0, y: 40 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.4 }}
//                   className="rounded-3xl p-6 bg-white/70 backdrop-blur-xl shadow-xl border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all"
//                 >
//                   {/* Order Header */}
//                   <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
//                     <div>
//                       <h3 className="font-bold text-gray-800 text-lg">
//                         🧾 #{order._id.slice(-6).toUpperCase()}
//                       </h3>
//                       <p className="text-xs text-gray-500">
//                         {new Date(order.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-xs text-gray-500">Buyer</p>
//                       <p className="font-medium text-gray-700 flex items-center justify-end gap-1">
//                         <FaUser className="text-gray-400" />
//                         {order.user?.name || "Unknown"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Order Items (only seller's items) */}
//                   <div className="space-y-4">
//                     {order.orderItems
//                       .filter(
//                         (item) =>
//                           item.seller === sellerId ||
//                           item.seller?._id === sellerId
//                       )
//                       .map((item) => (
//                         <motion.div
//                           key={item._id}
//                           whileHover={{ scale: 1.02 }}
//                           className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 shadow-sm"
//                         >
//                           <div className="flex items-center gap-3">
//                             <img
//                               src={item.image || "/placeholder.png"}
//                               alt={item.name}
//                               className="w-14 h-14 rounded-lg border object-cover shadow-sm"
//                             />
//                             <div>
//                               <p className="font-semibold text-gray-800 text-sm">
//                                 {item.name}
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 Qty: {item.qty} × ₹{item.price}
//                               </p>
                              
//                             </div>
//                           </div>

//                           {/* Status Dropdown */}
//                           <div className="text-right">
//                             <select
//                               className="border border-gray-300 px-3 py-1 rounded-lg text-sm bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
//                               value={item.itemStatus || "Pending"}
//                               onChange={(e) =>
//                                 handleItemStatusUpdate(
//                                   order._id,
//                                   item.product,
//                                   e.target.value
//                                 )
//                               }
//                               disabled={updating}
//                             >
//                               <option value="Pending">🕓 Pending</option>
//                               <option value="Processing">⚙️ Processing</option>
//                               <option value="Shipped">🚚 Shipped</option>
//                               <option value="Delivered">✅ Delivered</option>
//                               <option value="Cancelled">❌ Cancelled</option>
//                             </select>

//                             <span
//                               className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${
//                                 item.itemStatus === "Delivered"
//                                   ? "bg-green-100 text-green-700"
//                                   : item.itemStatus === "Shipped"
//                                   ? "bg-blue-100 text-blue-700"
//                                   : item.itemStatus === "Cancelled"
//                                   ? "bg-red-100 text-red-700"
//                                   : "bg-yellow-100 text-yellow-700"
//                               }`}
//                             >
//                               {item.itemStatus}
//                             </span>
//                           </div>
//                         </motion.div>
//                       ))}
//                   </div>

//                   {/* Order Footer */}
//                   <footer className="flex justify-between items-center mt-5 pt-3 border-t border-gray-200 text-sm text-gray-600">
//                     <div className="flex items-center gap-2">
//                       <FaTruck className="text-gray-400" />
//                       <span>
//                         {order.shippingAddress?.city},{" "}
//                         {order.shippingAddress?.country}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                     
                     
//                       <FaRupeeSign /> {order.totalPrice?.toFixed(2)}
//                     </div>
//                   </footer>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default SellerOrders;









// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-toastify";
// import Nev from "../../Nev";
// import Footer from "../../Footer";
// import {
//   FaBoxOpen,
//   FaRupeeSign,
//   FaTruck,
//   FaUser,
//   FaClipboardList,
//   FaTimes,
//   FaChevronDown,
//   FaSpinner,
// } from "react-icons/fa";

// /* Status meta for consistent colors, labels and progress */
// const STATUS_META = {
//   Pending: { tone: "yellow", label: "Pending", pct: 20 },
//   Processing: { tone: "amber", label: "Processing", pct: 50 },
//   Shipped: { tone: "blue", label: "Shipped", pct: 75 },
//   Delivered: { tone: "green", label: "Delivered", pct: 100 },
//   Cancelled: { tone: "red", label: "Cancelled", pct: 0 },
//   Unknown: { tone: "gray", label: "Unknown", pct: 10 },
// };

// const toneClasses = {
//   yellow: { bg: "bg-yellow-50", text: "text-yellow-700", bar: "bg-yellow-400" },
//   amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" },
//   blue: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
//   green: { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
//   red: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
//   gray: { bg: "bg-gray-50", text: "text-gray-700", bar: "bg-gray-400" },
// };

// const parseJwt = (token) => {
//   try {
//     return JSON.parse(atob(token.split(".")[1]));
//   } catch {
//     return null;
//   }
// };

// const SellerOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [sellerId, setSellerId] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [openOrderId, setOpenOrderId] = useState(null);

//   useEffect(() => {
//     fetchSellerOrders();
//   }, []);

//   const fetchSellerOrders = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Please sign in as a seller.");
//         setLoading(false);
//         return;
//       }

//       const decoded = parseJwt(token);
//       const sId = decoded?.id || decoded?._id;
//       setSellerId(sId);

//       const res = await axios.get(`/api/orders/seller/orders`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // backend ideally filters; fallback to local filter
//       const payload = res.data?.orders || res.data || [];
//       const filtered = payload.filter((o) =>
//         o.orderItems?.some((it) => it.seller === sId || it.seller?._id === sId)
//       );

//       setOrders(filtered);
//     } catch (err) {
//       console.error("Fetch seller orders:", err);
//       toast.error("Failed to fetch seller orders.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleItemStatusUpdate = async (orderId, productId, newStatus) => {
//     setUpdating(true);
//     // optimistic UI: snapshot & update locally
//     const snapshot = orders;
//     const updated = orders.map((o) =>
//       o._id === orderId
//         ? {
//             ...o,
//             orderItems: o.orderItems.map((it) =>
//               (it.product === productId || it._id === productId) ? { ...it, itemStatus: newStatus } : it
//             ),
//           }
//         : o
//     );
//     setOrders(updated);

//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `/api/orders/seller/item-status`,
//         { orderId, productId, status: newStatus },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success(`Status updated to ${newStatus}`);
//       // re-sync in background
//       fetchSellerOrders();
//     } catch (err) {
//       console.error("Update status:", err);
//       toast.error("Failed to update status. Reverting.");
//       setOrders(snapshot);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const visibleOrders = useMemo(() => orders || [], [orders]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
//         <div className="flex flex-col items-center gap-4">
//           <FaClipboardList className="text-5xl text-blue-600 animate-spin-slow" />
//           <p className="text-gray-700 text-lg font-medium">Loading your orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Nev />
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
//         <div className="max-w-7xl mx-auto">
//           <header className="mb-8">
//             <motion.h1
//               initial={{ opacity: 0, y: -8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-3xl md:text-4xl font-extrabold text-slate-900"
//             >
//               Seller Orders
//             </motion.h1>
//             <p className="text-sm text-slate-600 mt-1">
//               Manage items from your listings. Update item status to keep buyers informed.
//             </p>
//           </header>

//           {visibleOrders.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="rounded-2xl p-12 bg-white/60 backdrop-blur-sm shadow-lg text-center"
//             >
//               <FaBoxOpen className="mx-auto text-6xl text-slate-400 mb-4" />
//               <p className="text-lg font-medium text-slate-700">No orders found for your account.</p>
//               <p className="text-sm text-slate-500 mt-2">Orders will appear here when customers place purchases for your products.</p>
//             </motion.div>
//           ) : (
//             <div className="grid gap-6 md:grid-cols-2">
//               {visibleOrders.map((order) => {
//                 const sellerItems = (order.orderItems || []).filter(
//                   (it) => it.seller === sellerId || it.seller?._id === sellerId
//                 );
//                 const orderStatus = sellerItems.length ? sellerItems[0].itemStatus || "Unknown" : "Unknown";
//                 const meta = STATUS_META[orderStatus] || STATUS_META.Unknown;
//                 const tone = toneClasses[meta.tone] || toneClasses.gray;

//                 return (
//                   <motion.article
//                     key={order._id}
//                     initial={{ opacity: 0, y: 8 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.35 }}
//                     className="rounded-3xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg overflow-hidden"
//                     aria-labelledby={`order-${order._id}`}
//                   >
//                     {/* header */}
//                     <div className="px-6 py-4 flex items-start justify-between gap-4">
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-3">
//                           <div className="flex flex-col">
//                             <span className="text-xs text-slate-500">Order</span>
//                             <h3 id={`order-${order._id}`} className="text-sm md:text-base font-semibold text-slate-900">
//                               #{(order._id || "").slice(-8).toUpperCase()}
//                             </h3>
//                           </div>

//                           <div className="ml-2 text-xs text-slate-400">
//                             {new Date(order.createdAt).toLocaleString()}
//                           </div>
//                         </div>

//                         <div className="mt-3 flex items-center gap-3 text-xs md:text-sm">
//                           <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tone.bg}`}>
//                             <FaUser className="text-slate-400" />
//                             <span className="font-medium text-slate-700">{order.user?.name || "Buyer"}</span>
//                           </div>

//                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border">
//                             <FaTruck className="text-slate-400" />
//                             <span className="text-slate-600">{order.shippingAddress?.city || "—"}</span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex flex-col items-end gap-2">
//                         <div className="flex items-center gap-2">
//                           <div className={`px-3 py-1 rounded-full text-xs font-medium ${tone.text} ${tone.bg}`}>
//                             {meta.label}
//                           </div>
//                         </div>

//                         <div className="text-green-600 font-semibold flex items-center gap-1">
//                           <FaRupeeSign />
//                           <span>{Number(order.totalPrice || 0).toFixed(2)}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* body: items */}
//                     <div className="px-6 pb-4 space-y-3">
//                       {sellerItems.map((item) => {
//                         const itemMeta = STATUS_META[item.itemStatus] || STATUS_META.Unknown;
//                         const itemTone = toneClasses[itemMeta.tone] || toneClasses.gray;
//                         return (
//                           <div
//                             key={item._id || item.product}
//                             className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100"
//                           >
//                             <div className="flex items-center gap-3 min-w-0">
//                               <img
//                                 src={item.image || "/placeholder.png"}
//                                 alt={item.name}
//                                 className="w-14 h-14 rounded-lg object-cover border"
//                               />
//                               <div className="min-w-0">
//                                 <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.name}</p>
//                                 <p className="text-xs text-slate-500 mt-0.5">
//                                   Qty: <span className="font-medium">{item.qty}</span> × ₹{item.price}
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="flex flex-col items-end gap-2">
//                               <select
//                                 aria-label={`Update status for ${item.name}`}
//                                 value={item.itemStatus || "Pending"}
//                                 onChange={(e) => handleItemStatusUpdate(order._id, item.product || item._id, e.target.value)}
//                                 className="text-xs rounded-lg border px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
//                                 disabled={updating}
//                               >
//                                 <option>Pending</option>
//                                 <option>Processing</option>
//                                 <option>Shipped</option>
//                                 <option>Delivered</option>
//                                 <option>Cancelled</option>
//                               </select>

//                               <div className={`text-xs ${itemTone.text} ${itemTone.bg} px-2 py-0.5 rounded-full`}>
//                                 {item.itemStatus || "Pending"}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}

//                       {/* progress */}
//                       <div className="mt-1">
//                         <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
//                           <span>Order progress</span>
//                           <span>{meta.pct}%</span>
//                         </div>
//                         <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
//                           <div
//                             className={`h-full rounded-full ${toneClasses[meta.tone]?.bar || "bg-gray-400"}`}
//                             style={{ width: `${meta.pct}%`, transition: "width 400ms ease" }}
//                           />
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between gap-3 mt-3">
//                         <button
//                           onClick={() => {
//                             setSelectedOrder(order);
//                             setOpenOrderId(order._id);
//                           }}
//                           className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border text-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
//                         >
//                           <FaChevronDown />
//                           Details
//                         </button>

//                         <div className="text-xs text-slate-500">Items: {sellerItems.length}</div>
//                       </div>
//                     </div>
//                   </motion.article>
//                 );
//               })}
//             </div>
//           )}

//           {/* Order detail modal */}
//           <AnimatePresence>
//             {openOrderId && selectedOrder && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 z-50 flex items-center justify-center p-4"
//                 aria-modal="true"
//                 role="dialog"
//               >
//                 <div className="absolute inset-0 bg-black/40" onClick={() => setOpenOrderId(null)} />

//                 <motion.div
//                   initial={{ scale: 0.98, y: 8 }}
//                   animate={{ scale: 1, y: 0 }}
//                   exit={{ scale: 0.98, y: 8 }}
//                   transition={{ duration: 0.18 }}
//                   className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-6 z-10"
//                 >
//                   <div className="flex items-start justify-between gap-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-900">
//                         Order #{(selectedOrder._id || "").slice(-8).toUpperCase()}
//                       </h3>
//                       <p className="text-sm text-slate-500 mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setOpenOrderId(null);
//                         setSelectedOrder(null);
//                       }}
//                       className="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
//                       aria-label="Close order details"
//                     >
//                       <FaTimes />
//                     </button>
//                   </div>

//                   <div className="mt-4 space-y-4">
//                     {(selectedOrder.orderItems || []).map((it, i) => (
//                       <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg  bg-gray-200">
//                         <div className="flex items-center gap-3">
//                           <img src={it.image || "/placeholder.png"} alt={it.name} className="w-14 h-14 rounded-md object-cover " />
//                           <div>
//                             <p className="text-sm font-medium text-slate-800">{it.name}</p>
//                             <p className="text-xs text-slate-500">Qty: {it.qty}</p>
//                           </div>
//                         </div>

//                         <div className="text-right text-sm">
//                           <div className="font-medium text-slate-800">₹{it.price}</div>
//                           <div className="text-xs text-slate-500">{it.itemStatus || "Pending"}</div>
//                         </div>
//                       </div>
//                     ))}

//                     <div className="pt-3  flex items-center justify-between">
//                       <div className="text-sm text-slate-600">
//                         <div>Shipping: {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</div>
//                         <div className="mt-1">Buyer: {selectedOrder.user?.name || "—"}</div>
//                       </div>

//                       <div className="text-lg font-semibold text-green-600 flex items-center gap-1">
//                         <FaRupeeSign />
//                         <span>{Number(selectedOrder.totalPrice || 0).toFixed(2)}</span>
//                       </div>
//                     </div>

//                     <div className="flex justify-end gap-3">
//                       <button
//                         onClick={() => {
//                           // sample: download invoice placeholder
//                           toast.info("Invoice download not implemented in demo");
//                         }}
//                         className="px-4 py-2 rounded-lg  text-sm hover:bg-gray-100"
//                       >
//                         Download Invoice.
//                       </button>
//                       <button
//                         onClick={() => {
//                           setOpenOrderId(null);
//                           setSelectedOrder(null);
//                         }}
//                         className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>

//       <Footer />
//     </>
//   );
// };

// export default SellerOrders;
