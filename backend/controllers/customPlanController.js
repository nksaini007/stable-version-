const CustomPlanRequest = require("../models/CustomPlanRequest");
const ConstructionPlan = require("../models/ConstructionPlan");

// @desc    User submits a custom requirement for a plan
// @route   POST /api/custom-plans
// @access  Private/Customer
const submitCustomRequest = async (req, res) => {
    try {
        const { basePlanId, requirements } = req.body;

        // Check if plan exists
        const plan = await ConstructionPlan.findById(basePlanId);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Base plan not found" });
        }

        // Handle uploaded attachments (e.g., user sketches)
        let attachmentUrls = [];
        if (req.files && req.files.length > 0) {
            attachmentUrls = req.files.map((file) => file.path);
        }

        const newRequest = new CustomPlanRequest({
            customer: req.user._id,
            basePlan: basePlanId,
            requirements,
            attachments: attachmentUrls
        });

        await newRequest.save();
        res.status(201).json({ success: true, message: "Custom request submitted successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error submitting request", error: error.message });
    }
};

// @desc    Admin assigns a requirement to an architect
// @route   PATCH /api/custom-plans/:id/assign
// @access  Private/Admin
const assignArchitect = async (req, res) => {
    try {
        const { architectId, estimatedCost, adminNotes } = req.body;
        const request = await CustomPlanRequest.findByIdAndUpdate(
            req.params.id,
            { 
                assignedArchitect: architectId,
                estimatedCost,
                adminNotes,
                status: "Assigned"
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({ success: true, message: "Architect assigned", request });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error assigning architect", error: error.message });
    }
};

// @desc    Architect requests completion/verification
// @route   PATCH /api/custom-plans/:id/request-completion
// @access  Private/Architect
const requestCompletion = async (req, res) => {
    try {
        const { architectNotes } = req.body;
        const request = await CustomPlanRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Verify if the architect is the one assigned
        if (request.assignedArchitect.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this request" });
        }

        request.status = "Execution Requested";
        request.architectNotes = architectNotes;
        await request.save();

        res.status(200).json({ success: true, message: "Completion requested from Stinchar team", request });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error requesting completion", error: error.message });
    }
};

// @desc    Stinchar Team verifies and assures completion
// @route   PATCH /api/custom-plans/:id/verify-completion
// @access  Private/Admin
const verifyCompletion = async (req, res) => {
    try {
        const request = await CustomPlanRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        request.status = "Completed";
        request.isVerifiedByStinchar = true;
        request.completedAt = Date.now();
        await request.save();

        res.status(200).json({ success: true, message: "Project completion verified and assured", request });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error verifying completion", error: error.message });
    }
};

// @desc    Get user's custom requests
// @route   GET /api/custom-plans/my-requests
// @access  Private/Customer
const getMyRequests = async (req, res) => {
    try {
        const requests = await CustomPlanRequest.find({ customer: req.user._id })
            .populate("basePlan", "title images")
            .populate("assignedArchitect", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching requests", error: error.message });
    }
};

// @desc    Get architect's assigned requests
// @route   GET /api/custom-plans/architect-assignments
// @access  Private/Architect
const getArchitectAssignments = async (req, res) => {
    try {
        const requests = await CustomPlanRequest.find({ assignedArchitect: req.user._id })
            .populate("basePlan", "title images")
            .populate("customer", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching assignments", error: error.message });
    }
};

module.exports = {
    submitCustomRequest,
    assignArchitect,
    requestCompletion,
    verifyCompletion,
    getMyRequests,
    getArchitectAssignments
};
