const express = require("express");
const router = express.Router();
const { protect, adminOnly, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const {
    submitCustomRequest,
    assignArchitect,
    requestCompletion,
    verifyCompletion,
    getMyRequests,
    getArchitectAssignments
} = require("../controllers/customPlanController");

// Customer routes
router.post("/", protect, authorize("customer"), upload.array('attachments', 5), submitCustomRequest);
router.get("/my-requests", protect, authorize("customer"), getMyRequests);

// Admin routes
router.patch("/:id/assign", protect, adminOnly, assignArchitect);
router.patch("/:id/verify-completion", protect, adminOnly, verifyCompletion);

// Architect routes
router.get("/architect-assignments", protect, authorize("architect"), getArchitectAssignments);
router.get("/my-assignments", protect, authorize("architect"), getArchitectAssignments); // Alias for legacy frontend
router.patch("/:id/request-completion", protect, authorize("architect"), requestCompletion);

module.exports = router;
