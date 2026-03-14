const express = require("express");
const router = express.Router();
const controller = require("../controllers/architectWorkController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer config for architect work images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "uploads/architect-works/";
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, "work_" + Date.now() + "_" + Math.round(Math.random() * 1000) + path.extname(file.originalname));
    },
});
const upload = multer({ storage }).array("images", 10);

// ─── PUBLIC ROUTE (no auth — QR code landing) ───
router.get("/public/:id", controller.getPublicWork);

// ─── PROTECTED ROUTES (Architect only) ───
router.post("/", authMiddleware.protect, upload, controller.createWork);
router.get("/my", authMiddleware.protect, controller.getMyWorks);
router.get("/:id", authMiddleware.protect, controller.getWorkById);
router.put("/:id", authMiddleware.protect, upload, controller.updateWork);
router.delete("/:id", authMiddleware.protect, controller.deleteWork);
router.put("/:id/remove-image", authMiddleware.protect, controller.removeImage);

module.exports = router;
