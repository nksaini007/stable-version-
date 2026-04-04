const Product = require('../models/product');
const User = require('../models/userModel');
const { deleteImage } = require('../config/cloudinary');

// ==============================
// PUBLIC: Get all products or search
// GET /api/products/public?search=keyword
// ==============================
const getProducts = async (req, res) => {
  const { search = '', category, subcategory, type } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // 1. Get all active sellers first to filter products efficiently
    const activeSellers = await User.find({ role: 'seller', isActive: true }).select('_id');
    const activeSellerIds = activeSellers.map(s => s._id);

    // Build filter object
    const filter = {
      seller: { $in: activeSellerIds },
      isActive: true // Also ensure the product itself is active
    };

    // Search logic (name or description)
    if (search) {
      filter.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ]
        }
      ];
    }

    // Explicit filters
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (subcategory) filter.subcategory = { $regex: subcategory, $options: 'i' };
    if (type) filter.type = { $regex: type, $options: 'i' };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('seller', 'name businessName isActive')
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ==============================
// GET Admin Products
// GET /api/products/admin-all
// Protected (Admin only)
// ==============================
const getAdminProducts = async (req, res) => {
  try {
    console.log("admin products hit");
    const products = await Product.find({}).populate('seller', 'name email role');
    console.log("products found: ", products.length);
    res.json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error.stack || error.message);
    res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
  }
};

// ==============================
// GET Seller Products / Search
// GET /api/products
// Protected
// ==============================
const getSellerProducts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const sellerId = req.user._id;

    const products = await Product.find({
      seller: sellerId,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ],
    }).populate('seller', 'name email');

    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ==============================
// CREATE Product
// POST /api/products
// Protected
// ==============================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      type,
      stock,
      brand,
      material,
      color,
      dimensions,
      weight,
      warranty,
      origin,
      features,
      care_instructions,
      imageLink, // New field for external URL
      pricingTiers, // JSON string or object
      recommendations, // array of IDs
      variants,
      arModelUrl,
      arModelScale,
      arModelRotation,
      deliverySettings,
    } = req.body;

    const uploadedImages = [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      req.files.images.forEach(file => {
        uploadedImages.push({
          public_id: file.filename,
          url: file.path
        });
      });
    } else if (imageLink) {
      uploadedImages.push({
        public_id: 'external',
        url: imageLink
      });
    }

    let finalArModelUrl = arModelUrl;
    if (req.files && req.files.arModelFile) {
      finalArModelUrl = req.files.arModelFile[0].path;
    }

    // Convert features from text → array if needed
    const featuresArray =
      typeof features === 'string'
        ? features.split(',').map((f) => f.trim())
        : features;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      subcategory,
      type,
      brand,
      material,
      color,
      dimensions,
      weight,
      warranty,
      origin,
      features: featuresArray,
      care_instructions,
      stock,
      images: uploadedImages,
      variants: typeof variants === 'string' ? JSON.parse(variants) : variants,
      seller: req.user._id,
      pricingTiers: typeof pricingTiers === 'string' ? JSON.parse(pricingTiers) : pricingTiers,
      recommendations: typeof recommendations === 'string' ? JSON.parse(recommendations) : recommendations,
      arModelUrl: finalArModelUrl,
      arModelScale,
      arModelRotation,
      deliverySettings: typeof deliverySettings === 'string' ? JSON.parse(deliverySettings) : deliverySettings,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
};

// ==============================
// UPDATE Product
// PUT /api/products/:id
// Protected
// ==============================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.files && req.files.arModelFile) {
      updates.arModelUrl = req.files.arModelFile[0].path;
    }

    // Admin override: Admin can update any product, seller can only update their own
    const query = req.user.role === 'admin' ? { _id: id } : { _id: id, seller: req.user._id };
    const product = await Product.findOne(query);

    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

    Object.keys(updates).forEach((key) => {
      if (key === 'features' && typeof updates[key] === 'string') {
        product[key] = updates[key].split(',').map((f) => f.trim());
      } else if (key === 'pricingTiers' || key === 'recommendations' || key === 'variants' || key === 'deliverySettings') {
        product[key] = typeof updates[key] === 'string' ? JSON.parse(updates[key]) : updates[key];
      } else if (key !== 'imageLink') { // Don't directly map imageLink to product
        product[key] = updates[key] !== undefined ? updates[key] : product[key];
      }
    });

    let hasNewImages = req.files && req.files.images && req.files.images.length > 0;

    if (hasNewImages || updates.imageLink) {
      // Delete old image from Cloudinary if it exists
      if (product.images && product.images.length > 0) {
        await Promise.all(product.images.map(img => deleteImage(img.public_id)));
      }

      if (hasNewImages) {
        product.images = req.files.images.map(img => ({
          public_id: img.filename,
          url: img.path
        }));
      } else if (updates.imageLink) {
        product.images = [{
          public_id: 'external',
          url: updates.imageLink
        }];
      }
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
};

