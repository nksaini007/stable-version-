const express = require('express');
const router = express.Router();
const {
    getPublicConfig,
    getAdminConfig,
    updateBanners,
    updateTrendingItems,
    updateSettings
} = require('../controllers/configController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public route to fetch active banners and trending items
router.get('/', getPublicConfig);

// Admin routes
router.use(protect);
router.use(adminOnly);

router.get('/admin', getAdminConfig);
router.put('/banners', updateBanners);
router.put('/trending', updateTrendingItems);
router.put('/settings', updateSettings);

module.exports = router;
