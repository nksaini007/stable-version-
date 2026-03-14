const PlanCategory = require("../models/PlanCategory");

// @desc    Create a new plan category
// @route   POST /api/plan-categories
// @access  Private/Admin
const createPlanCategory = async (req, res) => {
    try {
        const { name } = req.body;

        let image = "";
        if (req.file) {
            image = `/uploads/categories/${req.file.filename}`;
        } else if (req.body.image) {
            // fallback if passed as string URL
            image = req.body.image;
        }

        const categoryExists = await PlanCategory.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await PlanCategory.create({
            name,
            image
        });

        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Get all plan categories
// @route   GET /api/plan-categories
// @access  Public
const getPlanCategories = async (req, res) => {
    try {
        const categories = await PlanCategory.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, count: categories.length, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Update a plan category
// @route   PUT /api/plan-categories/:id
// @access  Private/Admin
const updatePlanCategory = async (req, res) => {
    try {
        let category = await PlanCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const updateData = { name: req.body.name || category.name };

        if (req.file) {
            updateData.image = `/uploads/categories/${req.file.filename}`;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        category = await PlanCategory.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Delete a plan category
// @route   DELETE /api/plan-categories/:id
// @access  Private/Admin
const deletePlanCategory = async (req, res) => {
    try {
        const category = await PlanCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        await category.deleteOne();

        res.status(200).json({ success: true, message: "Category removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Add a plan type to a category
// @route   POST /api/plan-categories/:categoryId/plan-types
// @access  Private/Admin
const addPlanType = async (req, res) => {
    try {
        const category = await PlanCategory.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const { name } = req.body;
        let image = "";
        if (req.file) {
            image = `/uploads/subcategories/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image;
        }

        category.planTypes.push({ name, image });
        await category.save();

        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Update a plan type in a category
// @route   PUT /api/plan-categories/:categoryId/plan-types/:typeId
// @access  Private/Admin
const updatePlanType = async (req, res) => {
    try {
        const category = await PlanCategory.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const planType = category.planTypes.id(req.params.typeId);
        if (!planType) {
            return res.status(404).json({ success: false, message: "Plan type not found" });
        }

        if (req.body.name) planType.name = req.body.name;
        if (req.file) {
            planType.image = `/uploads/subcategories/${req.file.filename}`;
        } else if (req.body.image) {
            planType.image = req.body.image;
        }

        await category.save();
        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Delete a plan type from a category
// @route   DELETE /api/plan-categories/:categoryId/plan-types/:typeId
// @access  Private/Admin
const deletePlanType = async (req, res) => {
    try {
        const category = await PlanCategory.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        category.planTypes.pull(req.params.typeId);
        await category.save();

        res.status(200).json({ success: true, message: "Plan type removed", category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    createPlanCategory,
    getPlanCategories,
    updatePlanCategory,
    deletePlanCategory,
    addPlanType,
    updatePlanType,
    deletePlanType,
};
