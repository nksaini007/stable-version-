const Message = require("../models/Message");

// @desc    Create a new message thread (Customer starts inquiry)
// @route   POST /api/messages
// @access  Private (Logged in user)
const createMessageThread = async (req, res) => {
    try {
        const { planId, subject, text } = req.body;

        const newMessage = new Message({
            customer: req.user._id,
            plan: planId || null,
            subject,
            status: "Open",
            thread: [
                {
                    sender: req.user._id,
                    senderRole: req.user.role || "customer",
                    text: text
                }
            ]
        });

        const savedMessage = await newMessage.save();
        res.status(201).json({ success: true, message: savedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
    }
};

// @desc    Get all messages for current user
// @route   GET /api/messages/my-messages
// @access  Private
const getMyMessages = async (req, res) => {
    try {
        const messages = await Message.find({ customer: req.user._id })
            .populate("plan", "title images")
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, count: messages.length, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch messages", error: error.message });
    }
};

// @desc    Get all messages (Admin)
// @route   GET /api/messages/admin
// @access  Private/Admin
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate("customer", "name email profileImage")
            .populate("plan", "title")
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, count: messages.length, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch all messages", error: error.message });
    }
};

// @desc    Reply to an existing message thread
// @route   PUT /api/messages/:id/reply
// @access  Private
const replyToMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message thread not found" });
        }

        // Verify ownership if not admin
        if (req.user.role !== "admin" && message.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to reply to this thread" });
        }

        // Add reply to thread
        message.thread.push({
            sender: req.user._id,
            senderRole: req.user.role,
            text: text
        });

        // Update status for clear admin visibility
        if (req.user.role === "admin") {
            message.status = "Replied";
        } else {
            message.status = "Open"; // If user replies back, mark as open again
        }

        const updatedMessage = await message.save();
        res.status(200).json({ success: true, message: updatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send reply", error: error.message });
    }
};

// @desc    Close a message thread (Admin)
// @route   PUT /api/messages/:id/status
// @access  Private/Admin
const updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ success: false, message: "Message thread not found" });
        }
        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
    }
};

module.exports = {
    createMessageThread,
    getMyMessages,
    getAllMessages,
    replyToMessage,
    updateMessageStatus
};
