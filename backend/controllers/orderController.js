const Order = require("../models/Order");
const mongoose = require("mongoose");

// ------------------ CUSTOMER FUNCTIONS ------------------

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      deliveryZone,
      deliveryVehicleType,
      multiVehicle,
      deliveryVehicleCount,
      deliveryChargeBreakdown,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      deliveryZone,
      deliveryVehicleType,
      multiVehicle,
      deliveryVehicleCount,
      deliveryChargeBreakdown,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
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

// Update item-level status by seller
// const updateItemStatus = async (req, res) => {
//   try {
//     const { orderId, itemId, status } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     const item = order.orderItems.id(itemId);
//     if (!item) return res.status(404).json({ message: "Item not found" });

//     if (item.seller._id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized to update this item" });
//     }

//     item.itemStatus = status;
//     await order.save();
//     res.json({ message: "Item status updated", item });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
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
    res.json({ message: "Order cancelled", order });
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
};

