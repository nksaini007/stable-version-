const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Switch to Memory Storage so Sharp can process the file buffer before upload
const storage = multer.memoryStorage();

/**
 * Upload an optimized buffer directly to Cloudinary
 * @param {Buffer} buffer - The image buffer processed by Sharp
 * @param {String} folder - Target folder in Cloudinary
 * @param {String} fieldname - Original field name for ID generation
 */
const uploadBufferToCloudinary = (buffer, folder, fieldname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        public_id: fieldname + '_' + Date.now(),
        format: 'webp', // Standardizing on WebP for best performance
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  if (!publicId || publicId === 'local' || publicId === 'external') return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary deletion error:', err);
  }
};

module.exports = { cloudinary, storage, uploadBufferToCloudinary, deleteImage };
