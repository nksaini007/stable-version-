const express = require("express");
const router = express.Router();
const controller = require("../controllers/supportController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Customer: create and view own tickets
router.post("/", protect, controller.createTicket);
router.get("/my", protect, controller.getMyTickets);

// Architect: view tickets for their projects
router.get("/architect", protect, controller.getArchitectTickets);

// Admin: view all tickets
router.get("/all", protect, adminOnly, controller.getAllTickets);

// Shared: get single ticket, reply, update status
router.get("/:id", protect, controller.getTicketById);
router.post("/:id/reply", protect, controller.replyToTicket);
router.put("/:id/status", protect, controller.updateTicketStatus);

module.exports = router;
