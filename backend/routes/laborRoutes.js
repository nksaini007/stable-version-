const express = require("express");
const router = express.Router();
const controller = require("../controllers/laborController");
const authMiddleware = require("../middlewares/authMiddleware");

// Laborer CRUD
router.post("/laborers", authMiddleware.protect, controller.addLaborer);
router.get("/laborers", authMiddleware.protect, controller.getMyLaborers);
router.put("/laborers/:id", authMiddleware.protect, controller.updateLaborer);
router.delete("/laborers/:id", authMiddleware.protect, controller.deleteLaborer);

// Payments
router.post("/payments", authMiddleware.protect, controller.addPayment);
router.get("/payments", authMiddleware.protect, controller.getPayments);
router.put("/payments/:id", authMiddleware.protect, controller.updatePayment);
router.delete("/payments/:id", authMiddleware.protect, controller.deletePayment);

// Summary
router.get("/summary", authMiddleware.protect, controller.getPaymentSummary);

module.exports = router;
