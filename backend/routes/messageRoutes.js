const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const {
    createMessageThread,
    getMyMessages,
    getAllMessages,
    replyToMessage,
    updateMessageStatus
} = require("../controllers/messageController");

// Customer routes
router.get("/", (req, res) => res.json({ success: true, messages: [] })); // catch bare GET
router.post("/", protect, createMessageThread);
router.get("/my-messages", protect, getMyMessages);
router.put("/:id/reply", protect, replyToMessage);

// Admin routes
router.get("/admin", protect, adminOnly, getAllMessages);
router.put("/:id/status", protect, adminOnly, updateMessageStatus);

module.exports = router;
