const AdCampaign = require("../models/AdCampaign");
const AdPayment = require("../models/AdPayment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================== PUBLIC / CUSTOMER CONTROLLERS ====================

/**
 * GET /api/ads/public
 * Public endpoint to fetch currently active campaigns (banners)
 */
const getPublicActiveAds = async (req, res) => {
    try {
        const { category } = req.query;

        const filter = {
            status: "active",
            endDate: { $gte: new Date() },
            adType: { $in: ["banner", "featured_product"] },
        };

        if (category) {
            filter.targetCategory = category;
        }

        const activeAds = await AdCampaign.find(filter)
            .select("title bannerImage adType targetCategory targetProduct")
            .populate("targetProduct", "name price images slug")
            .sort({ createdAt: -1 }) // Sort newest first
            .limit(10); // Max 10 ads for public carousel

        // Fire & forget: incrementally update impressions
        if (activeAds.length > 0) {
            const adIds = activeAds.map(ad => ad._id);
            AdCampaign.updateMany(
                { _id: { $in: adIds } },
                { $inc: { impressions: 1 } }
            ).exec().catch(err => console.error("Failed to update ad impressions:", err));
        }

        res.json(activeAds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/ads/click/:id
 * Tracks a click on an ad
 */
const trackAdClick = async (req, res) => {
    try {
        await AdCampaign.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== MULTER FOR AD IMAGES ====================
const adUploadDir = path.join(__dirname, "..", "uploads", "ads");
if (!fs.existsSync(adUploadDir)) fs.mkdirSync(adUploadDir, { recursive: true });

const adStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, adUploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `ad_${Date.now()}${ext}`);
    },
});
const uploadAdFiles = multer({
    storage: adStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
        else cb(new Error("Only image files allowed"));
    },
}).fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "proofImage", maxCount: 1 },
]);

// ==================== SELLER CONTROLLERS ====================

/**
 * POST /api/ads/
 * Seller creates a new ad campaign draft
 */
