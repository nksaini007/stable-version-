const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    uploadAdFiles,
    createCampaign,
    getMyCampaigns,
    updateCampaign,
    payForCampaign,
    getMyAdPayments,
    getCampaignStats,
    getAllCampaigns,
    getAllAdPayments,
    approveCampaign,
    rejectCampaign,
    pauseCampaign,
    getAdminAdStats,
    getPublicActiveAds,
    trackAdClick,
} = require("../controllers/adController");

// ===== PUBLIC ROUTES =====
router.get("/public", getPublicActiveAds);
router.post("/click/:id", trackAdClick);

// ===== ADMIN ROUTES (must come before /:id wildcards) =====
router.get("/admin/stats", protect, authorize("admin"), getAdminAdStats);
router.get("/admin/all", protect, authorize("admin"), getAllCampaigns);
router.get("/admin/payments", protect, authorize("admin"), getAllAdPayments);
router.put("/admin/:id/approve", protect, authorize("admin"), approveCampaign);
router.put("/admin/:id/reject", protect, authorize("admin"), rejectCampaign);
router.put("/admin/:id/pause", protect, authorize("admin"), pauseCampaign);

// ===== SELLER STATIC ROUTES (must come before /:id wildcards) =====
router.get("/mine", protect, authorize("seller"), getMyCampaigns);
router.get("/my-payments", protect, authorize("seller"), getMyAdPayments);
router.get("/stats/:id", protect, authorize("seller"), getCampaignStats);

// ===== SELLER DYNAMIC ROUTES =====
router.post("/", protect, authorize("seller"), uploadAdFiles, createCampaign);
router.put("/:id", protect, authorize("seller"), uploadAdFiles, updateCampaign);
router.post("/:id/payment", protect, authorize("seller"), uploadAdFiles, payForCampaign);

module.exports = router;
