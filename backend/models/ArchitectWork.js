const mongoose = require("mongoose");

const architectWorkSchema = new mongoose.Schema(
    {
        architectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Project title is required"],
            trim: true,
            maxlength: 200,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Residential Architecture",
                "Commercial Design",
                "Interior Design",
                "Landscape Architecture",
                "Blueprints & Drafting",
                "Renovation",
                "Industrial Design",
                "Other",
            ],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: 5000,
        },
        images: [{ type: String }],
        location: { type: String, default: "" },
        estimatedCost: { type: String, default: "" },
        area: { type: String, default: "" },
        features: [{ type: String }],
        materialsUsed: [{ type: String }],
        architectInfo: {
            name: { type: String },
            phone: { type: String },
            email: { type: String },
            bio: { type: String },
            profileImage: { type: String },
        },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        status: {
            type: String,
            enum: ["Draft", "Published"],
            default: "Draft",
        },
        isPublic: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ArchitectWork", architectWorkSchema);
