const mongoose = require("mongoose");

const constructionProjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["House", "Building", "Apartment", "Cricket Stadium", "Commercial Project", "Other"],
            required: true,
        },
        description: { type: String, required: true },
        location: { type: String, required: true },
        images: [{ type: String }],
        blueprints: [
            {
                title: { type: String, required: true },
                fileUrl: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            }
        ],
        estimatedCost: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        status: {
            type: String,
            enum: ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"],
            default: "Planning",
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium",
        },
        phases: [
            {
                name: { type: String, required: true }, // e.g. Excavation, Foundation
                description: { type: String },
                status: {
                    type: String,
                    enum: ["Pending", "In Progress", "Completed"],
                    default: "Pending",
                },
                startDate: { type: Date },
                endDate: { type: Date },
            }
        ],
        currentPhase: { type: String, default: "Initial Planning" },
        progressPercentage: { type: Number, default: 0 },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        architectId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        planId: { type: mongoose.Schema.Types.ObjectId, ref: "ConstructionPlan" }, // Link to original blueprint/plan
    },
    { timestamps: true }
);

module.exports = mongoose.model("ConstructionProject", constructionProjectSchema);
