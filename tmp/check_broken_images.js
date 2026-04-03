const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const Product = require("../backend/models/product");

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({ "images.url": /image_1773934830310/ });
        console.log("Found products with missing image:", products.length);
        products.forEach(p => console.log(`- ${p.name} (ID: ${p._id})`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProducts();
