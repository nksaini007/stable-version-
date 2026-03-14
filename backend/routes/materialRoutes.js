const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Admin: Global material CRUD
router.post("/global", protect, adminOnly, controller.createGlobalMaterial);
router.get("/global", protect, controller.getAllGlobalMaterials);
router.put("/global/:id", protect, adminOnly, controller.updateGlobalMaterial);
router.delete("/global/:id", protect, adminOnly, controller.deleteGlobalMaterial);

// Architect: Custom material + browse all available
router.post("/custom", protect, controller.createCustomMaterial);
router.get("/all", protect, controller.getAllMaterials);

// Project materials: assign, get, update usage, and customer view
router.post("/project", protect, controller.assignMaterialToProject);
router.get("/project/:projectId", protect, controller.getProjectMaterials);
router.get("/project-customer/:projectId", protect, controller.getProjectMaterialsForCustomer);
router.put("/project/:id", protect, controller.updateMaterialUsage);

// Stock alerts + analytics
router.get("/alerts", protect, controller.getLowStockAlerts);
router.get("/analytics", protect, controller.getMaterialAnalytics);

// Material requests
router.post("/requests", protect, controller.createMaterialRequest);
router.get("/requests/my", protect, controller.getMyRequests);
router.get("/requests/all", protect, adminOnly, controller.getAllRequests);
router.put("/requests/:id", protect, adminOnly, controller.updateRequestStatus);

module.exports = router;
