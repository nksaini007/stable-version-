const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  createServiceCategory,
  getServiceCategories,
  deleteServiceCategory,
  addServiceSubcategory,
  deleteServiceSubcategory,
  updateServiceCategory,
  updateServiceSubcategory,
} = require("../controllers/serviceCategoryController");

// ✅ CATEGORY ROUTES
router.post("/", protect, adminOnly, upload.fields([{ name: "categoryImage", maxCount: 1 }]), createServiceCategory);
router.get("/", getServiceCategories);
router.put("/:id", protect, adminOnly, upload.fields([{ name: "categoryImage", maxCount: 1 }]), updateServiceCategory);
router.delete("/:id", protect, adminOnly, deleteServiceCategory);

// ✅ SUBCATEGORY ROUTES
router.post(
  "/:categoryId/subcategories",
  protect,
  adminOnly,
  upload.fields([{ name: "subcategoryImage", maxCount: 1 }]),
  addServiceSubcategory
);
router.put(
  "/:categoryId/subcategories/:subId",
  protect,
  adminOnly,
  upload.fields([{ name: "subcategoryImage", maxCount: 1 }]),
  updateServiceSubcategory
);
router.delete("/:categoryId/subcategories/:subId", protect, adminOnly, deleteServiceSubcategory);

module.exports = router;
