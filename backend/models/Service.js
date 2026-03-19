const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
    },
    { timestamps: true }
);

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    serviceCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
    },
    serviceSubCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    price: {
        type: Number,
        required: true,
    },
    images: [String],
    isActive: {
        type: Boolean,
        default: true,
    },
    // Reviews & Ratings
    rating: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [reviewSchema],
}, { timestamps: true });

// module.exports = mongoose.model("Service", serviceSchema);
const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
module.exports = Service;
