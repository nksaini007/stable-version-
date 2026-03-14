const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan
} = require("../controllers/constructionPlanController");

// Public routes (Customers viewing the catalog)
router.get("/", getAllPlans);
router.get("/:id", getPlanById);

// Admin only routes for managing catalog
router.post("/", protect, adminOnly, upload.array('images', 5), createPlan);
router.put("/:id", protect, adminOnly, upload.array('images', 5), updatePlan);
router.delete("/:id", protect, adminOnly, deletePlan);

module.exports = router;
