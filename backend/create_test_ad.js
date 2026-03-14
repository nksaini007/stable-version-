const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const AdCampaign = require('./models/AdCampaign');
const User = require('./models/userModel');

const createAd = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const seller = await User.findOne({ role: 'seller' });
        if (!seller) {
            console.log("No seller found to create ad for.");
            process.exit(1);
        }

        const ad = new AdCampaign({
            seller: seller._id,
            title: "Massive Summer Sale on Building Materials!",
            description: "Get up to 40% off on premium cement and steel.",
            bannerImage: "https://images.unsplash.com/photo-1541888081600-02306cd11204?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            adType: "banner",
            budget: 5000,
            durationDays: 30,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: "active",
        });

        await ad.save();
        console.log("Test active ad created successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

createAd();
