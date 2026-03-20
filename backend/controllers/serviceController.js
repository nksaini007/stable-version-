const Service = require("../models/Service");
const User = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================== MULTER CONFIG ====================
const { storage } = require("../config/cloudinary");

const uploadServiceImages = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
}).array("images", 5);

// ==================== PROVIDER ENDPOINTS ====================

/**
 * GET /api/services/user/my-services
 * @desc Get services that the current provider has selected
 */
const getMyServices = async (req, res) => {
    try {
        console.log("Fetching my services for user:", req.user?._id);
        const user = await User.findById(req.user._id).populate("offeredServices");
        if (!user) {
            console.warn("User not found during getMyServices:", req.user?._id);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`Found ${user.offeredServices?.length || 0} offered services for user:`, req.user._id);
        res.json(user.offeredServices || []);
    } catch (err) {
        console.error("Error in getMyServices:", err);
        res.status(500).json({ error: err.message });
    }
};

const createService = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can create services" });
        }

        const { title, description, category, price, serviceCategoryId, serviceSubCategoryId } = req.body;

        const newService = new Service({
            title,
            description,
            category,
            price: Number(price),
            serviceCategoryId,
            serviceSubCategoryId,
        });

        if (req.files && req.files.length > 0) {
            newService.images = req.files.map(file => file.path);
        }

        await newService.save();
        res.status(201).json({ message: "Service created successfully", service: newService });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Admin only)
const updateService = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can update services" });
        }

        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        const { title, description, category, price, isActive, serviceCategoryId, serviceSubCategoryId } = req.body;

        if (title) service.title = title;
        if (description) service.description = description;
        if (category) service.category = category;
        if (price) service.price = Number(price);
        if (isActive !== undefined) service.isActive = isActive;
        if (serviceCategoryId) service.serviceCategoryId = serviceCategoryId;
        if (serviceSubCategoryId) service.serviceSubCategoryId = serviceSubCategoryId;

        if (req.files && req.files.length > 0) {
            service.images = req.files.map(file => file.path);
        }

        await service.save();
        res.json({ message: "Service updated successfully", service });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
const deleteService = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can delete services" });
        }

        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        await service.deleteOne();
        res.json({ message: "Service deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ==================== PUBLIC ENDPOINTS ====================

const getServices = async (req, res) => {
    try {
        const { category, search, serviceCategoryId, serviceSubCategoryId } = req.query;

        let query = { isActive: true };

        if (serviceCategoryId) query.serviceCategoryId = serviceCategoryId;
        if (serviceSubCategoryId) query.serviceSubCategoryId = serviceSubCategoryId;
        if (category && !serviceCategoryId) query.category = category;
        if (search) query.title = { $regex: search, $options: "i" };

        const services = await Service.find(query).sort({ createdAt: -1 });

        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get a single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== ADMIN ENDPOINTS ====================

// @desc    Admin: get all services (active and inactive)
// @route   GET /api/services/admin/all
// @access  Private (Admin only)
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createService,
    updateService,
    deleteService,
    getServices,
    getServiceById,
    getMyServices,
    getAllServices,
    uploadServiceImages,
};
