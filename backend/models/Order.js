const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // 🧍 USER who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🛒 ORDERED ITEMS
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },

        // 🏬 SELLER DETAILS
        seller: {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          name: { type: String, required: true },
          email: { type: String },
          phone: { type: String },
          shopName: { type: String },
        },

        // 📦 ITEM-LEVEL STATUS
        itemStatus: {
          type: String,
          enum: [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Returned",
          ],
          default: "Pending",
        },
      },
    ],

    // 🚚 SHIPPING DETAILS
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      landmark: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // 💳 PAYMENT DETAILS
    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Paytm", "Stripe", "Other"],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    // 💰 PRICE BREAKDOWN
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true },

    // 💸 PAYMENT STATUS
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    // 📦 ORDER STATUS (overall)
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },

    // 🚀 ORDER TRACKING
    tracking: [
      {
        status: {
          type: String,
          enum: [
            "Order Placed",
            "Confirmed by Seller",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
          ],
          required: true,
        },
        location: { type: String },
        date: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],

    // 🚚 DELIVERY PERSON & STATUS
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveryOtp: { type: String },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    // 🚛 SMART DELIVERY LOGISTICS (Multi-Vehicle / North India)
    deliveryZone: { type: String, default: "" },
    deliveryVehicleType: {
      type: String,
      enum: ["bike", "mini_truck", "truck", "heavy_trailer", ""],
      default: "",
    },
    deliveryVehicleCount: { type: Number, default: 1 },
    deliveryChargeBreakdown: {
      baseCharge: { type: Number, default: 0 },
      weightCharge: { type: Number, default: 0 },
      distanceCharge: { type: Number, default: 0 },
      vehicleCount: { type: Number, default: 1 },
      totalEstimatedKm: { type: Number, default: 0 },
    },

    // 📦 MULTI-SELLER STATUS SUMMARY
    sellers: [
      {
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
          ],
          default: "Pending",
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // 🗒️ ADMIN NOTES / AUDIT TRAIL
    notes: [
      {
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
        addedBy: { type: String }, // "Admin", "Seller", "User"
      },
    ],

    // ⚙️ SYSTEM CONTROL FLAGS
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// ✅ Prevent OverwriteModelError
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;
