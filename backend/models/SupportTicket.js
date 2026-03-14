const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConstructionProject",
            default: null,
        },
        subject: { type: String, required: [true, "Subject is required"], trim: true, maxlength: 300 },
        category: {
            type: String,
            enum: ["General", "Project", "Billing", "Technical", "Complaint", "Other"],
            default: "General",
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Urgent"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "Resolved", "Closed"],
            default: "Open",
        },
        thread: [
            {
                sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                senderRole: { type: String, required: true },
                text: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
