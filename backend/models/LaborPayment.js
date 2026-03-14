const mongoose = require("mongoose");

const laborPaymentSchema = new mongoose.Schema(
    {
        laborerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Laborer",
            required: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConstructionProject",
            default: null,
        },
        architectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: { type: Number, required: [true, "Amount is required"] },
        date: { type: Date, default: Date.now },
        description: { type: String, default: "" },
        paymentMethod: {
            type: String,
            enum: ["Cash", "UPI", "Bank Transfer", "Other"],
            default: "Cash",
        },
        status: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Paid",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("LaborPayment", laborPaymentSchema);
