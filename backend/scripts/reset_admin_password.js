const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/userModel');

const resetPassword = async (email, newPassword) => {
    try {
        if (!email || !newPassword) {
            console.error('Usage: node reset_admin_password.js <email> <newPassword>');
            process.exit(1);
        }

        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            console.error(`Admin user with email ${email} not found.`);
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log(`Resetting password for ${user.name} (${email})...`);
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedPassword;
        await user.save();

        console.log('✅ Password reset successfully!');
        console.log(`Email: ${email}`);
        console.log(`New Password: ${newPassword}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

const email = process.argv[2] || 'ndmark007@gmail.com';
const newPassword = process.argv[3] || 'Admin@123';

resetPassword(email, newPassword);