// ==============================
// DELETE Product
// DELETE /api/products/:id
// Protected
// ==============================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Admin override: Admin can delete any product
    const query = req.user.role === 'admin' ? { _id: id } : { _id: id, seller: req.user._id };
    const product = await Product.findOne(query);

    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

    // Delete associated images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(product.images.map(img => deleteImage(img.public_id)));
    }

    await Product.findByIdAndDelete(product._id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(400).json({ message: 'Error deleting product', error: error.message });
  }
};

// ==============================
// GET Product by ID (for product details page)
// GET /api/products/:id
// ==============================
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).populate('seller', 'name businessName isActive role');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if seller is active (Allow admin and the seller themselves to see)
    const isSeller = req.user && req.user._id && String(product.seller._id) === String(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin && !isSeller && (!product.seller || !product.seller.isActive)) {
      return res.status(403).json({ message: 'This shop is currently inactive.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/products/shop/:sellerId — Get active products for a public Seller Shop Page
 */
const getPublicSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId);

    // Allow admin to bypass
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin && (!seller || !seller.isActive)) {
      return res.status(403).json({ message: "This shop is currently inactive." });
    }

    const products = await Product.find({ seller: sellerId, isActive: true });

    res.json(products);
  } catch (err) {
    console.error("Error fetching public seller products:", err);
    res.status(500).json({ error: "Server error fetching shop products" });
  }
};

/**
 * POST /api/products/:id/like — Toggle like on a product
 */
const toggleProductLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const userId = req.user._id;
    const alreadyLiked = product.likes.includes(userId);

    if (alreadyLiked) {
      product.likes = product.likes.filter(id => id.toString() !== userId.toString());
    } else {
      product.likes.push(userId);
    }

    product.likesCount = product.likes.length;
    await product.save();

    res.json({
      liked: !alreadyLiked,
      likesCount: product.likesCount,
    });
  } catch (err) {
    console.error("Like toggle error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/products/bulk-update
 * Bulk update stock or price for multiple products
 */
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, update } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: "Invalid product IDs" });
    }

    const allowedUpdates = {};
    if (update.stock !== undefined) allowedUpdates.stock = update.stock;
    if (update.price !== undefined) allowedUpdates.price = update.price;

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ message: "No valid update fields provided" });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds }, seller: req.user._id },
      { $set: allowedUpdates }
    );

    res.json({ message: "Bulk update successful", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/products/shop/:sellerId/visit
 * Increment shop visitor count
 */
const fs = require('fs');
const csv = require('csv-parser');
const Category = require('../models/Category');

/**
 * POST /api/products/bulk-upload
 * Bulk products upload via CSV
 */
const bulkUploadProducts = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No CSV file uploaded" });

  try {
    // 1. Load categories for strict validation
    const categoriesDB = await Category.find({});
    const catMap = {};
    categoriesDB.forEach(c => {
      catMap[c.name.trim().toLowerCase()] = (c.subcategories || []).map(s => s.name.trim().toLowerCase());
    });

    const results = [];
    const errors = [];
    let rowCount = 0;

    // Use a promise to handle stream end
    const processStream = new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          const rowErrors = [];
          
          // Basic fields validation
          if (!row.name?.trim()) rowErrors.push("Product Name is missing");
          if (!row.price || isNaN(row.price)) rowErrors.push("Valid Price is missing");
          
          // Category strict validation
          const catNameInput = row.category?.trim();
          const subNameInput = row.subcategory?.trim();
          const catKey = catNameInput?.toLowerCase();
          const subKey = subNameInput?.toLowerCase();

          if (!catKey || !catMap[catKey]) {
            rowErrors.push(`Category '${catNameInput || 'Empty'}' does not exist in database`);
          } else if (subKey && !catMap[catKey].includes(subKey)) {
            rowErrors.push(`Subcategory '${subNameInput}' not found under category '${catNameInput}'`);
          }

          if (rowErrors.length > 0) {
            errors.push({ row: rowCount, productName: row.name || `Row ${rowCount}`, messages: rowErrors });
          } else {
            // Success: Map all 27+ detailed fields
            const imageUrls = row.imageUrls 
              ? row.imageUrls.split(',').filter(u => u.trim()).map(url => ({ public_id: 'external', url: url.trim() })).slice(0, 10) 
              : [];
            
            results.push({
              name: row.name.trim(),
              description: row.description || "",
              price: Number(row.price),
              stock: Number(row.stock || 0),
              category: catNameInput,
              subcategory: subNameInput || "",
              type: row.type || "",
              brand: row.brand || "",
              material: row.material || "",
              color: row.color || "",
              dimensions: row.dimensions || "",
              weight: row.weight || "",
              origin: row.origin || "",
              warranty: row.warranty || "",
              arModelUrl: row.arModelUrl || "",
              arModelScale: row.arModelScale || "1 1 1",
              arModelRotation: row.arModelRotation || "0deg 0deg 0deg",
              pricingTiers: {
                architect: row.architectPrice || "",
                stinchar: row.partnerPrice || "",
                normal: row.memberPrice || ""
              },
              deliverySettings: {
                isFragile: ['true', '1', 'yes'].includes(row.isFragile?.toLowerCase()),
                handlingInstructions: row.handlingInstructions || "",
                packageWeight: row.packageWeight || "",
                packageDimensions: row.packageDimensions || ""
              },
              features: row.keyFeatures ? row.keyFeatures.split(',').map(f => f.trim()) : [],
              care_instructions: row.careInstructions || "",
              images: imageUrls,
              seller: req.user._id,
              isActive: true
            });
          }
        })
        .on('end', async () => {
          try {
            // Delete the temp file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            if (results.length > 0) {
              await Product.insertMany(results);
            }
            resolve({ 
              successCount: results.length, 
              errorCount: errors.length, 
              errors 
            });
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => reject(err));
    });

    const summary = await processStream;
    
    res.json({
      message: summary.successCount > 0 
        ? `Bulk upload successful for ${summary.successCount} products.` 
        : "Bulk upload failed for all rows.",
      ...summary
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("Bulk Upload Logic Error:", error);
    res.status(500).json({ message: "Server error during bulk processing", error: error.message });
  }
};

