const SupportTicket = require("../models/SupportTicket");
const ConstructionProject = require("../models/ConstructionProject");

// ═══════════════════════════════════════════
//  CUSTOMER: Create & manage tickets
// ═══════════════════════════════════════════

exports.createTicket = async (req, res) => {
    try {
        const { subject, category, priority, projectId, message } = req.body;

        const thread = message ? [{ sender: req.user.id, senderRole: req.user.role, text: message }] : [];

        const ticket = new SupportTicket({
            customerId: req.user.id,
            projectId: projectId || null,
            subject,
            category: category || "General",
            priority: priority || "Medium",
            thread,
        });

        await ticket.save();
        res.status(201).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ customerId: req.user.id })
            .populate("projectId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════
//  ARCHITECT: View tickets for their projects
// ═══════════════════════════════════════════

exports.getArchitectTickets = async (req, res) => {
    try {
        // Find all projects assigned to this architect
        const projectIds = await ConstructionProject.find({ architectId: req.user.id }).select("_id");
        const ids = projectIds.map(p => p._id);

        const tickets = await SupportTicket.find({ projectId: { $in: ids } })
            .populate("customerId", "name email phone")
            .populate("projectId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════
//  ADMIN: View all tickets
// ═══════════════════════════════════════════

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find()
            .populate("customerId", "name email phone")
            .populate("projectId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════
//  SHARED: Reply, Update status
// ═══════════════════════════════════════════

exports.replyToTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        const { text } = req.body;
        ticket.thread.push({
            sender: req.user.id,
            senderRole: req.user.role,
            text,
        });

        // Auto-update status based on responder role
        if (req.user.role === "admin" || req.user.role === "architect") {
            if (ticket.status === "Open") ticket.status = "In Progress";
        }

        await ticket.save();
        res.status(200).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        const { status, priority } = req.body;
        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;

        await ticket.save();
        res.status(200).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate("customerId", "name email phone profileImage")
            .populate("projectId", "name status")
            .populate("thread.sender", "name profileImage role");

        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
        res.status(200).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
