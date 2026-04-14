const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // Optional because the customer creates it without a provider, Admin assigns later.
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    requirements: {
        type: String,
        trim: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    isFlexibleDate: {
        type: Boolean,
        default: false,
    },
    serviceAddress: {
        type: String,
        trim: true,
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Arrived", "WorkStarted", "PaymentPending", "Completed", "Cancelled"],
        default: "Pending",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
    },
    amount: {
        type: Number, // Storing agreed price at time of booking
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
