const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const {
    createPlanCategory,
    getPlanCategories,
    updatePlanCategory,
    deletePlanCategory,
    addPlanType,
    updatePlanType,
    deletePlanType,
} = require("../controllers/planCategoryController");

// Public routes
router.get("/", getPlanCategories);

// Admin only routes
router.post("/", protect, adminOnly, upload.single("categoryImage"), createPlanCategory);
router.put("/:id", protect, adminOnly, upload.single("categoryImage"), updatePlanCategory);
router.delete("/:id", protect, adminOnly, deletePlanCategory);

// Plan Type (Subcategory) Routes
router.post("/:categoryId/plan-types", protect, adminOnly, upload.single("subcategoryImage"), addPlanType);
router.put("/:categoryId/plan-types/:typeId", protect, adminOnly, upload.single("subcategoryImage"), updatePlanType);
router.delete("/:categoryId/plan-types/:typeId", protect, adminOnly, deletePlanType);

module.exports = router;
