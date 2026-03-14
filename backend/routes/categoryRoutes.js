// const express = require('express');
// const router = express.Router();
// const {
//   createCategory,
//   getCategories,
//   deleteCategory,
//   addSubcategory,
//   deleteSubcategory,
//   updateCategory,
//   updateSubcategory
// } = require('../controllers/categoryController');

// router.post('/', createCategory);
// router.get('/', getCategories);
// router.put('/:id', updateCategory);
// router.delete('/:id', deleteCategory);

// router.post('/:categoryId/subcategories', addSubcategory);
// router.put('/:categoryId/subcategories/:subId', updateSubcategory);
// router.delete('/:categoryId/subcategories/:subId', deleteSubcategory);

// module.exports = router;
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  createCategory,
  getCategories,
  deleteCategory,
  addSubcategory,
  deleteSubcategory,
  updateCategory,
  updateSubcategory,
} = require("../controllers/categoryController");

// ✅ CATEGORY ROUTES
router.post("/", upload.fields([{ name: "categoryImage", maxCount: 1 }]), createCategory);
router.get("/", getCategories);
router.put("/:id", upload.fields([{ name: "categoryImage", maxCount: 1 }]), updateCategory);
router.delete("/:id", deleteCategory);

// ✅ SUBCATEGORY ROUTES
router.post(
  "/:categoryId/subcategories",
  upload.fields([{ name: "subcategoryImage", maxCount: 1 }]),
  addSubcategory
);
router.put(
  "/:categoryId/subcategories/:subId",
  upload.fields([{ name: "subcategoryImage", maxCount: 1 }]),
  updateSubcategory
);
router.delete("/:categoryId/subcategories/:subId", deleteSubcategory);

module.exports = router;
