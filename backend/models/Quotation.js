const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String },
        qty: { type: Number, required: true },
        price: { type: Number, required: true }, // Original or Negotiated Price
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
        alternativeProduct: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Requested", "Adjusted", "Accepted", "Rejected", "Converted"],
      default: "Requested",
    },
    customerNote: { type: String },
    adminNote: { type: String },
    convertedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);
