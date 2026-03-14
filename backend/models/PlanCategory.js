const mongoose = require("mongoose");

const planTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    image: { type: String }, // Optional image
});

const planCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        image: { type: String }, // Optional category image
        planTypes: [planTypeSchema], // Array of Plan Types (subcategories)
    },
    { timestamps: true }
);

module.exports = mongoose.model("PlanCategory", planCategorySchema);
