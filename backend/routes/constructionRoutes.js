const express = require("express");
const router = express.Router();
const constructionController = require("../controllers/constructionController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer config for project update images
const updateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "uploads/project-updates/";
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, "update_" + Date.now() + path.extname(file.originalname));
    },
});
const uploadUpdateImages = multer({ storage: updateStorage }).array("images", 5);

// Multer config for task evidence images
const taskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "uploads/task-evidence/";
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, "evidence_" + Date.now() + path.extname(file.originalname));
    },
});
const uploadTaskImages = multer({ storage: taskStorage }).array("images", 5);

// Multer config for blueprint evidence images
const blueprintStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "uploads/blueprints/";
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, "blueprint_" + Date.now() + path.extname(file.originalname));
    },
});
const uploadBlueprintDoc = multer({ storage: blueprintStorage }).single("blueprint");

// Note: Ensure your authMiddleware adds req.user and req.user.role if you plan to do role-based checks.

// ---------------------------
// ADMIN ROUTES
// ---------------------------
// Note: You can add an adminMiddleware to secure these routes further.
router.post("/project", authMiddleware.protect, constructionController.createProject);
router.get("/projects", constructionController.getAllProjects);
router.put("/project/:projectId/assign", authMiddleware.protect, constructionController.assignRolesToProject);
router.post("/task", authMiddleware.protect, constructionController.createTask);
router.get("/project/:projectId/tasks", constructionController.getProjectTasks);

// ---------------------------
// ARCHITECT ROUTES
// ---------------------------
router.get("/architect/projects", authMiddleware.protect, constructionController.getArchitectProjects);
router.post("/project/:projectId/task", authMiddleware.protect, constructionController.createTask); // Architects can also create milestones
router.post("/project/:projectId/blueprint", authMiddleware.protect, uploadBlueprintDoc, constructionController.uploadBlueprint);
router.put("/task/:taskId/progress", authMiddleware.protect, uploadTaskImages, constructionController.updateTaskProgress);

// ---------------------------
// CUSTOMER ROUTES
// ---------------------------
router.get("/customer/projects", authMiddleware.protect, constructionController.getCustomerProjects);

// ---------------------------
// PROJECT UPDATES (FEED)
// ---------------------------
router.post("/project/:projectId/update", authMiddleware.protect, uploadUpdateImages, constructionController.createProjectUpdate);
router.get("/project/:projectId/updates", authMiddleware.protect, constructionController.getProjectUpdates);

module.exports = router;
