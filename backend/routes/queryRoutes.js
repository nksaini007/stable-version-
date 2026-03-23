const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    executeCustomQuery,
    getUserGrowthChart,
    getOrderStatusChart
} = require("../controllers/queryController");

// ===== ADMIN CUSTOM QUERY ROUTES =====
router.post("/custom", protect, authorize("admin"), executeCustomQuery);

// ===== ADMIN GRAPH ROUTES =====
router.get("/user-growth", protect, authorize("admin"), getUserGrowthChart);
router.get("/order-status", protect, authorize("admin"), getOrderStatusChart);

module.exports = router;
