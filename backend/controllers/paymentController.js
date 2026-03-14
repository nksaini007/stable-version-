const Order = require("../models/Order");
const User = require("../models/userModel");
const Product = require("../models/product");
const AdPayment = require("../models/AdPayment");
const AdCampaign = require("../models/AdCampaign");

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
        const orders = await Order.find({ "orderItems.seller._id": sellerId });

        let totalSales = 0;
        let paidSales = 0;
        let pendingSales = 0;
        let totalItemsSold = 0;
        const monthlyData = {};

        orders.forEach((order) => {
            const sellerItems = order.orderItems.filter(
                (item) => item.seller?._id?.toString() === sellerId
            );

            const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.qty, 0);
            totalSales += sellerTotal;
            totalItemsSold += sellerItems.reduce((sum, item) => sum + item.qty, 0);

            if (order.isPaid) {
                paidSales += sellerTotal;
            } else {
                pendingSales += sellerTotal;
            }

            // Monthly breakdown
            const month = new Date(order.createdAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
            monthlyData[month] = (monthlyData[month] || 0) + sellerTotal;
        });

        const monthlyChart = Object.entries(monthlyData).map(([month, amount]) => ({
            month,
            amount,
        }));

        res.json({
            totalSales,
            paidSales,
            pendingSales,
            totalItemsSold,
            totalOrders: orders.length,
            monthlyChart,
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

        const platformCommission = parseFloat((grossSales * 0.02).toFixed(2)); // 2%
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
};
