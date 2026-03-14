const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/product');
const Service = require('./models/Service');

(async () => {
    try {
        await connectDB();
        console.log('DB connected OK');

        const products = await Product.find({}).populate('seller', 'name').lean();
        console.log('Products fetched:', products.length);

        const services = await Service.find({}).lean();
        console.log('Services fetched:', services.length);

        if (services.length > 0) {
            console.log('First service keys:', Object.keys(services[0]));
        }

        // Simulate the analytics logic
        const allProductReviews = [];
        const allServiceReviews = [];
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        products.forEach((p) => {
            (p.reviews || []).forEach((r) => {
                if (r && r.rating) {
                    allProductReviews.push({ ...r, itemName: p.name || 'Unknown', itemId: p._id, type: 'product' });
                    const star = Math.round(r.rating);
                    if (star >= 1 && star <= 5) ratingDistribution[star]++;
                }
            });
        });

        services.forEach((s) => {
            (s.reviews || []).forEach((r) => {
                if (r && r.rating) {
                    allServiceReviews.push({ ...r, itemName: s.title || 'Unknown', itemId: s._id, type: 'service' });
                    const star = Math.round(r.rating);
                    if (star >= 1 && star <= 5) ratingDistribution[star]++;
                }
            });
        });

        console.log('Product reviews:', allProductReviews.length);
        console.log('Service reviews:', allServiceReviews.length);
        console.log('Rating distribution:', ratingDistribution);
        console.log('SUCCESS - Analytics logic works fine');
    } catch (e) {
        console.error('ERROR:', e.message);
        fs.writeFileSync('err.txt', e.stack);
    }
    process.exit(0);
})();
