const mongoose = require("mongoose");

const deliveryPricingSchema = new mongoose.Schema(
    {
        zoneName: { type: String, required: true },
        // North India states covered by this zone
        states: [{ type: String }], // e.g. ["UP", "Delhi", "Haryana"]
        pincodeRanges: [
            {
                from: { type: Number },
                to: { type: Number },
            },
        ],

        vehicleType: {
            type: String,
            enum: ["bike", "mini_truck", "truck", "heavy_trailer"],
            required: true,
        },

        vehicleLabel: { type: String }, // e.g. "Bike/Scooter", "Mini Truck (1T)"

        // Capacity limits
        maxWeightKg: { type: Number, required: true },
        maxVolumeM3: { type: Number, default: null },

        // Pricing components (in INR)
        basePrice: { type: Number, required: true, default: 0 },
        pricePerKm: { type: Number, required: true, default: 0 },
        pricePerKg: { type: Number, default: 0 },

        // Estimated distance ranges for zone (km from origin city)
        minDistanceKm: { type: Number, default: 0 },
        maxDistanceKm: { type: Number, default: 500 },

        isActive: { type: Boolean, default: true },

        // Special rules
        freeAboveOrderValue: { type: Number, default: null }, // free delivery if order > X
        minimumCharge: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.DeliveryPricing ||
    mongoose.model("DeliveryPricing", deliveryPricingSchema);
