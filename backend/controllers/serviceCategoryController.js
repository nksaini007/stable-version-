const ServiceCategory = require("../models/ServiceCategory");

// CREATE CATEGORY (with image)
exports.createServiceCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.files?.categoryImage?.[0]
      ? req.files.categoryImage[0].path
      : null;

    if (!name) return res.status(400).json({ message: "Category name required" });

    const categoryExists = await ServiceCategory.findOne({ name });
    if (categoryExists) return res.status(400).json({ message: "Category already exists" });

    const category = await ServiceCategory.create({ name, image });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL CATEGORIES
exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CATEGORY (name + image)
exports.updateServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.files?.categoryImage?.[0]
      ? req.files.categoryImage[0].path
      : undefined;

    const category = await ServiceCategory.findById(id);
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
exports.deleteServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await ServiceCategory.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD SUBCATEGORY (with image)
exports.addServiceSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const image = req.files?.subcategoryImage?.[0]
      ? req.files.subcategoryImage[0].path
      : null;

    const category = await ServiceCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.subcategories.push({ name, image });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE SUBCATEGORY
exports.updateServiceSubcategory = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;
    const { name } = req.body;
    const image = req.files?.subcategoryImage?.[0]
      ? req.files.subcategoryImage[0].path
      : undefined;

    const category = await ServiceCategory.findById(categoryId);
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
exports.deleteServiceSubcategory = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;
    const category = await ServiceCategory.findById(categoryId);
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
