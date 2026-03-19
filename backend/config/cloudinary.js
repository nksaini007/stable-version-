const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'stinchar'; // Root folder
    const baseUrl = req.baseUrl || '';

    // Categorize by route
    if (baseUrl.includes('categories')) folder = 'stinchar/categories';
    else if (baseUrl.includes('products')) folder = 'stinchar/products';
    else if (baseUrl.includes('users')) folder = 'stinchar/profiles';
    else if (baseUrl.includes('ads')) folder = 'stinchar/ads';
    else if (baseUrl.includes('construction')) folder = 'stinchar/construction';
    else if (baseUrl.includes('posts')) folder = 'stinchar/posts';
    else if (baseUrl.includes('architect-works')) folder = 'stinchar/architects';
    else if (baseUrl.includes('services')) folder = 'stinchar/services';
    
    // Categorize by fieldname if needed (overrides or additions)
    if (file.fieldname === 'categoryImage') folder = 'stinchar/categories';
    if (file.fieldname === 'subcategoryImage') folder = 'stinchar/subcategories';
    if (file.fieldname === 'profileImage') folder = 'stinchar/profiles';
    if (file.fieldname === 'shopBanner') folder = 'stinchar/banners';
    if (file.fieldname === 'postImage') folder = 'stinchar/posts';
    if (file.fieldname === 'blueprint') folder = 'stinchar/construction/blueprints';

    return {
      folder: folder,
      resource_type: 'auto', // Support for images/pdfs
      public_id: file.fieldname + '_' + Date.now(),
    };
  },
});

const deleteImage = async (publicId) => {
  if (!publicId || publicId === 'local' || publicId === 'external') return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary deletion error:', err);
  }
};

module.exports = { cloudinary, storage, deleteImage };
