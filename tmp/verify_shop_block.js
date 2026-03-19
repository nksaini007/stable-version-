const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env - assuming script is run from project root: node tmp/verify_shop_block.js
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Manually require models using absolute paths to be safe, or relative to this script
const User = require(path.join(__dirname, '..', 'backend', 'models', 'userModel'));
const Product = require(path.join(__dirname, '..', 'backend', 'models', 'product'));
const Order = require(path.join(__dirname, '..', 'backend', 'models', 'Order'));

const verify = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI not found in env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create a test seller
    const seller = await User.create({
      name: 'Test Seller',
      email: `seller_${Date.now()}@test.com`,
      password: 'password123',
      role: 'seller',
      isActive: true,
      isApproved: true,
      businessName: 'Test Shop'
    });
    console.log('Created test seller:', seller._id);

    // 2. Create a test product
    const product = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: 'Test Category',
      seller: seller._id,
      isActive: true,
      images: [{ public_id: 'test', url: 'test.jpg' }],
      stock: 10
    });
    console.log('Created test product:', product._id);

    // 3. Mock getProducts logic (simulating the controller changes)
    const getActiveProducts = async () => {
      const activeSellers = await User.find({ role: 'seller', isActive: true }).select('_id');
      const activeSellerIds = activeSellers.map(s => s._id);
      return await Product.find({ seller: { $in: activeSellerIds }, isActive: true });
    };

    let products = await getActiveProducts();
    const foundBefore = products.some(p => p._id.toString() === product._id.toString());
    console.log('Product visible in search (active seller):', foundBefore);
    if (!foundBefore) throw new Error('Product should be visible initially');

    // 4. Deactivate seller
    seller.isActive = false;
    await seller.save();
    console.log('Deactivated seller');

    // 5. Check visibility again
    products = await getActiveProducts();
    const foundAfter = products.some(p => p._id.toString() === product._id.toString());
    console.log('Product visible in search (inactive seller):', foundAfter);

    if (foundAfter) throw new Error('Product should NOT be visible when seller is inactive');

    // 6. Check getProductById logic
    const getProdById = async (id) => {
      const p = await Product.findById(id).populate('seller', 'isActive');
      if (!p) return null;
      if (!p.seller || !p.seller.isActive) return { error: 'Inactive' };
      return p;
    };

    const prodResult = await getProdById(product._id);
    console.log('Product detail result (inactive seller):', prodResult.error || 'Found');
    if (prodResult.error !== 'Inactive') throw new Error('Product detail should return error for inactive seller');

    // 7. Check createOrder logic
    const canCreateOrder = async (orderItems) => {
      const sIds = [...new Set(orderItems.map(item => item.seller._id))];
      const inactiveSellers = await User.find({ _id: { $in: sIds }, isActive: false });
      return inactiveSellers.length === 0;
    };

    const orderItems = [{
      product: product._id,
      seller: { _id: seller._id },
      name: 'Test Product',
      qty: 1,
      price: 100
    }];

    const orderAllowed = await canCreateOrder(orderItems);
    console.log('Order allowed (inactive seller):', orderAllowed);
    if (orderAllowed) throw new Error('Order should NOT be allowed for inactive seller');

    console.log('✅ All tests passed!');

    // Cleanup
    await Product.findByIdAndDelete(product._id);
    await User.findByIdAndDelete(seller._id);
    console.log('Cleanup done');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.connection.close();
  }
};

verify();
