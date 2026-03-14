/**
 * 🔐 Admin Account Creator
 * Run once: node createAdmin.js
 * Then delete this file for security!
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/userModel");

const ADMIN = {
    name: "Super Admin",
    email: "admin@stinchar.com",   // ← change this
    password: "Admin@1234",        // ← change this to a strong password
    role: "admin",
    isApproved: true,
    isActive: true,
};

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const exists = await User.findOne({ email: ADMIN.email });
        if (exists) {
            console.log(`⚠️  User with email "${ADMIN.email}" already exists (role: ${exists.role})`);
            if (exists.role !== "admin") {
                exists.role = "admin";
                exists.isApproved = true;
                await exists.save();
                console.log("✅ Updated existing user to admin role");
            } else {
                console.log("ℹ️  Already an admin. No changes made.");
            }
            process.exit(0);
        }

        const hashed = await bcrypt.hash(ADMIN.password, 10);
        const admin = new User({ ...ADMIN, password: hashed });
        await admin.save();

        console.log("✅ Admin account created successfully!");
        console.log(`   Email: ${ADMIN.email}`);
        console.log(`   Password: ${ADMIN.password}`);
        console.log("\n🔐 Login at: http://localhost:5173/portal-x9k2");
        console.log(`   Master Key: ${process.env.ADMIN_MASTER_KEY}`);
        console.log("\n⚠️  DELETE this file after use for security!\n");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

createAdmin();
