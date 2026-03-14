// One-time script to fix plan type image paths in the database
// The upload middleware saves to uploads/subcategories/ but the controller
// was incorrectly storing paths as /uploads/categories/
// This script fixes all existing records.

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const PlanCategory = require("./models/PlanCategory");

const fixPlanTypeImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const categories = await PlanCategory.find({});
        let fixedCount = 0;

        for (const category of categories) {
            let modified = false;
            for (const planType of category.planTypes) {
                if (planType.image && planType.image.includes("/uploads/categories/subcategoryImage_")) {
                    const oldPath = planType.image;
                    planType.image = planType.image.replace("/uploads/categories/", "/uploads/subcategories/");
                    console.log(`Fixed: ${oldPath} -> ${planType.image}`);
                    modified = true;
                    fixedCount++;
                }
            }
            if (modified) {
                await category.save();
            }
        }

        console.log(`\nDone! Fixed ${fixedCount} plan type image paths.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixPlanTypeImages();
