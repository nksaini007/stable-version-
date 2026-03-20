const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
    createService,
    updateService,
    deleteService,
    getServices,
    getServiceById,
    getMyServices,
    getAllServices,
    uploadServiceImages,
} = require("../controllers/serviceController");

// Public routes
router.get("/", getServices);
router.get("/user/my-services", protect, getMyServices);
router.get("/:id", getServiceById);

// Admin routes
router.post("/", protect, adminOnly, uploadServiceImages, createService);
router.put("/:id", protect, adminOnly, uploadServiceImages, updateService);
router.delete("/:id", protect, adminOnly, deleteService);

router.get("/admin/all", protect, adminOnly, getAllServices);

module.exports = router;
