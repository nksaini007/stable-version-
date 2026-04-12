const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); // Ensure auth middleware exist
const controller = require('../controllers/architectWorkforceController');

// All endpoints require the user to be authenticated at minimum
router.use(protect);

// --- PARTNERS ---
router.post('/register', controller.registerPartner);
router.get('/partners', controller.getMyPartners);

// --- TASKS ---
router.post('/task', controller.createTask);
router.get('/tasks', controller.getTasks);
router.put('/task/:taskId', controller.updateTaskStatus);

// --- ATTENDANCE ---
router.post('/attendance/checkin', controller.checkIn);
router.post('/attendance/checkout', controller.checkOut);
router.get('/attendance', controller.getAttendance); // Shared endpoint returning either logs for architect or partner

// --- PAYMENTS ---
router.post('/payment', controller.recordPayment);
router.get('/payments', controller.getPayments);

// --- LIVE LOCATION ---
router.post('/location', controller.updateLocation);
router.get('/locations', controller.getPartnerLocations);

// --- DASHBOARD ---
router.get('/stats', controller.getDashboardStats);

module.exports = router;
