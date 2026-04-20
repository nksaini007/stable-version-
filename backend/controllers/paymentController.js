const Order = require("../models/Order");
const User = require("../models/userModel");
const Product = require("../models/product");
const AdPayment = require("../models/AdPayment");
const AdCampaign = require("../models/AdCampaign");
const WebsiteConfig = require("../models/WebsiteConfig");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ==================== ADMIN ENDPOINTS ====================

/**
 * GET /api/payments/admin/stats
 * Dashboard overview stats — users, products, orders, revenue
 */
const getAdminStats = async (req, res) => {
    try {
        const [usersCount, productsCount, ordersCount, orders] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.find({}, "totalPrice isPaid orderStatus"),
        ]);

        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const paidRevenue = orders.filter((o) => o.isPaid).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const pendingRevenue = totalRevenue - paidRevenue;
        const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
        const cancelledOrders = orders.filter((o) => o.orderStatus === "Cancelled").length;

        res.json({
            users: usersCount,
            products: productsCount,
            orders: ordersCount,
            totalRevenue,
            paidRevenue,
            pendingRevenue,
            deliveredOrders,
            cancelledOrders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/payments/admin/revenue-chart
 * Monthly revenue for the last 12 months
 */
const getAdminRevenueChart = async (req, res) => {
    try {
        const now = new Date();
        const months = [];
        const values = [];

        for (let i = 11; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const monthName = start.toLocaleString("en-IN", { month: "short" });
            months.push(monthName);

            const monthOrders = await Order.find({
                createdAt: { $gte: start, $lte: end },
                orderStatus: { $ne: "Cancelled" },
            });

            const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            values.push(monthRevenue);
        }

        res.json({ months, values });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/payments/admin/all
 * All orders as payment records with full details
 */
const getAdminPayments = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email phone")
            .populate("deliveryPerson", "name")
            .sort({ createdAt: -1 });

        const payments = orders.map((order) => ({
            _id: order._id,
            orderId: order._id,
            customer: order.user,
            totalPrice: order.totalPrice,
            itemsPrice: order.itemsPrice,
            taxPrice: order.taxPrice,
            shippingPrice: order.shippingPrice,
            paymentMethod: order.paymentMethod,
            isPaid: order.isPaid,
            paidAt: order.paidAt,
            orderStatus: order.orderStatus,
            isDelivered: order.isDelivered,
            deliveredAt: order.deliveredAt,
            deliveryPerson: order.deliveryPerson,
            createdAt: order.createdAt,
            itemCount: order.orderItems?.length || 0,
        }));

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/payments/admin/mark-paid
 * Admin marks an order as paid
 */
const markOrderPaid = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: `ADMIN_${Date.now()}`,
            status: "Paid",
            update_time: new Date().toISOString(),
            email_address: "admin@stinchar.com",
        };

        order.notes.push({
            message: "Payment marked as received by Admin",
            addedBy: "Admin",
        });

        await order.save();
        res.json({ message: "Order marked as paid", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/payments/admin/recent-orders
 * Last 10 orders for dashboard activity
 */
const getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== SELLER ENDPOINTS ====================

/**
 * GET /api/payments/seller/revenue
 * Seller's revenue breakdown from their items in all orders
 */
const getSellerRevenue = async (req, res) => {
    try {
        const sellerId = req.user._id.toString();
        
        // Fetch seller for analytics
        const seller = await User.findById(sellerId).select("shopVisitors shopLikes");

        const orders = await Order.find({ "orderItems.seller._id": sellerId, orderStatus: { $ne: "Cancelled" } });

        let totalSales = 0;
        let paidSales = 0;
        let pendingSales = 0;
        let totalItemsSold = 0;
        
        const monthlyData = {};
        const weeklyData = {};
        const dailyData = {};
        const productStats = {}; // { productId: { name, qty, image } }

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const fourWeeksAgo = new Date(now);
        fourWeeksAgo.setDate(now.getDate() - 28);

        orders.forEach((order) => {
            const sellerItems = order.orderItems.filter(
                (item) => item.seller?._id?.toString() === sellerId
            );

            const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.qty, 0);
            totalSales += sellerTotal;
            totalItemsSold += sellerItems.reduce((sum, item) => sum + item.qty, 0);

            if (order.isPaid) paidSales += sellerTotal;
            else pendingSales += sellerTotal;

            const orderDate = new Date(order.createdAt);

            // 1. Monthly (Last 6 months)
            const monthKey = orderDate.toLocaleString("en-IN", { month: "short", year: "2-digit" });
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + sellerTotal;

            // 2. Weekly (Last 4 weeks)
            if (orderDate >= fourWeeksAgo) {
                const weekNum = Math.ceil((now - orderDate) / (7 * 24 * 60 * 60 * 1000));
                const weekKey = `Week ${5 - weekNum}`; // W1 to W4
                weeklyData[weekKey] = (weeklyData[weekKey] || 0) + sellerTotal;
            }

            // 3. Daily (Last 7 days)
            if (orderDate >= sevenDaysAgo) {
                const dayKey = orderDate.toLocaleString("en-IN", { weekday: "short" });
                dailyData[dayKey] = (dailyData[dayKey] || 0) + sellerTotal;
            }

            // 4. Top Selling Products Aggregation
            sellerItems.forEach(item => {
                const pId = item._id || item.product;
                if (!productStats[pId]) {
                    productStats[pId] = { 
                        name: item.name, 
                        qty: 0, 
                        image: item.image,
                        price: item.price
                    };
                }
                productStats[pId].qty += item.qty;
            });
        });

        // Format charts
        const monthlyChart = Object.entries(monthlyData).map(([name, amount]) => ({ name, amount }));
        const weeklyChart = Object.entries(weeklyData).map(([name, amount]) => ({ name, amount }));
        
        // Ensure daily chart follows weekday order
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dailyChart = weekdays.map(day => ({
            name: day,
            amount: dailyData[day] || 0
        }));

        // Sort Top Products
        const topProducts = Object.values(productStats)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        res.json({
            totalSales,
            paidSales,
            pendingSales,
            totalItemsSold,
            totalOrders: orders.length,
            shopVisitors: seller?.shopVisitors || 0,
            shopLikes: seller?.shopLikes || 0,
            monthlyChart,
            weeklyChart,
            dailyChart,
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== DELIVERY ENDPOINTS ====================

/**
 * GET /api/payments/delivery/earnings
 * Delivery person's earnings — ₹40 per delivery
 */
const getDeliveryEarnings = async (req, res) => {
    try {
        const allOrders = await Order.find({ deliveryPerson: req.user._id });
        const delivered = allOrders.filter((o) => o.isDelivered);

        const totalEarnings = delivered.length * 40;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEarnings = delivered.filter(
            (o) => o.deliveredAt && new Date(o.deliveredAt) >= todayStart
        ).length * 40;

        // Monthly breakdown
        const monthlyData = {};
        delivered.forEach((order) => {
            if (!order.deliveredAt) return;
            const month = new Date(order.deliveredAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
            monthlyData[month] = (monthlyData[month] || 0) + 40;
        });

        const monthlyChart = Object.entries(monthlyData).map(([month, amount]) => ({
            month,
            amount,
        }));

        // COD collected
        const codCollected = delivered
            .filter((o) => o.paymentMethod === "COD")
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        res.json({
            totalEarnings,
            todayEarnings,
            totalDeliveries: delivered.length,
            pendingDeliveries: allOrders.length - delivered.length,
            codCollected,
            monthlyChart,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== CUSTOMER ENDPOINTS ====================

/**
 * GET /api/payments/customer/spending
 * Customer's spending summary
 */
const getCustomerSpending = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });

        const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const paidOrders = orders.filter((o) => o.isPaid);
        const pendingPayments = orders.filter((o) => !o.isPaid && o.orderStatus !== "Cancelled");

        res.json({
            totalSpent,
            totalOrders: orders.length,
            paidOrders: paidOrders.length,
            pendingPayments: pendingPayments.length,
            pendingAmount: pendingPayments.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== SELLER STATEMENT ====================

/**
 * GET /api/payments/seller/statement
 * Full seller statement with date range, ad spend deduction
 */
const getSellerStatement = async (req, res) => {
    try {
        const sellerId = req.user._id.toString();
        const { from, to } = req.query;

        const dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            dateFilter.$lte = toDate;
        }

        const orderFilter = { "orderItems.seller._id": sellerId };
        if (from || to) orderFilter.createdAt = dateFilter;

        const orders = await Order.find(orderFilter).populate("user", "name email").sort({ createdAt: -1 });

        const transactions = [];
        let grossSales = 0;
        let totalItemsSold = 0;

        orders.forEach((order) => {
            const sellerItems = order.orderItems.filter(
                (item) => item.seller?._id?.toString() === sellerId
            );
            if (!sellerItems.length) return;

            const orderTotal = sellerItems.reduce((sum, item) => sum + item.price * item.qty, 0);
            grossSales += orderTotal;
            totalItemsSold += sellerItems.reduce((sum, item) => sum + item.qty, 0);

            transactions.push({
                type: "sale",
                orderId: order._id,
                customer: order.user?.name || "Unknown",
                items: sellerItems.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
                amount: orderTotal,
                paymentMethod: order.paymentMethod,
                isPaid: order.isPaid,
                status: order.orderStatus,
                date: order.createdAt,
            });
        });

        // Ad spend in the period
        const adFilter = { seller: req.user._id, status: "approved" };
        if (from || to) adFilter.createdAt = dateFilter;
        const adPayments = await AdPayment.find(adFilter).populate("campaign", "title adType");
        let totalAdSpend = 0;
        adPayments.forEach((ap) => {
            totalAdSpend += ap.amount;
            transactions.push({
                type: "ad_spend",
                campaignTitle: ap.campaign?.title || "Ad Campaign",
                adType: ap.campaign?.adType,
                amount: -ap.amount, // negative = deduction
                paymentMethod: ap.paymentMethod,
                referenceNumber: ap.referenceNumber,
                date: ap.createdAt,
            });
        });

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const config = await WebsiteConfig.findOne();
        const commissionRate = config?.settings?.platformCommissionRate ?? 2;

        const platformCommission = parseFloat((grossSales * (commissionRate / 100)).toFixed(2));
        const netEarnings = parseFloat((grossSales - platformCommission - totalAdSpend).toFixed(2));

        res.json({
            period: { from: from || null, to: to || null },
            summary: {
                grossSales: parseFloat(grossSales.toFixed(2)),
                totalItemsSold,
                totalOrders: orders.length,
                platformCommission,
                adSpend: parseFloat(totalAdSpend.toFixed(2)),
                netEarnings,
            },
            transactions,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== ADMIN DELIVERY REVENUE ====================

/**
 * GET /api/payments/admin/delivery-revenue
 * Admin view of delivery charge revenue
 */
const getAdminDeliveryRevenue = async (req, res) => {
    try {
        const orders = await Order.find({ shippingPrice: { $gt: 0 } }, "shippingPrice orderStatus deliveryZone deliveryVehicleType deliveryVehicleCount createdAt");

        const totalDeliveryRevenue = orders.reduce((sum, o) => sum + (o.shippingPrice || 0), 0);
        const byVehicle = {};
        const byZone = {};

        orders.forEach((o) => {
            const vt = o.deliveryVehicleType || "unknown";
            byVehicle[vt] = (byVehicle[vt] || 0) + o.shippingPrice;
            const zone = o.deliveryZone || "unknown";
            byZone[zone] = (byZone[zone] || 0) + o.shippingPrice;
        });

        res.json({
            totalDeliveryRevenue: parseFloat(totalDeliveryRevenue.toFixed(2)),
            totalDeliveryOrders: orders.length,
            byVehicleType: byVehicle,
            byZone,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/payments/webhook
 * Razorpay Webhook Handler
 */
const handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            console.error("Webhook Error: Missing signature or secret");
            return res.status(400).send("Invalid webhook configuration");
        }

        // Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.rawBody)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("Webhook Error: Signature verification failed");
            return res.status(400).send("Invalid signature");
        }

        const event = req.body;
        console.log(`[Razorpay Webhook] Event received: ${event.event}`);

        // Handle Order Paid Event
        if (event.event === "order.paid") {
            const razorpayOrderId = event.payload.order.entity.id;
            const paymentId = event.payload.payment.entity.id;

            const order = await Order.findOne({ "paymentResult.id": razorpayOrderId });

            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.orderStatus = "Pending";
                order.paymentResult.status = "Success";
                order.paymentResult.paymentId = paymentId; // Store actual payment ID from Razorpay
                order.paymentResult.update_time = new Date().toISOString();

                order.tracking.push({
                    status: "Order Placed",
                    note: "Payment verified via Webhook (Source: Razorpay)",
                    date: Date.now()
                });

                // 🚀 DEDUCT STOCK (Atomic check to prevent double deduction if verifyPayment also ran)
                // In production, we should check if stock was already deducted
                if (order.orderStatus !== "Cancelled") {
                    for (const item of order.orderItems) {
                        const product = await Product.findById(item.product);
                        if (product) {
                            product.stock -= item.qty;
                            if (item.variantId && product.variants) {
                                const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                                if (variant) variant.stock -= item.qty;
                            }
                            await product.save();
                        }
                    }
                }

                await order.save();
                console.log(`[Webhook Success] Order ${order._id} marked as paid`);
            }
        }

        // Handle Payment Failed
        if (event.event === "payment.failed") {
            const razorpayOrderId = event.payload.payment.entity.order_id;
            const order = await Order.findOne({ "paymentResult.id": razorpayOrderId });

            if (order) {
                order.tracking.push({
                    status: "Payment Failed",
                    note: `Reason: ${event.payload.payment.entity.error_description || "Unknown"}`,
                    date: Date.now()
                });
                await order.save();
            }
        }

        res.status(200).send("OK");
    } catch (err) {
        console.error("Webhook Processing Error:", err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    getAdminStats,
    getAdminRevenueChart,
    getAdminPayments,
    markOrderPaid,
    getRecentOrders,
    getSellerRevenue,
    getSellerStatement,
    getDeliveryEarnings,
    getCustomerSpending,
    getAdminDeliveryRevenue,
    handleRazorpayWebhook,
};
