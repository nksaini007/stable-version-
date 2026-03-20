const mongoose = require("mongoose");
const DeliveryPricing = require("./backend/models/DeliveryPricing");
const { calculateDeliveryCharge } = require("./backend/controllers/deliveryPricingController");
require("dotenv").config();

async function test() {
    try {
        console.log("Connect to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const req = {
            body: {
                pincode: "110001", // Delhi
                weightKg: 50,
                itemsPrice: 5000,
                estimatedKm: 20
            }
        };

        const res = {
            status: function(s) { this.statusCode = s; return this; },
            json: function(data) { 
                console.log("Response Status:", this.statusCode || 200);
                console.log("Response Data:", JSON.stringify(data, null, 2));
            }
        };

        console.log("\n--- Testing Delivery Calculation ---");
        await calculateDeliveryCharge(req, res);

        mongoose.connection.close();
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
