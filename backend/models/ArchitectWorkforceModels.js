const mongoose = require("mongoose");

// --- TASK MODEL ---
const architectTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  architectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConstructionProject', default: null },
  deadline: { type: Date, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  proofFiles: [{ type: String }], // URLs to images/files
  architectNotes: { type: String, default: "" },
  partnerNotes: { type: String, default: "" }
}, { timestamps: true });

// --- PAYMENT MODEL ---
const architectPaymentSchema = new mongoose.Schema({
  architectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentType: { type: String, enum: ["Fixed", "Daily", "Per Task"], required: true },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  paymentDate: { type: Date, default: Date.now },
  description: { type: String, default: "" },
  referenceId: { type: String, default: "" } // for tracking external trx
}, { timestamps: true });

// --- ATTENDANCE MODEL ---
const architectAttendanceSchema = new mongoose.Schema({
  architectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Late"], default: "Present" },
  checkInTime: { type: Date, default: null },
  checkOutTime: { type: Date, default: null },
  checkInLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  checkOutLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { timestamps: true });

// Ensure one attendance per day per partner
architectAttendanceSchema.index({ partnerId: 1, date: 1 }, { unique: true });

// --- REVIEW MODEL ---
const architectReviewSchema = new mongoose.Schema({
  architectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true }
}, { timestamps: true });

// --- LIVE LOCATION MODEL ---
const partnerLocationSchema = new mongoose.Schema({
  architectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  accuracy: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-expire location docs after 24 hours of no update
partnerLocationSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 86400 });

const ArchitectTask = mongoose.models.ArchitectTask || mongoose.model("ArchitectTask", architectTaskSchema);
const ArchitectPayment = mongoose.models.ArchitectPayment || mongoose.model("ArchitectPayment", architectPaymentSchema);
const ArchitectAttendance = mongoose.models.ArchitectAttendance || mongoose.model("ArchitectAttendance", architectAttendanceSchema);
const ArchitectReview = mongoose.models.ArchitectReview || mongoose.model("ArchitectReview", architectReviewSchema);
const PartnerLocation = mongoose.models.PartnerLocation || mongoose.model("PartnerLocation", partnerLocationSchema);

module.exports = {
  ArchitectTask,
  ArchitectPayment,
  ArchitectAttendance,
  ArchitectReview,
  PartnerLocation
};
