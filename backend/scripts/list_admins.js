const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/userModel');

const listAdmins = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const admins = await User.find({ role: 'admin' }).select('name email');
        if (admins.length === 0) {
            console.log('No admin users found.');
        } else {
            console.log('Admin users:');
            admins.forEach(admin => {
                console.log(`- Name: ${admin.name}, Email: ${admin.email}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

listAdmins();
