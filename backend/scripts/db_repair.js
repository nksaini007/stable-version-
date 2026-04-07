/**
 * DATABASE REPAIR UTILITY
 * Purpose: Replaces local 'localhost' URLs with production URLs in the database.
 * Run via: node backend/scripts/db_repair.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;
const PRODUCTION_URL = "https://stable-version-backend.onrender.com";
const LOCAL_URL = "http://localhost:5000";

if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI not found in .env");
    process.exit(1);
}

// Import Models
const Product = require("../models/product");
const User = require("../models/userModel");

async function repair() {
    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected Successfully.");

        console.log(`\n🔎 Searching for local URLs (${LOCAL_URL}) to replace with ${PRODUCTION_URL}...\n`);

        // 1. REPAIR PRODUCTS
        const products = await Product.find({
            $or: [
                { "images.url": { $regex: LOCAL_URL } },
                { "arModelUrl": { $regex: LOCAL_URL } }
            ]
        });

        console.log(`📦 Found ${products.length} products with local URLs.`);
        
        for (let product of products) {
            let updated = false;
            
            // Update images
            product.images = product.images.map(img => {
                if (img.url.includes(LOCAL_URL)) {
                    img.url = img.url.replace(LOCAL_URL, PRODUCTION_URL);
                    updated = true;
                }
                return img;
            });

            // Update AR Model
            if (product.arModelUrl && product.arModelUrl.includes(LOCAL_URL)) {
                product.arModelUrl = product.arModelUrl.replace(LOCAL_URL, PRODUCTION_URL);
                updated = true;
            }

            if (updated) {
                await product.save();
                console.log(`   ✅ Repaired Product: ${product.name}`);
            }
        }

        // 2. REPAIR USER PROFILES
        const users = await User.find({
            $or: [
                { "profileImage": { $regex: LOCAL_URL } },
                { "shopBanner": { $regex: LOCAL_URL } }
            ]
        });

        console.log(`\n👤 Found ${users.length} users with local URLs.`);

        for (let user of users) {
            let updated = false;
            
            if (user.profileImage && user.profileImage.includes(LOCAL_URL)) {
                user.profileImage = user.profileImage.replace(LOCAL_URL, PRODUCTION_URL);
                updated = true;
            }
            if (user.shopBanner && user.shopBanner.includes(LOCAL_URL)) {
                user.shopBanner = user.shopBanner.replace(LOCAL_URL, PRODUCTION_URL);
                updated = true;
            }

            if (updated) {
                await user.save();
                console.log(`   ✅ Repaired User: ${user.name} (${user.email})`);
            }
        }

        console.log("\n✨ Database Repair Completed Successfully.");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ Repair Failed:", error);
        process.exit(1);
    }
}

repair();
