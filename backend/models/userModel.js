
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

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
