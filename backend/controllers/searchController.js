const Product = require("../models/product");
const Service = require("../models/Service");
const ConstructionPlan = require("../models/ConstructionPlan");

/**
 * @desc    Get aggregated search suggestions
 * @route   GET /api/search/suggestions
 * @access  Public
 */
const getSuggestions = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        const regex = new RegExp(query, "i");

        // 1. Fetch matches from different collections
        // Using Promise.all for parallel execution
        const [products, services, plans] = await Promise.all([
            Product.find({ name: { $regex: regex }, isActive: true })
                .select("name images")
                .limit(4)
                .lean(),
            Service.find({ title: { $regex: regex }, isActive: true })
                .select("title images")
                .limit(3)
                .lean(),
            ConstructionPlan.find({ name: { $regex: regex } })
                .select("name images")
                .limit(3)
                .lean(),
        ]);

        // 2. Format and combine results
        const suggestions = [
            ...products.map(p => ({
                id: p._id,
                text: p.name,
                image: p.images?.[0]?.url || "",
                type: "product",
            })),
            ...services.map(s => ({
                id: s._id,
                text: s.title,
                image: s.images?.[0] || "",
                type: "service",
            })),
            ...plans.map(pl => ({
                id: pl._id,
                text: pl.name,
                image: pl.images?.[0] || "",
                type: "plan",
            })),
        ];

        // 3. Sort by text relevance (simple starts-with priority)
        suggestions.sort((a, b) => {
            const aStart = a.text.toLowerCase().startsWith(query.toLowerCase());
            const bStart = b.text.toLowerCase().startsWith(query.toLowerCase());
            if (aStart && !bStart) return -1;
            if (!aStart && bStart) return 1;
            return 0;
        });

        res.json(suggestions.slice(0, 10)); // Total 10 suggestions
    } catch (err) {
        console.error("Suggestion Error:", err);
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
};

module.exports = {
    getSuggestions,
};
