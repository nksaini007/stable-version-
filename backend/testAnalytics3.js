const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/product');
const Service = require('./models/Service');
const User = require('./models/userModel');

(async () => {
    try {
        await connectDB();
        console.log("DB connected");

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

        const resBody = {
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
        };
        console.log("SUCCESS");
    } catch (err) {
        console.error("Analytics error:", err.stack || err);
        require('fs').writeFileSync('err3.txt', err.stack || err.message);
    }
    process.exit(0);
})();