const createCampaign = async (req, res) => {
    try {
        const { title, description, adType, targetCategory, targetProduct, budget, durationDays } = req.body;

        if (!title || !budget || !durationDays)
            return res.status(400).json({ message: "Title, budget and duration are required" });

        const campaignData = {
            seller: req.user._id,
            title,
            description,
            adType: adType || "banner",
            targetCategory: targetCategory || "",
            targetProduct: targetProduct || null,
            budget: Number(budget),
            durationDays: Number(durationDays),
            status: "pending_payment",
        };

        if (req.files?.bannerImage?.[0]) {
            campaignData.bannerImage = `/uploads/ads/${req.files.bannerImage[0].filename}`;
        }

        const campaign = new AdCampaign(campaignData);
        await campaign.save();
        res.status(201).json({ message: "Campaign created. Please submit payment to activate.", campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/ads/mine
 * Seller views own campaigns
 */
const getMyCampaigns = async (req, res) => {
    try {
        const campaigns = await AdCampaign.find({ seller: req.user._id }).sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/ads/:id
 * Seller updates a campaign (only if draft/pending_payment)
 */
const updateCampaign = async (req, res) => {
    try {
        const campaign = await AdCampaign.findOne({ _id: req.params.id, seller: req.user._id });
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });
        if (!["draft", "pending_payment"].includes(campaign.status))
            return res.status(400).json({ message: "Cannot edit an active or completed campaign" });

        const { title, description, adType, targetCategory, budget, durationDays } = req.body;
        if (title) campaign.title = title;
        if (description !== undefined) campaign.description = description;
        if (adType) campaign.adType = adType;
        if (targetCategory !== undefined) campaign.targetCategory = targetCategory;
        if (budget) campaign.budget = Number(budget);
        if (durationDays) campaign.durationDays = Number(durationDays);

        if (req.files?.bannerImage?.[0]) {
            campaign.bannerImage = `/uploads/ads/${req.files.bannerImage[0].filename}`;
        }

        await campaign.save();
        res.json({ message: "Campaign updated", campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/ads/:id/payment
 * Seller submits payment proof for a campaign
 */
const payForCampaign = async (req, res) => {
    try {
        const { paymentMethod, referenceNumber } = req.body;
        if (!paymentMethod || !referenceNumber)
            return res.status(400).json({ message: "Payment method and reference number are required" });

        const campaign = await AdCampaign.findOne({ _id: req.params.id, seller: req.user._id });
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });
        if (campaign.status === "active")
            return res.status(400).json({ message: "Campaign is already active" });

        const paymentData = {
            seller: req.user._id,
            campaign: campaign._id,
            amount: campaign.budget,
            paymentMethod,
            referenceNumber,
            status: "pending",
        };

        if (req.files?.proofImage?.[0]) {
            paymentData.proofImage = `/uploads/ads/${req.files.proofImage[0].filename}`;
        }

        const payment = new AdPayment(paymentData);
        await payment.save();

        campaign.status = "pending_approval";
        await campaign.save();

        res.status(201).json({ message: "Payment submitted. Admin will verify and activate your campaign.", payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/ads/my-payments
 * Seller views their ad payment history
 */
const getMyAdPayments = async (req, res) => {
    try {
        const payments = await AdPayment.find({ seller: req.user._id })
            .populate("campaign", "title adType budget status")
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/ads/stats/:id
 * Seller views campaign stats
 */
const getCampaignStats = async (req, res) => {
    try {
        const campaign = await AdCampaign.findOne({ _id: req.params.id, seller: req.user._id });
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        const ctr = campaign.impressions > 0
            ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
            : 0;

        res.json({
            title: campaign.title,
            status: campaign.status,
            impressions: campaign.impressions,
            clicks: campaign.clicks,
            ctr: `${ctr}%`,
            budget: campaign.budget,
            durationDays: campaign.durationDays,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== ADMIN CONTROLLERS ====================

/**
 * GET /api/ads/admin/all
 * Admin views all campaigns (can filter by status)
 */
const getAllCampaigns = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const campaigns = await AdCampaign.find(filter)
            .populate("seller", "name email businessName")
            .sort({ createdAt: -1 });

        // Attach latest payment for each
        const campaignsWithPayments = await Promise.all(
            campaigns.map(async (c) => {
                const payment = await AdPayment.findOne({ campaign: c._id }).sort({ createdAt: -1 });
                return { ...c.toObject(), latestPayment: payment || null };
            })
        );

        res.json(campaignsWithPayments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/ads/admin/payments
 * Admin views all ad payments
 */
const getAllAdPayments = async (req, res) => {
    try {
        const payments = await AdPayment.find()
            .populate("seller", "name email businessName")
            .populate("campaign", "title adType budget")
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/ads/admin/:id/approve
 * Admin approves campaign (after verifying payment)
 */
const approveCampaign = async (req, res) => {
    try {
        const campaign = await AdCampaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + campaign.durationDays);

        campaign.status = "active";
        campaign.startDate = now;
        campaign.endDate = endDate;
        campaign.adminNote = req.body.adminNote || "";
        await campaign.save();

        // Also mark the payment as approved
        await AdPayment.findOneAndUpdate(
            { campaign: campaign._id, status: "pending" },
            { status: "approved", approvedAt: now, approvedBy: req.user._id }
        );

        res.json({ message: "Campaign approved and activated", campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/ads/admin/:id/reject
 * Admin rejects a campaign
 */
const rejectCampaign = async (req, res) => {
    try {
        const { reason } = req.body;
        const campaign = await AdCampaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        campaign.status = "rejected";
        campaign.rejectionReason = reason || "Rejected by admin";
        await campaign.save();

        await AdPayment.findOneAndUpdate(
            { campaign: campaign._id, status: "pending" },
            { status: "rejected", adminNote: reason || "Rejected" }
        );

        res.json({ message: "Campaign rejected", campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/ads/admin/:id/pause
 * Admin pauses an active campaign
 */
const pauseCampaign = async (req, res) => {
    try {
        const campaign = await AdCampaign.findByIdAndUpdate(
            req.params.id,
            { status: "paused" },
            { new: true }
        );
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });
        res.json({ message: "Campaign paused", campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/ads/admin/stats
 * Admin overview of ad campaign stats
 */
const getAdminAdStats = async (req, res) => {
    try {
        const total = await AdCampaign.countDocuments();
        const active = await AdCampaign.countDocuments({ status: "active" });
        const pendingApproval = await AdCampaign.countDocuments({ status: "pending_approval" });
        const totalRevenue = await AdPayment.aggregate([
            { $match: { status: "approved" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        res.json({
            total,
            active,
            pendingApproval,
            adRevenue: totalRevenue[0]?.total || 0,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
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
};
