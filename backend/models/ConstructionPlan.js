const mongoose = require("mongoose");

const constructionPlanSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        category: {
            type: String,
            required: true,
        },
        planType: {
            type: String,
            required: true,
        },
        description: { type: String, required: true },
        images: [{ type: String }],
        estimatedCost: { type: String, required: true },
        area: { type: String, required: true },
        features: [{ type: String }], // Array of strings e.g. ["3 Bedrooms", "Open Kitchen"]
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ConstructionPlan", constructionPlanSchema);
