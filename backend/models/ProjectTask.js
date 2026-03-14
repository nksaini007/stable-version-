const mongoose = require("mongoose");

const projectTaskSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "ConstructionProject", required: true },
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
        },
        images: [{ type: String }],
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Usually the Architect
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProjectTask", projectTaskSchema);
