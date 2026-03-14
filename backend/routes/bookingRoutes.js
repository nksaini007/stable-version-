const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
    createBooking,
    getMyBookings,
    getProviderBookings,
    updateBookingStatus,
    getAllBookings
} = require("../controllers/bookingController");

// Customer routes
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);

// Provider routes
router.get("/provider-bookings", protect, getProviderBookings);

// Shared / Specific Booking interactions
router.put("/:id/status", protect, updateBookingStatus);

// Admin routes
router.get("/", protect, adminOnly, getAllBookings);

module.exports = router;
