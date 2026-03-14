// backend/models/WebsiteConfig.js
const mongoose = require('mongoose');

const WebsiteConfigSchema = new mongoose.Schema(
    {
        banners: [
            {
                id: { type: String, required: true },
                imageUrl: { type: String, required: true },
                title: { type: String },
                link: { type: String }, // Optional navigation route for the banner
                isActive: { type: Boolean, default: true },
            }
        ],
        trendingItems: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product' // References products to display in trending sections
            }
        ],
        // Flexible fields for future specific site configurations
        settings: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('WebsiteConfig', WebsiteConfigSchema);
