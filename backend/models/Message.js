const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConstructionPlan",
            required: false, // Optional: They might contact admin for general support
        },
        subject: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Open", "Replied", "Closed"],
            default: "Open",
        },
        thread: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                senderRole: {
                    type: String,
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
