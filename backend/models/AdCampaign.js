const mongoose = require("mongoose");

const adCampaignSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: { type: String, required: true },
        description: { type: String },
        bannerImage: { type: String }, // uploaded image path

        adType: {
            type: String,
            enum: ["banner", "featured_product", "category_boost"],
            default: "banner",
        },

        targetCategory: { type: String, default: "" },
        targetProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },

        budget: { type: Number, required: true }, // in INR
        durationDays: { type: Number, required: true },

        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },

        status: {
            type: String,
            enum: ["draft", "pending_payment", "pending_approval", "active", "paused", "completed", "rejected"],
            default: "draft",
        },

        rejectionReason: { type: String, default: "" },
        adminNote: { type: String, default: "" },

        // Stats
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Computed CTR
adCampaignSchema.virtual("ctr").get(function () {
    if (!this.impressions) return 0;
    return ((this.clicks / this.impressions) * 100).toFixed(2);
});

module.exports = mongoose.models.AdCampaign || mongoose.model("AdCampaign", adCampaignSchema);
