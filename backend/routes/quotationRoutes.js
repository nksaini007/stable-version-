const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getMyQuotations,
  getAllQuotations,
  getQuotationById,
  updateQuotationAdmin,
  respondToQuotation,
} = require("../controllers/quotationController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.route("/")
  .post(protect, createQuotation)
  .get(protect, adminOnly, getAllQuotations);

router.route("/my")
  .get(protect, getMyQuotations);

router.route("/:id")
  .get(protect, getQuotationById);

router.route("/:id/admin")
  .put(protect, adminOnly, updateQuotationAdmin);

router.route("/:id/respond")
  .put(protect, respondToQuotation);

module.exports = router;
