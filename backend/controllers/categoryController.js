// const Category = require('../models/Category');

// // Create new Category
// exports.createCategory = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Category name required" });

//     const categoryExists = await Category.findOne({ name }); // ✅ works
//     if (categoryExists) return res.status(400).json({ message: "Category already exists" });

//     const category = await Category.create({ name });
//     res.status(201).json(category);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// // Update Category
// exports.updateCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Category name required" });

//     const category = await Category.findById(id);
//     if (!category) return res.status(404).json({ message: "Category not found" });

//     category.name = name;
//     await category.save();
//     res.status(200).json(category);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Delete Category
// exports.deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Category.findByIdAndDelete(id);
//     res.status(200).json({ message: "Category deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get all categories with subcategories
// exports.getCategories = async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.status(200).json(categories);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Add Subcategory
// exports.addSubcategory = async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Subcategory name required" });

//     const category = await Category.findById(categoryId);
//     if (!category) return res.status(404).json({ message: "Category not found" });

//     category.subcategories.push({ name });
//     await category.save();
//     res.status(201).json(category);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Update Subcategory
// exports.updateSubcategory = async (req, res) => {
//   try {
//     const { categoryId, subId } = req.params;
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Subcategory name required" });

//     const category = await Category.findById(categoryId);
//     if (!category) return res.status(404).json({ message: "Category not found" });

//     const sub = category.subcategories.id(subId);
//     if (!sub) return res.status(404).json({ message: "Subcategory not found" });

//     sub.name = name;
//     await category.save();
//     res.status(200).json(category);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Delete Subcategory
// exports.deleteSubcategory = async (req, res) => {
//   try {
//     const { categoryId, subId } = req.params;
//     const category = await Category.findById(categoryId);
//     if (!category) return res.status(404).json({ message: "Category not found" });

//     category.subcategories = category.subcategories.filter(sub => sub._id.toString() !== subId);
//     await category.save();
//     res.status(200).json(category);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const Category = require("../models/Category");

// CREATE CATEGORY (with image)
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.files?.categoryImage
      ? `/uploads/categories/${req.files.categoryImage[0].filename}`
      : null;

    if (!name) return res.status(400).json({ message: "Category name required" });

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name, image });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CATEGORY (name + image)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.files?.categoryImage
      ? `/uploads/categories/${req.files.categoryImage[0].filename}`
      : undefined;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (name) category.name = name;
    if (image) category.image = image;

    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD SUBCATEGORY (with image)
exports.addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const image = req.files?.subcategoryImage
      ? `/uploads/subcategories/${req.files.subcategoryImage[0].filename}`
      : null;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.subcategories.push({ name, image });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE SUBCATEGORY
exports.updateSubcategory = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;
    const { name } = req.body;
    const image = req.files?.subcategoryImage
      ? `/uploads/subcategories/${req.files.subcategoryImage[0].filename}`
      : undefined;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const sub = category.subcategories.id(subId);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    if (name) sub.name = name;
    if (image) sub.image = image;

    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE SUBCATEGORY
exports.deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.subcategories = category.subcategories.filter(
      (sub) => sub._id.toString() !== subId
    );
    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
