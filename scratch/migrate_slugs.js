const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./backend/models/postModel');

dotenv.config({ path: './backend/.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for SEO migration...");

        const posts = await Post.find({ slug: { $exists: false } });
        console.log(`Found ${posts.length} posts without slugs.`);

        for (const post of posts) {
            console.log(`Generating slug for: ${post.title}`);
            // Saving will trigger the pre-save hook we added
            await post.save();
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