const incrementShopVisitors = async (req, res) => {
  try {
    const { sellerId } = req.params;
    await User.findByIdAndUpdate(sellerId, { $inc: { shopVisitors: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getPublicSellerProducts,
  getAdminProducts,
  toggleProductLike,
  bulkUpdateProducts,
  incrementShopVisitors,
  bulkUploadProducts,
};

// // };
// const Product = require('../models/product');

// // ==============================
// // PUBLIC: Get all products or search (Customer can use)
// // GET /api/products/public?search=keyword
// // ==============================
// const getProducts = async (req, res) => {
//   const search = req.query.search || '';

//   try {
//     const products = await Product.find({
//       $or: [
//         { name: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { category: { $regex: search, $options: 'i' } },
//         { subcategory: { $regex: search, $options: 'i' } },
//       ],
//     });

//     res.json(products);
//   } catch (error) {
//     console.error("Error fetching products:", error.message);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// // ==============================
// // GET Seller Products / Search
// // GET /api/products
// // Protected
// // ==============================
// const getSellerProducts = async (req, res) => {
//   try {
//     const search = req.query.search || '';
//     const sellerId = req.user._id; // protect middleware के बाद available

//     const products = await Product.find({
//       seller: sellerId,
//       $or: [
//         { name: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { category: { $regex: search, $options: 'i' } },
//       ],
//     });

//     res.json(products);
//   } catch (error) {
//     console.error("Error fetching seller products:", error.message);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// // ==============================
// // CREATE Product
// // POST /api/products
// // Protected
// // ==============================
// const createProduct = async (req, res) => {
//   try {
//     const { name, description, price, category, subcategory, stock } = req.body;
//     const image = req.file ? `/uploads/${req.file.filename}` : null;

//     const product = await Product.create({
//       name,
//       description,
//       price,
//       category,
//       subcategory,
//       stock,
//       images: image ? [{ public_id: 'local', url: image }] : [],
//       seller: req.user._id,
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     console.error("Error creating product:", error.message);
//     res.status(400).json({ message: 'Error creating product', error: error.message });
//   }
// };



// // ==============================
// // UPDATE Product
// // PUT /api/products/:id
// // Protected
// // ==============================
// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description, price, category } = req.body;
//     const image = req.file ? `/uploads/${req.file.filename}` : undefined;

//     const product = await Product.findOne({ _id: id, seller: req.user._id });
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     product.name = name || product.name;
//     product.description = description || product.description;
//     product.price = price || product.price;
//     product.category = category || product.category;
//     // if (image) product.image = image;
//     if (image) product.images = [{ public_id: 'local', url: image }];

//     await product.save();
//     res.json(product);
//   } catch (error) {
//     console.error("Error updating product:", error.message);
//     res.status(400).json({ message: 'Error updating product', error: error.message });
//   }
// };

// // ==============================
// // DELETE Product
// // DELETE /api/products/:id
// // Protected
// // ==============================
// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findOneAndDelete({ _id: id, seller: req.user._id });
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     res.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     console.error("Error deleting product:", error.message);
//     res.status(400).json({ message: 'Error deleting product', error: error.message });
//   }
// };
// const getProductById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const product = await Product.findById(id); // assuming you're using Mongoose
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.json(product);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = {
//   getProducts,         // ✅ Public search
//   getSellerProducts,   // ✅ Seller search
//   createProduct,       // ✅ Seller create
//   updateProduct,       // ✅ Seller update
//   deleteProduct,       // ✅ Seller delete
//   getProductById,
// };
