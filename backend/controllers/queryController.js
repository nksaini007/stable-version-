const mongoose = require("mongoose");
const User = require("../models/userModel");
const Order = require("../models/Order");

/**
 * POST /api/query/custom
 * Admin executes a read-only MongoDB query
 */
const executeCustomQuery = async (req, res) => {
    try {
        const { collection, filter = {}, projection = {}, sort = { createdAt: -1 }, limit = 50 } = req.body;

        if (!collection) {
            return res.status(400).json({ message: "Collection name is required" });
        }

        // Use the native MongoDB driver through Mongoose connection to do a robust, generic find
        const db = mongoose.connection.db;
        
        // Ensure the collection exists
        const collections = await db.listCollections().toArray();
        const collectionExists = collections.some(col => col.name === collection);
        if (!collectionExists) {
            return res.status(404).json({ message: `Collection '${collection}' not found in database.` });
        }

        const maxLimit = Math.min(Number(limit) || 50, 500); // hard cap at 500

        // Perform read-only explicit find
        const results = await db.collection(collection)
            .find(filter, { projection })
            .sort(sort)
            .limit(maxLimit)
            .toArray();

        res.json({
            count: results.length,
            results
        });
    } catch (error) {
        console.error("Custom Query Error:", error);
        res.status(500).json({ message: error.message || "Error running custom query" });
    }
};

/**
 * GET /api/query/user-growth
 * Get user registrations grouped by month for the last 6 months
 */
const getUserGrowthChart = async (req, res) => {
    try {
        const now = new Date();
        const months = [];
        const values = [];

        // Last 6 months
        for (let i = 5; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const monthName = start.toLocaleString("en-IN", { month: "short" });
            months.push(monthName);

            const count = await User.countDocuments({
                createdAt: { $gte: start, $lte: end },
            });

            values.push(count);
        }

        res.json({ months, values });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/query/order-status
 * Get count of orders aggregated by status
 */
const getOrderStatusChart = async (req, res) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }
        ];
        
        const results = await Order.aggregate(pipeline);
        
        // Format for recharts pie chart
        const formatted = results.map(item => ({
            name: item._id || "Pending",
            value: item.count
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    executeCustomQuery,
    getUserGrowthChart,
    getOrderStatusChart
};
