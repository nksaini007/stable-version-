const Order = require("../models/Order");
const User = require("../models/userModel");
const Product = require("../models/product");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { calculateServerSideDelivery } = require("../utils/deliveryCalculator");
const mongoose = require("mongoose");
const WebsiteConfig = require("../models/WebsiteConfig");

// ------------------ CUSTOMER FUNCTIONS ------------------

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const {
            orderItems: clientItems,
            shippingAddress,
            paymentMethod,
            itemsPrice: clientItemsPrice,
            taxPrice: clientTaxPrice,
            shippingPrice: clientShippingPrice,
            totalPrice: clientTotalPrice,
        } = req.body;

        if (!clientItems || clientItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        // 1️⃣ Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 2️⃣ SECURE CALCULATION: Build verified order items and calculate prices server-side
        let itemsPrice = 0;
        let totalWeight = 0;
        const verifiedOrderItems = [];

        for (const item of clientItems) {
            const dbProduct = await Product.findById(item.product || item._id).populate("seller", "name email phone businessName");
            if (!dbProduct) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }

            // 🛡️ SECURE PRICE EXTRACTION
            // Base product defaults
            let sourcePrice = dbProduct.price;
            let sourceTiers = dbProduct.pricingTiers || {};

            // If a variant is specified, we MUST use the variant's own secure pricing
            if (item.variantId) {
                const variant = dbProduct.variants.find(v => v._id.toString() === item.variantId.toString());
                if (variant) {
                    sourcePrice = variant.price;
                    sourceTiers = variant.pricingTiers || {};
                } else {
                    // Critical security: if the variant doesn't exist, we fallback to base price 
                    // or could log an error/prevent order. For now, we'll keep base as fallback.
                    console.warn(`SECURITY_ALERT: Variant ${item.variantId} not found on product ${dbProduct._id}`);
                }
            }

            // Apply Role-Based Pricing Securely
            let unitPrice = sourcePrice; 
            if (req.user.role === "architect" || req.user.role === "architectPartner") {
                unitPrice = sourceTiers.architect || sourcePrice;
            } else if (sourceTiers.normal) {
                unitPrice = sourceTiers.normal;
            }

            // Add weight for delivery calculation
            const weightMatch = (dbProduct.weight || "0").match(/(\d+(\.\d+)?)/);
            const unitWeight = weightMatch ? parseFloat(weightMatch[0]) : 0;
            totalWeight += unitWeight * item.qty;

            const itemSubtotal = unitPrice * item.qty;
            itemsPrice += itemSubtotal;

            verifiedOrderItems.push({
                name: dbProduct.name,
                qty: item.qty,
                image: dbProduct.images?.[0]?.url || "",
                price: unitPrice,
                product: dbProduct._id,
                seller: {
                    _id: dbProduct.seller._id,
                    name: dbProduct.seller.businessName || dbProduct.seller.name,
                    email: dbProduct.seller.email,
                    phone: dbProduct.seller.phone,
                },
            });
        }

        // 3️⃣ Secure Delivery Calculation
        const deliveryResult = await calculateServerSideDelivery(
            shippingAddress.postalCode,
            totalWeight,
            itemsPrice
        );
        const shippingPrice = deliveryResult.totalCharge;

        // 4️⃣ Secure Tax & Total Calculation
        const config = await WebsiteConfig.findOne();
        const taxRate = config?.settings?.taxRate ?? 0; // Default to 0 if not set, or update to standard like 18
        const taxPrice = Math.round((itemsPrice * taxRate) / 100);
        
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        // 5️⃣ Create Order in Database
        const order = new Order({
            orderItems: verifiedOrderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: false, 
            orderStatus: paymentMethod === "Razorpay" ? "Payment Pending" : "Pending",
            deliveryZone: deliveryResult.zone,
            deliveryVehicleType: deliveryResult.vehicleType,
            deliveryVehicleCount: deliveryResult.vehicleCount,
        });

        // Add initial tracking
        order.tracking.push({
            status: paymentMethod === "Razorpay" ? "Payment Pending" : "Order Placed",
            note: paymentMethod === "Razorpay" ? "Waiting for payment verification" : "Order successfully placed via COD"
        });

        // 5.5 Check Stock availability before proceeding
        for (const item of verifiedOrderItems) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.qty) {
                 return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
            }
        }


        // 6️⃣ If Razorpay, create Razorpay Order
        let razorpayOrder = null;
        if (paymentMethod === "Razorpay") {
            const options = {
                amount: Math.round(totalPrice * 100), // Amount in paise
                currency: "INR",
                receipt: `order_rcpt_${Date.now()}`,
            };
            razorpayOrder = await razorpay.orders.create(options);
            order.paymentResult = {
                id: razorpayOrder.id, // Store Razorpay Order ID
                status: "Created",
            };
        }

        const createdOrder = await order.save();
        
        console.log(`[Order Created] ID: ${createdOrder._id}, Razorpay Order: ${razorpayOrder ? razorpayOrder.id : "N/A"}`);

        res.status(201).json({
            ...createdOrder.toObject(),
            razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
            razorpayKey: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/orders/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Update Order in DB
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = "Pending"; 
        order.paymentResult = {
            id: order.paymentResult?.id || razorpay_order_id, // Keep Razorpay Order ID
            paymentId: razorpay_payment_id, // Store Payment ID specifically
            status: "Success",
            update_time: new Date().toISOString(),
        };

        order.tracking.push({
            status: "Order Placed",
            note: "Payment verified successfully"
        });

        // 🚀 DEDUCT STOCK ONLY ON SUCCESSFUL PAYMENT
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
              product.stock -= item.qty;
              
              if (item.variantId && product.variants) {
                const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                if (variant) {
                  variant.stock -= item.qty;
                }
              }
              await product.save();
            }
        }

        await order.save();


        res.json({ success: true, message: "Payment verified successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders of logged-in customer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order details (any authorized role)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("deliveryPerson", "name email phone vehicleType")
      .populate("orderItems.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = req.user._id.toString();
    const role = req.user.role;

    // Authorization: customer who placed, admin, assigned delivery, or seller with items
    const isOwner = order.user._id.toString() === userId;
    const isAdmin = role === "admin";
    const isDelivery = role === "delivery" && order.deliveryPerson?._id?.toString() === userId;
    const isSeller = role === "seller" && order.orderItems.some(
      (item) => item.seller?._id?.toString() === userId
    );

    if (!isOwner && !isAdmin && !isDelivery && !isSeller) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ SELLER FUNCTIONS ------------------

// Get all orders for the logged-in seller
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "orderItems.seller._id": req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update item-level status by seller
const updateItemStatus = async (req, res) => {
  try {
    const { orderId, productId, status } = req.body;

    if (!orderId || !productId || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Find the item that matches productId
    const item = order.orderItems.find(
      (i) => i.product.toString() === productId.toString()
    );

    if (!item) return res.status(404).json({ message: "Item not found in order" });

    // ✅ Check if logged-in seller owns this item
    if (item.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this item" });
    }

    // ✅ Update the item-level status
    item.itemStatus = status;

    // ✅ Optionally, also push a note for audit tracking
    order.notes.push({
      message: `Seller updated item '${item.name}' status to '${status}'`,
      addedBy: "Seller",
    });

    await order.save();

    res.json({
      message: `Item status updated to '${status}'`,
      item,
    });
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({ message: "Server error updating item status" });
  }
};

// ------------------ ADMIN FUNCTIONS ------------------

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update overall order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add admin note
const addOrderNote = async (req, res) => {
  try {
    const { orderId, message } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.notes.push({ message, addedBy: "Admin" });
    await order.save();
    res.json({ message: "Note added", notes: order.notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ DELIVERY FUNCTIONS ------------------

// Get delivery person's assigned orders
const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPerson: req.user._id })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delivery person picks up (marks order as picked up)
const pickupOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.deliveryPerson?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not assigned to you" });
    }

    order.orderStatus = "Out for Delivery";
    order.pickedUpAt = Date.now();
    order.tracking.push({
      status: "Out for Delivery",
      date: Date.now(),
      note: `Picked up by delivery partner`,
    });
    await order.save();
    res.json({ message: "Order picked up", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delivery person confirms delivery
const confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.deliveryPerson?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not assigned to you" });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = "Delivered";
    order.tracking.push({
      status: "Delivered",
      date: Date.now(),
      note: "Delivered successfully",
    });

    // Mark all items as delivered too
    order.orderItems.forEach((item) => {
      item.itemStatus = "Delivered";
    });

    await order.save();
    res.json({ message: "Delivery confirmed", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delivery person stats
const getDeliveryStats = async (req, res) => {
  try {
    const allOrders = await Order.find({ deliveryPerson: req.user._id });
    const delivered = allOrders.filter((o) => o.isDelivered);
    const pending = allOrders.filter((o) => !o.isDelivered && o.orderStatus !== "Cancelled");
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayDelivered = delivered.filter(
      (o) => o.deliveredAt && new Date(o.deliveredAt) >= todayStart
    );

    // Simple earnings: ₹40 per delivery
    const totalEarnings = delivered.length * 40;

    // Weekly earnings breakdown
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyEarnings = weekDays.map((day, idx) => {
      const dayDeliveries = delivered.filter((o) => {
        if (!o.deliveredAt) return false;
        return new Date(o.deliveredAt).getDay() === idx;
      });
      return { day, amount: dayDeliveries.length * 40 };
    });

    res.json({
      totalDeliveries: delivered.length,
      pendingOrders: pending.length,
      completedToday: todayDelivered.length,
      totalEarnings,
      weeklyEarnings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ ADMIN: ASSIGN DELIVERY ------------------

// Admin assigns delivery person to order
const assignDeliveryPerson = async (req, res) => {
  try {
    const { orderId, deliveryPersonId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    order.deliveryPerson = deliveryPersonId;
    order.assignedAt = Date.now();
    order.deliveryOtp = otp;
    if (order.orderStatus === "Pending" || order.orderStatus === "Confirmed" || order.orderStatus === "Processing") {
      order.orderStatus = "Shipped";
    }
    order.tracking.push({
      status: "Shipped",
      date: Date.now(),
      note: "Delivery partner assigned",
    });
    await order.save();

    res.json({ message: "Delivery person assigned", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all delivery persons
const getDeliveryPersons = async (req, res) => {
  try {
    const User = require("../models/userModel");
    const deliveryUsers = await User.find({ role: "delivery" }).select("-password");
    res.json(deliveryUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ CUSTOMER: CANCEL ------------------

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    order.orderStatus = "Cancelled";
    order.orderItems.forEach((item) => {
      item.itemStatus = "Cancelled";
    });
    order.tracking.push({
      status: "Cancelled",
      date: Date.now(),
      note: "Cancelled by customer",
    });
    await order.save();

    // ✅ NEW: RESTOCK ON CANCELLATION
    try {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.qty;
          
          if (item.variantId && product.variants) {
            const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
            if (variant) {
              variant.stock += item.qty;
            }
          }
          await product.save();
        }
      }
    } catch (restockErr) {
      console.error("Restock Error:", restockErr);
    }

    res.json({ message: "Order cancelled and stock restored", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update delivery status (legacy — kept for compatibility)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId, isDelivered } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDelivered = isDelivered;
    order.deliveredAt = isDelivered ? Date.now() : null;
    await order.save();
    res.json({ message: "Delivery status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ RETURN MANAGEMENT ------------------

// @desc    Customer/Architect initiates a Return for an Item
// @route   POST /api/orders/return/request
// @access  Private (Customer/Architect)
const requestReturn = async (req, res) => {
  try {
    const { orderId, productId, reason, customerNote } = req.body;
    
    if (!orderId || !productId || !reason) {
      return res.status(400).json({ message: "Missing required return details" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure authorization
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to return this item" });
    }

    // Find Item
    const item = order.orderItems.find(i => i.product.toString() === productId.toString());
    if (!item) return res.status(404).json({ message: "Item not found in order" });

    // Validate Status - can only return Delivered items
    if (item.itemStatus !== "Delivered") {
      return res.status(400).json({ message: "Only delivered items can be returned" });
    }

    // Update Status
    item.itemStatus = "Return Requested";
    item.returnDetails = {
      isReturnRequested: true,
      reason,
      customerNote,
      requestedAt: Date.now(),
      status: "Requested",
    };

    order.tracking.push({
      status: "Return Requested",
      date: Date.now(),
      note: `Return initiated for ${item.name}: ${reason}`,
    });

    order.notes.push({
      message: `User requested return for ${item.name}`,
      addedBy: "User",
    });

    await order.save();
    res.json({ message: "Return requested successfully", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seller/Admin approves or rejects a return
// @route   PUT /api/orders/return/process
// @access  Private (Seller/Admin)
const processReturn = async (req, res) => {
  try {
    const { orderId, productId, status, sellerNote } = req.body; // status: "Approved" or "Rejected"
    
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.orderItems.find(i => i.product.toString() === productId.toString());
    if (!item) return res.status(404).json({ message: "Item not found in order" });

    // If Seller, must own the item. Admin can process any.
    if (req.user.role === "seller" && item.seller._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: You don't own this item" });
    }

    item.itemStatus = status === "Approved" ? "Return Approved" : "Return Rejected";
    item.returnDetails.status = status;
    item.returnDetails.approvedAt = Date.now();
    
    if (sellerNote) {
       item.returnDetails.sellerNote = sellerNote;
    }

    order.tracking.push({
      status: "Return Requested", // Custom enum fallback or use standard tracking
      date: Date.now(),
      note: `Return request ${status.toLowerCase()} by ${req.user.role}`,
    });

    await order.save();
    res.json({ message: `Return ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delivery assigns/picks up return (unified method)
// @route   PUT /api/orders/return/pickup
// @access  Private (Delivery/Admin)
const completeReturnPickup = async (req, res) => {
   try {
    const { orderId, productId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.orderItems.find(i => i.product.toString() === productId.toString());
    if (!item) return res.status(404).json({ message: "Item not found in order" });

    item.itemStatus = "Return Picked Up";
    item.returnDetails.status = "Picked Up";
    item.returnDetails.pickedUpAt = Date.now();

    order.tracking.push({
      status: "Return Picked Up",
      date: Date.now(),
      note: `Return item ${item.name} has been picked up`,
    });

    await order.save();
    res.json({ message: "Return picked up successfully", order });
   } catch(error) {
    res.status(500).json({ message: error.message });
   }
};

// @desc    Seller/Admin confirms return is complete and initiates refund via DB flag
// @route   PUT /api/orders/return/complete
// @access  Private (Seller/Admin)
const completeReturn = async (req, res) => {
   try {
    const { orderId, productId, refundAmount } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.orderItems.find(i => i.product.toString() === productId.toString());
    if (!item) return res.status(404).json({ message: "Item not found in order" });

    // Authorization
    if (req.user.role === "seller" && item.seller._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    item.itemStatus = "Refunded";
    item.returnDetails.status = "Completed";
    item.returnDetails.resolvedAt = Date.now();
    item.returnDetails.refundAmount = refundAmount || item.price;

    order.tracking.push({
      status: "Refund Processed",
      date: Date.now(),
      note: `Refund processed for ${item.name}`,
    });

    // 🚀 NEW: AUTOMATED RAZORPAY REFUND
    if (order.paymentMethod === "Razorpay" && order.isPaid && (item.paymentResult?.paymentId || order.paymentResult?.paymentId)) {
        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            // Razorpay expect amount in paise
            const refundAmountPaise = Math.round((refundAmount || item.price) * 100);
            
            const refund = await razorpay.payments.refund(item.paymentResult?.paymentId || order.paymentResult?.paymentId, {
                amount: refundAmountPaise,
                speed: "normal",
                notes: {
                   reason: item.returnDetails.reason || "Customer Return",
                   orderId: order._id.toString(),
                   productId: item.product.toString()
                }
            });

            item.returnDetails.refundId = refund.id;
            order.notes.push({
                message: `Automated Refund Processed: ${refund.id}`,
                addedBy: "System"
            });
            console.log(`[Refund Success] ID: ${refund.id} for Order: ${order._id}`);
        } catch (refundErr) {
            console.error("Razorpay Refund API Error:", refundErr);
            order.notes.push({
                message: `FAILED Automated Refund: ${refundErr.description || refundErr.message}`,
                addedBy: "System"
            });
            // We still proceed with the DB update but the admin will know it failed via notes
        }
    }

    await order.save();

    // RESTOCK Logic
    try {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.qty;
          if (item.variantId && product.variants) {
            const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
            if (variant) {
              variant.stock += item.qty;
            }
          }
          await product.save();
        }
    } catch (restockErr) {
        console.error("Restock Error:", restockErr);
    }

    res.json({ message: "Return completed and refunded", order });
   } catch(error) {
     res.status(500).json({ message: error.message });
   }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateItemStatus,
  getAllOrders,
  updateOrderStatus,
  addOrderNote,
  updateDeliveryStatus,
  // NEW
  getDeliveryOrders,
  pickupOrder,
  confirmDelivery,
  getDeliveryStats,
  assignDeliveryPerson,
  getDeliveryPersons,
  cancelOrder,
  verifyPayment,
  requestReturn,
  processReturn,
  completeReturnPickup,
  completeReturn,
};

