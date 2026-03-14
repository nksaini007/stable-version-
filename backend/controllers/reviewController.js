const Product = require("../models/product");
const Service = require("../models/Service");
const User = require("../models/userModel");

// ==============================
// ADD or UPDATE a Product Review
// POST /api/reviews/product/:id
// Protected
// ==============================
const addProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const existingIdx = product.reviews.findIndex(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (existingIdx !== -1) {
            product.reviews[existingIdx].rating = Number(rating);
            product.reviews[existingIdx].comment = comment;
            product.reviews[existingIdx].name = req.user.name;
        } else {
            product.reviews.push({
                user: req.user._id,
                name: req.user.name,
                rating: Number(rating),
                comment,
            });
        }

        product.numOfReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

        await product.save();
        res.json({ message: "Review submitted", product });
    } catch (err) {
        console.error("addProductReview error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ==============================
// ADD or UPDATE a Service Review
// POST /api/reviews/service/:id
// Protected
// ==============================
const addServiceReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        // Ensure reviews array exists
        if (!service.reviews) service.reviews = [];

        const existingIdx = service.reviews.findIndex(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (existingIdx !== -1) {
            service.reviews[existingIdx].rating = Number(rating);
            service.reviews[existingIdx].comment = comment;
            service.reviews[existingIdx].name = req.user.name;
        } else {
            service.reviews.push({
                user: req.user._id,
                name: req.user.name,
                rating: Number(rating),
                comment,
            });
        }

        service.numOfReviews = service.reviews.length;
        service.rating =
            service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length;

        await service.save();
        res.json({ message: "Review submitted", service });
    } catch (err) {
        console.error("addServiceReview error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ==============================
// GET Product Reviews
// ==============================
const getProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select("reviews rating numOfReviews name");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({
            rating: product.rating || 0,
            numOfReviews: product.numOfReviews || 0,
            reviews: product.reviews || [],
            name: product.name,
        });
    } catch (err) {
        console.error("getProductReviews error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ==============================
// GET Service Reviews
// ==============================
const getServiceReviews = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).select("reviews rating numOfReviews title");
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.json({
            rating: service.rating || 0,
            numOfReviews: service.numOfReviews || 0,
            reviews: service.reviews || [],
            name: service.title,
        });
    } catch (err) {
        console.error("getServiceReviews error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ==============================
// DELETE a review (Admin Only)
// ==============================
const deleteReview = async (req, res) => {
    try {
        const { type, itemId, reviewId } = req.params;
        const Model = type === "product" ? Product : Service;

        const item = await Model.findById(itemId);
        if (!item) return res.status(404).json({ message: `${type} not found` });

        item.reviews = (item.reviews || []).filter((r) => r._id.toString() !== reviewId);
        item.numOfReviews = item.reviews.length;
        item.rating = item.reviews.length
            ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
            : 0;

        await item.save();
        res.json({ message: "Review deleted" });
    } catch (err) {
        console.error("deleteReview error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ==============================
// ADMIN ANALYTICS
// GET /api/reviews/analytics
// ==============================
const getAdminAnalytics = async (req, res) => {
    try {
        let products = [];
        let services = [];

        try {
            products = await Product.find({}).populate("seller", "name").lean();
        } catch (e) {
            console.error("Error fetching products for analytics:", e.message);
        }

        try {
            services = await Service.find({}).lean();
        } catch (e) {
            console.error("Error fetching services for analytics:", e.message);
        }

        // Aggregate all reviews
        const allProductReviews = [];
        const allServiceReviews = [];
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        (products || []).forEach((p) => {
            const pReviews = Array.isArray(p.reviews) ? p.reviews : [];
            pReviews.forEach((r) => {
                if (r && r.rating) {
                    allProductReviews.push({ ...r, itemName: p.name || "Unknown", itemId: p._id, type: "product" });
                    const star = Math.round(r.rating);
                    if (star >= 1 && star <= 5) ratingDistribution[star]++;
                }
            });
        });

        (services || []).forEach((s) => {
            const sReviews = Array.isArray(s.reviews) ? s.reviews : [];
            sReviews.forEach((r) => {
                if (r && r.rating) {
                    allServiceReviews.push({ ...r, itemName: s.title || "Unknown", itemId: s._id, type: "service" });
                    const star = Math.round(r.rating);
                    if (star >= 1 && star <= 5) ratingDistribution[star]++;
                }
            });
        });

        const totalReviews = allProductReviews.length + allServiceReviews.length;
        const allReviews = [...allProductReviews, ...allServiceReviews];
        const avgRating = totalReviews > 0
            ? Number((allReviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1))
            : 0;

        // Top rated products
        const topProducts = (products || [])
            .filter((p) => (p.numOfReviews || 0) > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.numOfReviews || 0) - (a.numOfReviews || 0))
            .slice(0, 10)
            .map((p) => ({
                _id: p._id,
                name: p.name || "Unknown",
                rating: (p.rating || 0).toFixed(1),
                numOfReviews: p.numOfReviews || 0,
                price: p.price || 0,
                image: p.images && p.images[0] ? p.images[0].url : null,
                seller: p.seller ? p.seller.name : "—",
                category: p.category || "—",
            }));

        // Top rated services
        const topServices = (services || [])
            .filter((s) => (s.numOfReviews || 0) > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.numOfReviews || 0) - (a.numOfReviews || 0))
            .slice(0, 10)
            .map((s) => ({
                _id: s._id,
                name: s.title || "Unknown",
                rating: (s.rating || 0).toFixed(1),
                numOfReviews: s.numOfReviews || 0,
                price: s.price || 0,
                category: s.category || "—",
            }));

        // Most reviewed
        const allItems = [...(products || []), ...(services || [])];
        const mostReviewed = allItems
            .filter((i) => (i.numOfReviews || 0) > 0)
            .sort((a, b) => (b.numOfReviews || 0) - (a.numOfReviews || 0))
            .slice(0, 10)
            .map((i) => ({
                _id: i._id,
                name: i.name || i.title || "Unknown",
                type: i.name ? "product" : "service",
                numOfReviews: i.numOfReviews || 0,
                rating: (i.rating || 0).toFixed(1),
            }));

        // Recent reviews (last 20)
        const recentReviews = allReviews
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 20);

        // Stats
        const totalProducts = (products || []).length;
        const totalServices = (services || []).length;
        const productsWithReviews = (products || []).filter((p) => (p.numOfReviews || 0) > 0).length;
        const servicesWithReviews = (services || []).filter((s) => (s.numOfReviews || 0) > 0).length;

        res.json({
            totalReviews,
            avgRating,
            ratingDistribution,
            topProducts,
            topServices,
            mostReviewed,
            recentReviews,
            totalProducts,
            totalServices,
            productsWithReviews,
            servicesWithReviews,
        });
    } catch (err) {
        console.error("Analytics error:", err.stack || err);
        res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
    }
};

module.exports = {
    addProductReview,
    addServiceReview,
    getProductReviews,
    getServiceReviews,
    deleteReview,
    getAdminAnalytics,
};
