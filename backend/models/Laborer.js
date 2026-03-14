const mongoose = require("mongoose");

const laborerSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Laborer name is required"], trim: true },
        phone: { type: String, default: "" },
        skills: [{ type: String }],
        dailyRate: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        // The architect who manages this laborer
        architectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Currently assigned project (optional)
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConstructionProject",
            default: null,
        },
        taskDescription: { type: String, default: "" },
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Laborer", laborerSchema);
