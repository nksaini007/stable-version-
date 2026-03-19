const Booking = require("../models/Booking");
const Service = require("../models/Service");

// @desc    Create a new booking (Customer)
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
    try {
        const { serviceId, date, time } = req.body;

        // Verify service exists and get price
        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        const newBooking = new Booking({
            customerId: req.user._id,
            serviceId,
            date,
            time,
            amount: service.price, // Lock in the price at time of booking
            status: "Pending",
            paymentStatus: "Pending"
        });

        await newBooking.save();
        res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Get bookings for logged in customer
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id })
            .populate("providerId", "name profileImage phone")
            .populate("serviceId", "title category price images")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get bookings for logged in provider
// @route   GET /api/bookings/provider-bookings
// @access  Private (Provider)
const getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ providerId: req.user._id })
            .populate("customerId", "name profileImage phone address pincode")
            .populate("serviceId", "title category price images")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update booking status (Provider / Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
    try {
        const { status, providerId } = req.body;
        const allowedStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Customers can only cancel.
        if (req.user.role === "customer" && status !== "Cancelled") {
            return res.status(403).json({ message: "Customers can only cancel bookings" });
        }

        // Provider authorization
        if (req.user.role === "provider" && (!booking.providerId || booking.providerId.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: "Not authorized to update this booking" });
        }

        if (status) {
            booking.status = status;
        }

        // Admin can assign a provider
        if (providerId && req.user.role === "admin") {
            booking.providerId = providerId;
        }

        await booking.save();

        res.json({ message: `Booking updated`, booking });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Admin: get all bookings
// @route   GET /api/bookings
// @access  Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("customerId", "name email phone address pincode")
            .populate("providerId", "name email phone")
            .populate("serviceId", "title category")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getProviderBookings,
    updateBookingStatus,
    getAllBookings
};
