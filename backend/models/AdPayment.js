const mongoose = require("mongoose");

const adPaymentSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdCampaign",
            required: true,
        },

        amount: { type: Number, required: true }, // in INR

        paymentMethod: {
            type: String,
            enum: ["UPI", "bank_transfer", "wallet", "cash"],
            required: true,
        },

        referenceNumber: { type: String, required: true }, // UPI txn ID or bank ref
        proofImage: { type: String, default: null }, // screenshot of payment

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        adminNote: { type: String, default: "" },
        approvedAt: { type: Date, default: null },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.AdPayment || mongoose.model("AdPayment", adPaymentSchema);
