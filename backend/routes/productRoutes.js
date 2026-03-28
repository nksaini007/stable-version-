const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getPublicSellerProducts,
  getAdminProducts,
  toggleProductLike,
} = require("../controllers/productController");

const { protect, sellerOnly, adminOnly } = require("../middlewares/authMiddleware");

/* ============================================================
   📦 Multer Setup for Image Upload
============================================================ */
const upload = multer({ storage });

/* ============================================================
   🔓 Public Routes (Anyone can access)
============================================ */

// ✅ Get all products or search
// Example: GET /api/products/public?search=chair
router.get("/public", getProducts);

// ✅ Get public seller products by seller ID
router.get("/shop/:sellerId", getPublicSellerProducts);

/* ============================================================
   🔐 Protected Routes (Require Token)
============================================================ */

// ✅ Get ALL products (Admin Only - Master Data)
router.get("/admin-all", protect, adminOnly, getAdminProducts);

// ✅ Get all products of logged-in seller
router.get("/", protect, getSellerProducts);

// ✅ Get single product by ID (Must be below other exact matches!)
router.get("/:id", getProductById);

const cpUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'arModelFile', maxCount: 1 }
]);

// ✅ Create new product (Seller)
router.post("/", protect, cpUpload, createProduct);

// ✅ Update product (Seller)
router.put("/:id", protect, cpUpload, updateProduct);

// ✅ Toggle like on a product (Any logged-in user)
router.post("/:id/like", protect, toggleProductLike);

// ✅ Delete product (Seller)
router.delete("/:id", protect, deleteProduct);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const { protect, sellerOnly } = require('../middlewares/authMiddleware');
// const {
//   getProducts,           // public search
//   getSellerProducts,     // seller products
//   createProduct,
//   updateProduct,
//   deleteProduct,
//    getProductById
// } = require('../controllers/productController');

// // ------------------------
// // Multer setup for image upload
// // ------------------------
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage });

// // ------------------------
// // Public routes (Customer can search products)
// // ------------------------
// router.get('/public', getProducts);  // GET /api/products/public?search=keyword
// router.get('/:id', getProductById);  // <-- GET product by ID
// // ------------------------
// // Seller routes (Protected)
// // ------------------------
// router.get('/', protect, sellerOnly, getSellerProducts);             
// router.post('/', protect, sellerOnly, upload.single('image'), createProduct);
// router.put('/:id', protect, sellerOnly, upload.single('image'), updateProduct);
// router.delete('/:id', protect, sellerOnly, deleteProduct);

// module.exports = router;
