const Product = require('../models/product');

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
    // Build filter object
    const filter = {};

    // Search logic (name or description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Explicit filters
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (subcategory) filter.subcategory = { $regex: subcategory, $options: 'i' };
    if (type) filter.type = { $regex: type, $options: 'i' };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).skip(skip).limit(limit);

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
    } = req.body;

    let image = req.file ? `/uploads/${req.file.filename}` : null;
    
    // If no file, but a link is provided, use the link
    if (!image && imageLink) {
        image = imageLink;
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
      images: image ? [{ public_id: image.startsWith('http') ? 'external' : 'local', url: image }] : [],
      seller: req.user._id,
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
    let image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // If no file but imageLink provided in updates
    if (!image && updates.imageLink) {
        image = updates.imageLink;
    }

    // Admin override: Admin can update any product, seller can only update their own
    const query = req.user.role === 'admin' ? { _id: id } : { _id: id, seller: req.user._id };
    const product = await Product.findOne(query);

    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

    Object.keys(updates).forEach((key) => {
      if (key === 'features' && typeof updates[key] === 'string') {
        product[key] = updates[key].split(',').map((f) => f.trim());
      } else if (key !== 'imageLink') { // Don't directly map imageLink to product
        product[key] = updates[key] || product[key];
      }
    });

    if (image) {
        product.images = [{ 
            public_id: image.startsWith('http') ? 'external' : 'local', 
            url: image 
        }];
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
    const product = await Product.findOneAndDelete(query);

    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

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
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

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

    const products = await Product.find({ seller: sellerId, isActive: true });

    res.json(products);
  } catch (err) {
    console.error("Error fetching public seller products:", err);
    res.status(500).json({ error: "Server error fetching shop products" });
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
