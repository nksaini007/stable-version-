const express = require("express");
const router = express.Router();
const constructionController = require("../controllers/constructionController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const path = require("path");
const fs = require("fs");

// Multer config for project update images
const uploadUpdateImages = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }).array("images", 5);
const uploadTaskImages = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }).array("images", 5);
const uploadBlueprintDoc = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }).single("blueprint");

// Note: Ensure your authMiddleware adds req.user and req.user.role if you plan to do role-based checks.

// ---------------------------
// ADMIN ROUTES
// ---------------------------
// Note: You can add an adminMiddleware to secure these routes further.
router.post("/project", authMiddleware.protect, constructionController.createProject);
router.get("/projects", constructionController.getAllProjects);
router.get("/project/:projectId/details", authMiddleware.protect, constructionController.getProjectDetails);
router.put("/project/:projectId/assign", authMiddleware.protect, constructionController.assignRolesToProject);
router.put("/project/:projectId/phases", authMiddleware.protect, constructionController.updateProjectPhases);
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
