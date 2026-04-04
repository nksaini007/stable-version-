const mongoose = require("mongoose");

const constructionPlanSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        category: {
            type: String, // Main Category (e.g., Residential)
            required: true,
        },
        planType: {
            type: String, // Subcategory (e.g., Modern Villa)
            required: true,
        },
        description: { type: String, required: true },
        images: [{ type: String }],
        estimatedCost: { type: Number, required: true }, // Changed to Number for calculation
        area: { type: String, required: true },
        features: [{ type: String }], // Technical specs
        facilities: [{ type: String }], // Amenities (e.g., Pool, Garden)
        subConstructions: [
            {
                name: { type: String, required: true },
                cost: { type: Number, required: true },
                description: { type: String },
            }
        ], // Add-ons / Improvements
        linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Products from store
        architectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Lead designer
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ConstructionPlan", constructionPlanSchema);
