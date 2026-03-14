// One-time script to add sample location data to existing users for map testing
// This assigns random Indian city coordinates to users who don't have location set

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/userModel");

const indianCities = [
    { city: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { city: "Delhi", lat: 28.7041, lng: 77.1025 },
    { city: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { city: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { city: "Chennai", lat: 13.0827, lng: 80.2707 },
    { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { city: "Pune", lat: 18.5204, lng: 73.8567 },
    { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { city: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { city: "Chandigarh", lat: 30.7333, lng: 76.7794 },
    { city: "Bhopal", lat: 23.2599, lng: 77.4126 },
    { city: "Indore", lat: 22.7196, lng: 75.8577 },
    { city: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { city: "Patna", lat: 25.6093, lng: 85.1376 },
    { city: "Surat", lat: 21.1702, lng: 72.8311 },
    { city: "Kochi", lat: 9.9312, lng: 76.2673 },
    { city: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { city: "Guwahati", lat: 26.1445, lng: 91.7362 },
    { city: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
];

const seedLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({ $or: [{ "location.lat": null }, { "location.lat": { $exists: false } }] });
        console.log(`Found ${users.length} users without location data`);

        let updated = 0;
        for (const user of users) {
            // Add slight randomness so pins don't overlap
            const city = indianCities[updated % indianCities.length];
            const jitter = () => (Math.random() - 0.5) * 0.2; // ~10km offset

            user.location = {
                lat: city.lat + jitter(),
                lng: city.lng + jitter(),
                city: city.city,
            };
            await user.save();
            console.log(`  Set ${user.name} (${user.role}) -> ${city.city}`);
            updated++;
        }

        console.log(`\nDone! Updated ${updated} users with location data.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

seedLocations();
