const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      max: [999999, 'Price cannot exceed 6 digits'],
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      
    },
    subcategory: {
      type: String,
    },
    type: { type: String }, // e.g., Cotton, Electric

    // Product Details
    brand: { type: String },
    material: { type: String },
    color: { type: String },
    dimensions: { type: String },
    weight: { type: String },
    warranty: { type: String },
    origin: { type: String },

    features: [{ type: String }], // Array of features
    care_instructions: { type: String },

    // Images
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    // Stock & Seller
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Reviews & Ratings
    rating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // AR Feature
    arModelUrl: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v) {
          // Allow empty string or secure HTTP/HTTPS URL
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid HTTP/HTTPS URL for the 3D model'
      }
    },
    arModelScale: { type: String, trim: true },
    arModelRotation: { type: String, trim: true },

    // New Pricing Tiers
    pricingTiers: {
      architect: { type: Number, default: 0 },
      stinchar: { type: Number, default: 0 },
      normal: { type: Number, default: 0 },
      bulk: [
        {
          minQty: { type: Number, required: true },
          price: { type: Number, required: true },
        },
      ],
    },

    // Recommendations
    recommendations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

// module.exports = mongoose.model('Product', productSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;