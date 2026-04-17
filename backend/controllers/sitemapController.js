const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const Post = require('../models/postModel');
const Product = require('../models/product');

/**
 * Generate sitemap.xml dynamically
 */
const generateSitemap = async (req, res) => {
    try {
        const hostname = process.env.FRONTEND_URL || 'https://stinchar.com';
        
        const links = [
            { url: '/', changefreq: 'daily', priority: 1.0 },
            { url: '/community', changefreq: 'daily', priority: 0.8 },
            { url: '/services', changefreq: 'weekly', priority: 0.7 },
            { url: '/project-categories', changefreq: 'monthly', priority: 0.7 },
            { url: '/contact', changefreq: 'monthly', priority: 0.3 },
        ];

        // 1. Fetch all Community Posts
        const posts = await Post.find({}).select('slug createdAt');
        posts.forEach(post => {
            links.push({
                url: `/community/post/${post.slug || post._id}`,
                changefreq: 'weekly',
                priority: 0.6,
                lastmod: post.createdAt
            });
        });

        // 2. Fetch all Products
        const products = await Product.find({}).select('_id updatedAt');
        products.forEach(product => {
            links.push({
                url: `/product/${product._id}`,
                changefreq: 'weekly',
                priority: 0.6,
                lastmod: product.updatedAt
            });
        });

        // Create stream
        const stream = new SitemapStream({ hostname });
        
        res.header('Content-Type', 'application/xml');
        
        const data = await streamToPromise(Readable.from(links).pipe(stream));
        res.send(data.toString());

    } catch (error) {
        console.error("Sitemap Error:", error);
        res.status(500).json({ message: "Error generating sitemap" });
    }
};

module.exports = { generateSitemap };
