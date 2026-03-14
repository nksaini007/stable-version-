const WebsiteConfig = require('../models/WebsiteConfig');
const Product = require('../models/Product');

// Helper to ensure we only have one config document
const getSingletonConfig = async () => {
    let config = await WebsiteConfig.findOne();
    if (!config) {
        config = await WebsiteConfig.create({
            banners: [],
            trendingItems: [],
            settings: {}
        });
    }
    return config;
};

// @desc    Get website configuration (Public)
// @route   GET /api/config
// @access  Public
const getPublicConfig = async (req, res) => {
    try {
        const config = await WebsiteConfig.findOne()
            .populate({
                path: 'trendingItems',
                model: 'Product',
                select: 'name description price images category'
            });

        if (!config) {
            return res.status(200).json({ banners: [], trendingItems: [] });
        }

        // Only return active banners
        const activeBanners = config.banners.filter(b => b.isActive);

        res.status(200).json({
            banners: activeBanners,
            trendingItems: config.trendingItems,
            settings: config.settings
        });
    } catch (error) {
        console.error('Error fetching public config:', error);
        res.status(500).json({ message: 'Server error fetching configuration', error: error.message });
    }
};

// @desc    Get raw website configuration (Admin only)
// @route   GET /api/config/admin
// @access  Private/Admin
const getAdminConfig = async (req, res) => {
    try {
        const config = await getSingletonConfig();
        res.status(200).json(config);
    } catch (error) {
        console.error('Error fetching admin config:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update banners array
// @route   PUT /api/config/banners
// @access  Private/Admin
const updateBanners = async (req, res) => {
    try {
        const { banners } = req.body;
        if (!Array.isArray(banners)) {
            return res.status(400).json({ message: 'Banners must be an array' });
        }

        const config = await getSingletonConfig();
        config.banners = banners;
        const updated = await config.save();

        res.status(200).json(updated.banners);
    } catch (error) {
        console.error('Error updating banners:', error);
        res.status(500).json({ message: 'Server error updating banners', error: error.message });
    }
};

// @desc    Update trending items array
// @route   PUT /api/config/trending
// @access  Private/Admin
const updateTrendingItems = async (req, res) => {
    try {
        const { trendingItemIds } = req.body;
        if (!Array.isArray(trendingItemIds)) {
            return res.status(400).json({ message: 'trendingItemIds must be an array' });
        }

        const config = await getSingletonConfig();
        config.trendingItems = trendingItemIds;
        const updated = await config.save();

        res.status(200).json(updated.trendingItems);
    } catch (error) {
        console.error('Error updating trending items:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getPublicConfig,
    getAdminConfig,
    updateBanners,
    updateTrendingItems
};
