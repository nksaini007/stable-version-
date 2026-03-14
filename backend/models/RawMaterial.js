const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Material name is required"], trim: true },
        category: {
            type: String,
            required: true,
            enum: [
                "Cement & Concrete", "Steel & Iron", "Bricks & Blocks", "Sand & Aggregates",
                "Wood & Timber", "Paint & Finishes", "Plumbing", "Electrical",
                "Glass", "Tiles & Flooring", "Roofing", "Adhesives & Sealants",
                "Hardware", "Insulation", "Other"
            ],
        },
        unit: {
            type: String,
            required: true,
            enum: ["kg", "ton", "bags", "pieces", "sqft", "meters", "liters", "cubic meters", "bundles", "rolls"],
        },
        unitPrice: { type: Number, default: 0 },
        description: { type: String, default: "" },
        isGlobal: { type: Boolean, default: false }, // true = admin-managed global material
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("RawMaterial", rawMaterialSchema);
