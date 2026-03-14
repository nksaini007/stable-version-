const mongoose = require("mongoose");

const materialRequestSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConstructionProject",
            required: true,
        },
        architectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                materialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterial" },
                materialName: { type: String },
                quantity: { type: Number, required: true },
                unit: { type: String },
                urgency: {
                    type: String,
                    enum: ["Low", "Medium", "High", "Urgent"],
                    default: "Medium",
                },
            },
        ],
        status: {
            type: String,
            enum: ["Pending", "Approved", "Partially Approved", "Rejected"],
            default: "Pending",
        },
        notes: { type: String, default: "" },
        adminNotes: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MaterialRequest", materialRequestSchema);
