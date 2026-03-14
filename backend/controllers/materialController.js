const RawMaterial = require("../models/RawMaterial");
const ProjectMaterial = require("../models/ProjectMaterial");
const MaterialRequest = require("../models/MaterialRequest");

// ═══════════════════════════════════════════════
//  ADMIN: Global Raw Material CRUD
// ═══════════════════════════════════════════════

exports.createGlobalMaterial = async (req, res) => {
    try {
        const { name, category, unit, unitPrice, description } = req.body;
        const material = new RawMaterial({
            name, category, unit,
            unitPrice: unitPrice ? Number(unitPrice) : 0,
            description: description || "",
            isGlobal: true,
            createdBy: req.user.id,
        });
        await material.save();
        res.status(201).json({ success: true, material });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllGlobalMaterials = async (req, res) => {
    try {
        const materials = await RawMaterial.find({ isGlobal: true }).sort({ category: 1, name: 1 });
        res.status(200).json({ success: true, materials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGlobalMaterial = async (req, res) => {
    try {
        const material = await RawMaterial.findById(req.params.id);
        if (!material || !material.isGlobal) return res.status(404).json({ success: false, message: "Material not found" });

        const { name, category, unit, unitPrice, description } = req.body;
        if (name) material.name = name;
        if (category) material.category = category;
        if (unit) material.unit = unit;
        if (unitPrice !== undefined) material.unitPrice = Number(unitPrice);
        if (description !== undefined) material.description = description;

        await material.save();
        res.status(200).json({ success: true, material });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteGlobalMaterial = async (req, res) => {
    try {
        await RawMaterial.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Material deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════
//  ARCHITECT: Custom Material + Browse
// ═══════════════════════════════════════════════

exports.createCustomMaterial = async (req, res) => {
    try {
        const { name, category, unit, unitPrice, description } = req.body;
        const material = new RawMaterial({
            name, category, unit,
            unitPrice: unitPrice ? Number(unitPrice) : 0,
            description: description || "",
            isGlobal: false,
            createdBy: req.user.id,
        });
        await material.save();
        res.status(201).json({ success: true, material });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllMaterials = async (req, res) => {
    try {
        // Return global + architect's own custom materials
        const materials = await RawMaterial.find({
            $or: [{ isGlobal: true }, { createdBy: req.user.id }]
        }).sort({ category: 1, name: 1 });
        res.status(200).json({ success: true, materials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════
//  PROJECT MATERIALS: Assign + Track Usage
// ═══════════════════════════════════════════════

exports.assignMaterialToProject = async (req, res) => {
    try {
        const { projectId, materialId, quantityAllocated, lowStockThreshold, notes } = req.body;
        const pm = new ProjectMaterial({
            projectId, materialId,
            architectId: req.user.id,
            quantityAllocated: Number(quantityAllocated) || 0,
            lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 10,
            notes: notes || "",
        });
        await pm.save();
        res.status(201).json({ success: true, projectMaterial: pm });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjectMaterials = async (req, res) => {
    try {
        const { projectId } = req.params;
        const materials = await ProjectMaterial.find({ projectId, architectId: req.user.id })
            .populate("materialId", "name category unit unitPrice")
            .populate("projectId", "name");
        res.status(200).json({ success: true, materials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjectMaterialsForCustomer = async (req, res) => {
    try {
        const { projectId } = req.params;
        // Verify user is customer of this project
        const ConstructionProject = require("../models/ConstructionProject");
        const project = await ConstructionProject.findOne({ _id: projectId, customerId: req.user.id });
        if (!project) return res.status(403).json({ success: false, message: "Access denied" });

        const materials = await ProjectMaterial.find({ projectId })
            .populate("materialId", "name category unit");
        res.status(200).json({ success: true, materials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMaterialUsage = async (req, res) => {
    try {
        const pm = await ProjectMaterial.findById(req.params.id);
        if (!pm) return res.status(404).json({ success: false, message: "Not found" });
        if (String(pm.architectId) !== String(req.user.id))
            return res.status(403).json({ success: false, message: "Access denied" });

        const { quantityUsed, quantityAllocated, lowStockThreshold, notes } = req.body;
        if (quantityUsed !== undefined) pm.quantityUsed = Number(quantityUsed);
        if (quantityAllocated !== undefined) pm.quantityAllocated = Number(quantityAllocated);
        if (lowStockThreshold !== undefined) pm.lowStockThreshold = Number(lowStockThreshold);
        if (notes !== undefined) pm.notes = notes;

        await pm.save();
        res.status(200).json({ success: true, projectMaterial: pm });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════
//  STOCK ALERTS & ANALYTICS
// ═══════════════════════════════════════════════

exports.getLowStockAlerts = async (req, res) => {
    try {
        const allPM = await ProjectMaterial.find({ architectId: req.user.id })
            .populate("materialId", "name category unit")
            .populate("projectId", "name");

        const alerts = allPM.filter(pm => pm.isLowStock);
        res.status(200).json({ success: true, alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMaterialAnalytics = async (req, res) => {
    try {
        const allPM = await ProjectMaterial.find({ architectId: req.user.id })
            .populate("materialId", "name category unit unitPrice");

        // Most used materials (by quantity used)
        const usageMap = {};
        allPM.forEach(pm => {
            const key = pm.materialId?._id?.toString();
            if (!key) return;
            if (!usageMap[key]) {
                usageMap[key] = {
                    material: pm.materialId,
                    totalUsed: 0,
                    totalAllocated: 0,
                    projectCount: 0,
                    totalCost: 0,
                };
            }
            usageMap[key].totalUsed += pm.quantityUsed;
            usageMap[key].totalAllocated += pm.quantityAllocated;
            usageMap[key].projectCount += 1;
            usageMap[key].totalCost += pm.quantityUsed * (pm.materialId?.unitPrice || 0);
        });

        const analytics = Object.values(usageMap).sort((a, b) => b.totalUsed - a.totalUsed);

        const totalMaterialCost = analytics.reduce((sum, a) => sum + a.totalCost, 0);
        const lowStockCount = allPM.filter(pm => pm.isLowStock).length;

        res.status(200).json({
            success: true,
            analytics,
            summary: {
                totalMaterials: Object.keys(usageMap).length,
                totalMaterialCost,
                lowStockCount,
                totalAllocations: allPM.length,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════
//  MATERIAL REQUESTS (Architect → Admin)
// ═══════════════════════════════════════════════

exports.createMaterialRequest = async (req, res) => {
    try {
        const { projectId, items, notes } = req.body;

        // Clean up custom items so they don't break ObjectId casting
        const formattedItems = (items || []).map(item => {
            if (item.materialId === "custom") {
                return { ...item, materialId: null };
            }
            return item;
        });

        const request = new MaterialRequest({
            projectId,
            architectId: req.user.id,
            items: formattedItems,
            notes: notes || "",
        });
        await request.save();
        res.status(201).json({ success: true, request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await MaterialRequest.find({ architectId: req.user.id })
            .populate("projectId", "name")
            .populate("items.materialId", "name category unit")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: get all requests
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await MaterialRequest.find()
            .populate("projectId", "name")
            .populate("architectId", "name email")
            .populate("items.materialId", "name category unit")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: update request status
exports.updateRequestStatus = async (req, res) => {
    try {
        const request = await MaterialRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });

        const { status, adminNotes } = req.body;
        if (status) request.status = status;
        if (adminNotes !== undefined) request.adminNotes = adminNotes;

        await request.save();
        res.status(200).json({ success: true, request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
