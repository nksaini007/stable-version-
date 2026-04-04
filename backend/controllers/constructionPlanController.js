const ConstructionPlan = require("../models/ConstructionPlan");

// @desc    Create a new construction plan (catalog item)
// @route   POST /api/construction-plans
// @access  Private/Admin
const createPlan = async (req, res) => {
    try {
        const { 
            title, category, subCategory, planType, 
            description, estimatedCost, area, 
            features, facilities, subConstructions, 
            linkedProducts, architectId 
        } = req.body;

        // Process uploaded images
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map((file) => file.path);
        }

        const newPlan = new ConstructionPlan({
            title,
            category,
            subCategory,
            planType,
            description,
            estimatedCost: Number(estimatedCost),
            area,
            features: typeof features === 'string' ? JSON.parse(features) : features,
            facilities: typeof facilities === 'string' ? JSON.parse(facilities) : facilities,
            subConstructions: typeof subConstructions === 'string' ? JSON.parse(subConstructions) : subConstructions,
            linkedProducts: typeof linkedProducts === 'string' ? JSON.parse(linkedProducts) : linkedProducts,
            architectId,
            images: imageUrls,
            adminId: req.user._id
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
        const { category, subCategory } = req.query;
        let query = { isActive: true };
        
        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;

        const plans = await ConstructionPlan.find(query)
            .populate("architectId", "name profileImage bio")
            .sort({ createdAt: -1 });
            
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
        const plan = await ConstructionPlan.findById(req.params.id)
            .populate("architectId", "name profileImage bio skills")
            .populate({
                path: "linkedProducts",
                select: "name price images description",
                populate: { path: "seller", select: "businessName" }
            });

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
        
        // Parse JSON strings if they come from form-data
        const jsonFields = ['features', 'facilities', 'subConstructions', 'linkedProducts'];
        jsonFields.forEach(field => {
            if (updateData[field] && typeof updateData[field] === 'string') {
                updateData[field] = JSON.parse(updateData[field]);
            }
        });

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file) => file.path);
            // Append or replace? Let's replace for simplicity or handle specifically if needed
            updateData.images = newImages; 
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
