// const mongoose = require('mongoose');

// const subCategorySchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
// });

// const categorySchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true, unique: true },
//   subcategories: [subCategorySchema],
// }, { timestamps: true });

// module.exports = mongoose.model('Category', categorySchema);
const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String }, // ✅ image field
});

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    image: { type: String }, // ✅ category image
    subcategories: [subCategorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
