const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String, index: true },
    phone: { type: String, index: true },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    type: { type: String, enum: ["email", "phone"], required: true },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-delete OTP after 15 minutes
otpSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
module.exports = Otp;
