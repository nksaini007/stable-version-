const ConstructionPlan = require("../models/ConstructionPlan");

// @desc    Create a new construction plan (catalog item)
// @route   POST /api/construction-plans
// @access  Private/Admin
const createPlan = async (req, res) => {
    try {
        const { title, category, planType, description, estimatedCost, area, features } = req.body;

        // Process uploaded images
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map((file) => `/uploads/plans/${file.filename}`);
        }

        const newPlan = new ConstructionPlan({
            title,
            category,
            planType,
            description,
            estimatedCost,
            area,
            features: JSON.parse(features), // Features should be sent as JSON string
            images: imageUrls,
            adminId: req.user._id // Assuming admin is logged in
        });

        const savedPlan = await newPlan.save();
        res.status(201).json({ success: true, plan: savedPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating plan", error: error.message });
    }
};

// @desc    Get all construction plans (public/customer catalog)
// @route   GET /api/construction-plans
// @access  Public
const getAllPlans = async (req, res) => {
    try {
        const plans = await ConstructionPlan.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: plans.length, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching plans", error: error.message });
    }
};

// @desc    Get single plan by ID
// @route   GET /api/construction-plans/:id
// @access  Public
const getPlanById = async (req, res) => {
    try {
        const plan = await ConstructionPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching plan details", error: error.message });
    }
};

// @desc    Update a plan
// @route   PUT /api/construction-plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.features) {
            updateData.features = JSON.parse(updateData.features);
        }

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map((file) => `/uploads/plans/${file.filename}`);
        }

        const updatedPlan = await ConstructionPlan.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, plan: updatedPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating plan", error: error.message });
    }
};

// @desc    Delete a plan
// @route   DELETE /api/construction-plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
    try {
        const plan = await ConstructionPlan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting plan", error: error.message });
    }
};

module.exports = {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan
};
