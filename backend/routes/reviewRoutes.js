const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
    addProductReview,
    addServiceReview,
    getProductReviews,
    getServiceReviews,
    deleteReview,
    getAdminAnalytics,
} = require("../controllers/reviewController");

// Admin — analytics (must be BEFORE parameterized routes)
router.get("/analytics", protect, adminOnly, getAdminAnalytics);

// Public — get reviews
router.get("/product/:id", getProductReviews);
router.get("/service/:id", getServiceReviews);

// Protected — add/update review
router.post("/product/:id", protect, addProductReview);
router.post("/service/:id", protect, addServiceReview);

// Admin — delete
router.delete("/:type/:itemId/:reviewId", protect, adminOnly, deleteReview);

module.exports = router;
