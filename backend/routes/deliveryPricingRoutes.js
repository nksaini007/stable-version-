const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    getPricingRules,
    getZones,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    seedDefaultZones,
    calculateDeliveryCharge,
} = require("../controllers/deliveryPricingController");

// ===== PUBLIC / AUTHENTICATED =====
router.post("/calculate", protect, calculateDeliveryCharge);
router.get("/zones", getZones); // Public — for checkout UI

// ===== ADMIN ROUTES =====
router.get("/", protect, authorize("admin"), getPricingRules);
router.post("/", protect, authorize("admin"), createPricingRule);
router.put("/:id", protect, authorize("admin"), updatePricingRule);
router.delete("/:id", protect, authorize("admin"), deletePricingRule);
router.post("/seed", protect, authorize("admin"), seedDefaultZones);

module.exports = router;
