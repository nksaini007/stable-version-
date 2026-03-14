const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// ------------------ CUSTOMER ROUTES ------------------

// Create a new order
router.post("/", protect, authorize("customer"), orderController.createOrder);

// Get logged-in customer's orders
router.get("/myorders", protect, authorize("customer"), orderController.getMyOrders);

// Cancel order (customer)
router.put("/cancel/:id", protect, authorize("customer"), orderController.cancelOrder);

// ------------------ SELLER ROUTES ------------------

// Get all orders for logged-in seller
router.get("/seller/orders", protect, authorize("seller"), orderController.getSellerOrders);

// Update item-level status by seller
router.put("/seller/item-status", protect, authorize("seller"), orderController.updateItemStatus);

// ------------------ DELIVERY ROUTES ------------------

// Get delivery person's assigned orders
router.get("/delivery/my-orders", protect, authorize("delivery"), orderController.getDeliveryOrders);

// Get delivery stats
router.get("/delivery/stats", protect, authorize("delivery"), orderController.getDeliveryStats);

// Pickup order
router.put("/delivery/pickup", protect, authorize("delivery"), orderController.pickupOrder);

// Confirm delivery
router.put("/delivery/confirm", protect, authorize("delivery"), orderController.confirmDelivery);

// Legacy delivery status (kept for compatibility)
router.put("/delivery-status", protect, authorize("delivery"), orderController.updateDeliveryStatus);

// ------------------ ADMIN ROUTES ------------------

// Get all orders
router.get("/admin/all", protect, authorize("admin"), orderController.getAllOrders);

// Assign delivery person
router.put("/admin/assign-delivery", protect, authorize("admin"), orderController.assignDeliveryPerson);

// Get all delivery persons
router.get("/admin/delivery-persons", protect, authorize("admin"), orderController.getDeliveryPersons);

// Update overall order status
router.put("/admin/order-status", protect, authorize("admin"), orderController.updateOrderStatus);

// Add admin note
router.put("/admin/add-note", protect, authorize("admin"), orderController.addOrderNote);

// ------------------ SHARED ROUTES (must be last) ------------------

// Get single order details (customer, admin, seller, delivery)
router.get("/:id", protect, orderController.getOrderById);

module.exports = router;
