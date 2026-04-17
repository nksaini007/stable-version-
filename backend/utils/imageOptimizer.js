const sharp = require('sharp');

/**
 * Optimizes an image buffer using Sharp
 * - Resizes to max width of 1200px (preserving aspect ratio)
 * - Converts to WebP format
 * - Compresses with 80% quality
 * @param {Buffer} buffer - Original image buffer from Multer
 * @returns {Buffer} - Optimized image buffer
 */
const optimizeImage = async (buffer) => {
    try {
        const optimizedBuffer = await sharp(buffer)
            .resize({
                width: 1200,
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality: 80 })
            .toBuffer();
        
        return optimizedBuffer;
    } catch (error) {
        console.error('Error optimizing image with Sharp:', error);
        // Fallback to original buffer if optimization fails
        return buffer;
    }
};

module.exports = { optimizeImage };
