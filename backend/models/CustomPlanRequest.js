const mongoose = require("mongoose");

const customPlanRequestSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        basePlan: { type: mongoose.Schema.Types.ObjectId, ref: "ConstructionPlan", required: true },
        requirements: { type: String, required: true }, // End-user customization details
        attachments: [{ type: String }], // Optional reference docs or sketches
        
        assignedArchitect: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin assigns this
        
        status: {
            type: String,
            enum: ["Pending", "In Review", "Assigned", "Design Proofing", "Execution Requested", "Approved", "Completed"],
            default: "Pending",
        },
        
        estimatedCost: { type: Number }, // Architect or Admin provides this after review
        adminNotes: { type: String },
        architectNotes: { type: String },

        isVerifiedByStinchar: { type: Boolean, default: false }, // Final "Assure" check
        completedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CustomPlanRequest", customPlanRequestSchema);
