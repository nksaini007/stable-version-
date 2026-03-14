const mongoose = require("mongoose");

const projectMaterialSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConstructionProject",
            required: true,
        },
        materialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RawMaterial",
            required: true,
        },
        architectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        quantityAllocated: { type: Number, default: 0 },
        quantityUsed: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 10 },
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

// Virtual: remaining stock
projectMaterialSchema.virtual("remaining").get(function () {
    return this.quantityAllocated - this.quantityUsed;
});

projectMaterialSchema.virtual("isLowStock").get(function () {
    return (this.quantityAllocated - this.quantityUsed) <= this.lowStockThreshold;
});

projectMaterialSchema.set("toJSON", { virtuals: true });
projectMaterialSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("ProjectMaterial", projectMaterialSchema);
