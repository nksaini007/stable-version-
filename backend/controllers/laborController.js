const Laborer = require("../models/Laborer");
const LaborPayment = require("../models/LaborPayment");

// ═══════════════════════════════════════════
//  LABORER CRUD
// ═══════════════════════════════════════════

exports.addLaborer = async (req, res) => {
    try {
        const { name, phone, skills, dailyRate, projectId, taskDescription, notes } = req.body;
        const parsedSkills = typeof skills === "string"
            ? skills.split(",").map(s => s.trim()).filter(Boolean)
            : (skills || []);

        const laborer = new Laborer({
            name, phone,
            skills: parsedSkills,
            dailyRate: dailyRate ? Number(dailyRate) : 0,
            architectId: req.user.id,
            projectId: projectId || null,
            taskDescription: taskDescription || "",
            notes: notes || "",
        });
        await laborer.save();
        res.status(201).json({ success: true, laborer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyLaborers = async (req, res) => {
    try {
        const laborers = await Laborer.find({ architectId: req.user.id })
            .populate("projectId", "name location status")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, laborers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLaborer = async (req, res) => {
    try {
        const laborer = await Laborer.findById(req.params.id);
        if (!laborer) return res.status(404).json({ success: false, message: "Laborer not found" });
        if (String(laborer.architectId) !== String(req.user.id))
            return res.status(403).json({ success: false, message: "Access denied" });

        const { name, phone, skills, dailyRate, projectId, taskDescription, notes, status } = req.body;
        if (name) laborer.name = name;
        if (phone !== undefined) laborer.phone = phone;
        if (dailyRate !== undefined) laborer.dailyRate = Number(dailyRate);
        if (projectId !== undefined) laborer.projectId = projectId || null;
        if (taskDescription !== undefined) laborer.taskDescription = taskDescription;
        if (notes !== undefined) laborer.notes = notes;
        if (status) laborer.status = status;
        if (skills !== undefined) {
            laborer.skills = typeof skills === "string"
                ? skills.split(",").map(s => s.trim()).filter(Boolean)
                : skills;
        }

        await laborer.save();
        res.status(200).json({ success: true, laborer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLaborer = async (req, res) => {
    try {
        const laborer = await Laborer.findById(req.params.id);
        if (!laborer) return res.status(404).json({ success: false, message: "Laborer not found" });
        if (String(laborer.architectId) !== String(req.user.id))
            return res.status(403).json({ success: false, message: "Access denied" });

        await Laborer.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Laborer deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════
//  LABOR PAYMENTS
// ═══════════════════════════════════════════

exports.addPayment = async (req, res) => {
    try {
        const { laborerId, projectId, amount, date, description, paymentMethod, status } = req.body;

        const laborer = await Laborer.findById(laborerId);
        if (!laborer) return res.status(404).json({ success: false, message: "Laborer not found" });
        if (String(laborer.architectId) !== String(req.user.id))
            return res.status(403).json({ success: false, message: "Access denied" });

        const payment = new LaborPayment({
            laborerId,
            projectId: projectId || laborer.projectId || null,
            architectId: req.user.id,
            amount: Number(amount),
            date: date || Date.now(),
            description: description || "",
            paymentMethod: paymentMethod || "Cash",
            status: status || "Paid",
        });

        await payment.save();
        res.status(201).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const filter = { architectId: req.user.id };
        if (req.query.laborerId) filter.laborerId = req.query.laborerId;
        if (req.query.projectId) filter.projectId = req.query.projectId;

        const payments = await LaborPayment.find(filter)
            .populate("laborerId", "name phone")
            .populate("projectId", "name")
            .sort({ date: -1 });

        res.status(200).json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const payment = await LaborPayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
        if (String(payment.architectId) !== String(req.user.id))
            return res.status(403).json({ success: false, message: "Access denied" });

        const { amount, date, description, paymentMethod, status } = req.body;
        if (amount !== undefined) payment.amount = Number(amount);
        if (date) payment.date = date;
        if (description !== undefined) payment.description = description;
        if (paymentMethod) payment.paymentMethod = paymentMethod;
        if (status) payment.status = status;

        await payment.save();
        res.status(200).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const payment = await LaborPayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
        if (String(payment.architectId) !== String(req.user.id))
            return res.status(403).json({ success: false, message: "Access denied" });

        await LaborPayment.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Payment deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════
//  PAYMENT SUMMARY
// ═══════════════════════════════════════════

exports.getPaymentSummary = async (req, res) => {
    try {
        const laborers = await Laborer.find({ architectId: req.user.id });
        const payments = await LaborPayment.find({ architectId: req.user.id });

        const totalPaid = payments.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
        const totalPending = payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

        // Per-laborer summary
        const laborerSummary = laborers.map(l => {
            const lPayments = payments.filter(p => String(p.laborerId) === String(l._id));
            return {
                laborer: { _id: l._id, name: l.name, phone: l.phone, dailyRate: l.dailyRate },
                totalPaid: lPayments.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0),
                totalPending: lPayments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0),
                paymentCount: lPayments.length,
            };
        });

        res.status(200).json({
            success: true,
            summary: {
                totalLaborers: laborers.length,
                activeLaborers: laborers.filter(l => l.status === "Active").length,
                totalPaid,
                totalPending,
                totalPayments: payments.length,
                laborerSummary,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
