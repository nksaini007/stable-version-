const ArchitectWork = require("../models/ArchitectWork");
const User = require("../models/userModel");

// ─── CREATE a new catalog work item (Architect only) ───
exports.createWork = async (req, res) => {
    try {
        const {
            title, category, description, location,
            estimatedCost, area, features, materialsUsed,
            progress, status, isPublic,
        } = req.body;

        // Collect uploaded image paths
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(f => "/" + f.path.replace(/\\/g, "/"));
        }

        // Attach architect info snapshot
        const architect = req.user;
        const architectInfo = {
            name: architect.name,
            phone: architect.phone || "",
            email: architect.email,
            bio: architect.bio || "",
            profileImage: architect.profileImage || "",
        };

        // Parse features and materialsUsed from comma-separated strings if needed
        const parsedFeatures = typeof features === "string"
            ? features.split(",").map(f => f.trim()).filter(Boolean)
            : (features || []);

        const parsedMaterials = typeof materialsUsed === "string"
            ? materialsUsed.split(",").map(m => m.trim()).filter(Boolean)
            : (materialsUsed || []);

        const work = new ArchitectWork({
            architectId: req.user.id,
            title,
            category,
            description,
            images,
            location,
            estimatedCost,
            area,
            features: parsedFeatures,
            materialsUsed: parsedMaterials,
            architectInfo,
            progress: progress ? Number(progress) : 0,
            status: status || "Draft",
            isPublic: isPublic === "true" || isPublic === true,
        });

        await work.save();
        res.status(201).json({ success: true, work });
    } catch (error) {
        console.error("Create work error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET ALL works for logged-in architect ───
exports.getMyWorks = async (req, res) => {
    try {
        const works = await ArchitectWork.find({ architectId: req.user.id })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, works });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET a single work by ID (Architect — own work) ───
exports.getWorkById = async (req, res) => {
    try {
        const work = await ArchitectWork.findById(req.params.id);
        if (!work) return res.status(404).json({ success: false, message: "Work not found" });

        // Only the owning architect can view via this endpoint
        if (String(work.architectId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.status(200).json({ success: true, work });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── PUBLIC GET by ID (for QR code landing page — no auth required) ───
exports.getPublicWork = async (req, res) => {
    try {
        const work = await ArchitectWork.findById(req.params.id);
        if (!work) return res.status(404).json({ success: false, message: "Project not found" });

        // Only published + public works are accessible
        if (!work.isPublic || work.status !== "Published") {
            return res.status(404).json({ success: false, message: "This project is not publicly available" });
        }

        res.status(200).json({ success: true, work });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── UPDATE a work item (Architect only — own work) ───
exports.updateWork = async (req, res) => {
    try {
        const work = await ArchitectWork.findById(req.params.id);
        if (!work) return res.status(404).json({ success: false, message: "Work not found" });

        if (String(work.architectId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const {
            title, category, description, location,
            estimatedCost, area, features, materialsUsed,
            progress, status, isPublic,
        } = req.body;

        if (title) work.title = title;
        if (category) work.category = category;
        if (description) work.description = description;
        if (location !== undefined) work.location = location;
        if (estimatedCost !== undefined) work.estimatedCost = estimatedCost;
        if (area !== undefined) work.area = area;
        if (progress !== undefined) work.progress = Number(progress);
        if (status) work.status = status;
        if (isPublic !== undefined) work.isPublic = isPublic === "true" || isPublic === true;

        if (features !== undefined) {
            work.features = typeof features === "string"
                ? features.split(",").map(f => f.trim()).filter(Boolean)
                : features;
        }
        if (materialsUsed !== undefined) {
            work.materialsUsed = typeof materialsUsed === "string"
                ? materialsUsed.split(",").map(m => m.trim()).filter(Boolean)
                : materialsUsed;
        }

        // Append newly uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => "/" + f.path.replace(/\\/g, "/"));
            work.images.push(...newImages);
        }

        // Update architect info snapshot
        const architect = req.user;
        work.architectInfo = {
            name: architect.name,
            phone: architect.phone || "",
            email: architect.email,
            bio: architect.bio || "",
            profileImage: architect.profileImage || "",
        };

        await work.save();
        res.status(200).json({ success: true, work });
    } catch (error) {
        console.error("Update work error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── DELETE a work item (Architect only — own work) ───
exports.deleteWork = async (req, res) => {
    try {
        const work = await ArchitectWork.findById(req.params.id);
        if (!work) return res.status(404).json({ success: false, message: "Work not found" });

        if (String(work.architectId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await ArchitectWork.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Work deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── REMOVE a specific image from a work item ───
exports.removeImage = async (req, res) => {
    try {
        const work = await ArchitectWork.findById(req.params.id);
        if (!work) return res.status(404).json({ success: false, message: "Work not found" });

        if (String(work.architectId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const { imageUrl } = req.body;
        work.images = work.images.filter(img => img !== imageUrl);
        await work.save();

        res.status(200).json({ success: true, work });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
