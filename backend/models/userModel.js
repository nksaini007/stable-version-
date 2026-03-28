
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "seller", "delivery", "admin", "provider", "architect"],
    default: "customer",
  },
  phone: String,
  profileImage: String,
  bio: String,
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false }, // Used for Partner accounts (Seller/Delivery)

  // LOCATION (for map visualization)
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    city: { type: String, default: "" },
  },

  // CUSTOMER fields
  address: String,
  pincode: String,

  // COMPLIANCE & LEGAL (All Partners)
  aadhaarNumber: String,

  // SELLER fields
  businessName: String,
  shopBanner: String,
  storeDescription: String,
  supportPhone: String,
  supportEmail: String,
  businessType: {
    type: String,
    enum: ["Individual", "Partnership", "Company", ""],
    default: "",
  },
  socialLinks: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  },
  gstNumber: String,
  panNumber: String,
  companyRegistrationNumber: String,
  tradeLicenseNumber: String,
  fssaiLicense: String,
  businessAddress: String,
  businessCategory: String,
  bankAccount: String,
  ifscCode: String,

  // DELIVERY fields
  vehicleType: String,
  licenseNumber: String,
  rcBookNumber: String,
  deliveryAreaPincode: String,

  // ADMIN fields
  adminAccessCode: String,

  // PROVIDER fields
  serviceCategory: String, // Keep as string for display
  serviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  serviceSubCategory: String,
  serviceSubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory.subcategories' },
  serviceDescription: String,
  experience: String,
  verificationDocuments: [String],
  offeredServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

  // ARCHITECT fields
  skills: [String],
  contactInfo: String,
  coaRegistration: String,
  assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ConstructionProject' }],

  // SOCIAL — Follow System
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // ENHANCED SELLER FIELDS
  tagline: { type: String, default: "" },
  storePolicies: { type: String, default: "" },
  returnPolicy: { type: String, default: "" },
  shippingInfo: { type: String, default: "" },
  workingHours: { type: String, default: "" },
  established: { type: Date, default: null },

  // OTP Verification fields
  otp: String,
  otpExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },

}, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
