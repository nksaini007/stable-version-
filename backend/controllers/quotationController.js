const Quotation = require("../models/Quotation");
const Order = require("../models/Order");

// @desc    Create a new quotation request
// @route   POST /api/quotations
// @access  Private
const createQuotation = async (req, res) => {
  try {
    const { items, shippingAddress, itemsPrice, customerNote } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in quotation request" });
    }

    const quotation = new Quotation({
      user: req.user._id,
      items,
      shippingAddress,
      itemsPrice,
      totalPrice: itemsPrice, // Initial price
      customerNote,
    });

    const createdQuotation = await quotation.save();
    res.status(201).json(createdQuotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user quotations
// @route   GET /api/quotations/my
// @access  Private
const getMyQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quotations (Admin)
// @route   GET /api/quotations
// @access  Private/Admin
const getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quotation by ID
// @route   GET /api/quotations/:id
// @access  Private
const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate("user", "name email");
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    // Ensure only owner or admin can view
    if (quotation.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quotation (Admin) - Adjust prices and shipping
// @route   PUT /api/quotations/:id/admin
// @access  Private/Admin
const updateQuotationAdmin = async (req, res) => {
  try {
    const { items, shippingPrice, adminNote } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    if (items) quotation.items = items;
    if (shippingPrice !== undefined) quotation.shippingPrice = shippingPrice;
    if (adminNote) quotation.adminNote = adminNote;

    // Recalculate totals
    const itemsPrice = quotation.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    quotation.itemsPrice = itemsPrice;
    quotation.totalPrice = itemsPrice + (quotation.shippingPrice || 0);
    
    quotation.status = "Adjusted";
    const updatedQuotation = await quotation.save();

    res.json(updatedQuotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to quotation (User) - Accept or Reject
// @route   PUT /api/quotations/:id/respond
// @access  Private
const respondToQuotation = async (req, res) => {
  try {
    const { response } = req.body; // "Accepted" or "Rejected"
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) return res.status(404).json({ message: "Quotation not found" });
    if (quotation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["Accepted", "Rejected"].includes(response)) {
      return res.status(400).json({ message: "Invalid response" });
    }

    quotation.status = response;
    await quotation.save();

    res.json({ message: `Quotation ${response}`, quotation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuotation,
  getMyQuotations,
  getAllQuotations,
  getQuotationById,
  updateQuotationAdmin,
  respondToQuotation,
};
