const ConstructionProject = require("../models/ConstructionProject");
const ProjectTask = require("../models/ProjectTask");
const User = require("../models/userModel");

// ---------------------------
// ADMIN CONTROLLERS
// ---------------------------

// Create a new construction project (Admin only)
exports.createProject = async (req, res) => {
    try {
        const { 
            name, type, description, location, 
            images, estimatedCost, startDate, endDate,
            priority, phases, planId, customerId, architectId
        } = req.body;

        const newProject = new ConstructionProject({
            name,
            type,
            description,
            location,
            images: images || [],
            estimatedCost,
            startDate,
            endDate,
            priority: priority || "Medium",
            phases: phases || [
                { name: "Initial Planning", status: "In Progress", startDate: new Date() }
            ],
            currentPhase: phases && phases.length > 0 ? phases[0].name : "Initial Planning",
            adminId: req.user.id,
            planId: planId || undefined,
            customerId: customerId || undefined,
            architectId: architectId || undefined
        });

        await newProject.save();

        // If architect assigned, ensure it's in their profile
        if (architectId) {
            await User.findByIdAndUpdate(architectId, {
                $addToSet: { assignedProjects: newProject._id },
            });
        }

        res.status(201).json({ success: true, project: newProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all construction projects (Admin/Customer)
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await ConstructionProject.find()
            .populate("architectId", "name email profileImage")
            .populate("customerId", "name email phone")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: projects.length, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single project with ALL associated data (Inspector View)
exports.getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const project = await ConstructionProject.findById(projectId)
            .populate("architectId", "name email phone profileImage skills")
            .populate("customerId", "name email phone address")
            .populate("planId", "title category planType images");
            
        if (!project) return res.status(404).json({ success: false, message: "Registry not found" });

        // Security Check: Only admin, assigned architect, or assigned customer can view
        if (req.user.role !== "admin" && 
            String(project.customerId) !== String(req.user._id) && 
            String(project.architectId) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: "Not authorized to view this project" });
        }

        // Aggregate Tasks
        const tasks = await ProjectTask.find({ projectId }).populate("assignedTo", "name profileImage");
        
        // Aggregate Feed Updates
        const updates = await ProjectUpdate.find({ projectId })
            .populate("authorId", "name profileImage")
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            project,
            tasks,
            updates
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Project Phases/Milestones (Admin/Architect)
exports.updateProjectPhases = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { phases, status, priority, currentPhase, progressPercentage } = req.body;

        const updateData = {};
        if (phases) updateData.phases = phases;
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (currentPhase) updateData.currentPhase = currentPhase;
        if (progressPercentage !== undefined) updateData.progressPercentage = progressPercentage;

        const project = await ConstructionProject.findByIdAndUpdate(
            projectId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Assign architect and/or customer to a project (Admin)
exports.assignRolesToProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { architectId, customerId } = req.body;

        const project = await ConstructionProject.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        if (architectId) project.architectId = architectId;
        if (customerId) project.customerId = customerId;

        await project.save();

        // If architect assigned, add exactly to their profile
        if (architectId) {
            await User.findByIdAndUpdate(architectId, {
                $addToSet: { assignedProjects: projectId },
            });
        }

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a task/milestone for a project (Admin or assigned Architect)
exports.createTask = async (req, res) => {
    try {
        const { projectId, title, description, assignedTo, dueDate, images } = req.body;

        const project = await ConstructionProject.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        // If the user creating the task is an architect, verify they are assigned
        if (req.user.role === "architect") {
            if (String(project.architectId) !== String(req.user.id)) {
                return res.status(403).json({ success: false, message: "You are not assigned to this project" });
            }
        } else if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized to create project tasks" });
        }

        const newTask = new ProjectTask({
            projectId,
            title,
            description,
            assignedTo: assignedTo || req.user.id, // Default assign to creator
            dueDate: dueDate || undefined,
            images: images || [],
        });

        await newTask.save();
        res.status(201).json({ success: true, task: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get tasks for a specific project
exports.getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const project = await ConstructionProject.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        // Security Check: Only admin, assigned architect, or assigned customer can view tasks
        const userId = req.user.id;
        if (req.user.role !== "admin" && 
            String(project.customerId) !== userId && 
            String(project.architectId) !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to view tasks for this project" });
        }

        const tasks = await ProjectTask.find({ projectId }).populate("assignedTo", "name email");
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------
// ARCHITECT CONTROLLERS
// ---------------------------

// Get projects assigned to the logged-in architect
exports.getArchitectProjects = async (req, res) => {
    try {
        const architectId = req.user.id;
        const projects = await ConstructionProject.find({ architectId }).populate("customerId", "name email");
        res.status(200).json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update task status and upload images (Architect)
exports.updateTaskProgress = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await ProjectTask.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        if (status) task.status = status;

        // Handle uploaded image files
        if (req.files && req.files.length > 0) {
            const filePaths = req.files.map(f => f.path);
            task.images.push(...filePaths);
        }

        await task.save();

        // Optionally update overall project progress percentage based on completed tasks
        const projectId = task.projectId;
        const allTasks = await ProjectTask.find({ projectId });
        const completedTasks = allTasks.filter(t => t.status === "Completed").length;
        const progressPercentage = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

        await ConstructionProject.findByIdAndUpdate(projectId, { progressPercentage });

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload blueprint to a project (Architect)
exports.uploadBlueprint = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title } = req.body;

        const project = await ConstructionProject.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        if (String(project.architectId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "You are not assigned to this project" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No blueprint file provided" });
        }

        const fileUrl = req.file.path;

        project.blueprints.push({
            title: title || "Untitled Blueprint",
            fileUrl,
        });

        await project.save();
        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------
// CUSTOMER CONTROLLERS
// ---------------------------

// Get projects assigned to the logged-in customer
exports.getCustomerProjects = async (req, res) => {
    try {
        const customerId = req.user.id;
        const projects = await ConstructionProject.find({ customerId }).populate("architectId", "name email phone");
        res.status(200).json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------
// PROJECT UPDATES (FEED)
// ---------------------------
const ProjectUpdate = require("../models/ProjectUpdate");

// Create a project update (Architect)
exports.createProjectUpdate = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, content } = req.body;

        // Verify architect is assigned to this project
        const project = await ConstructionProject.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        if (String(project.architectId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "You are not assigned to this project" });
        }

        // Collect images from uploaded files
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(f => f.path);
        }

        const update = new ProjectUpdate({
            projectId,
            authorId: req.user.id,
            title,
            content,
            images,
        });

        await update.save();
        res.status(201).json({ success: true, update });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all updates for a project
exports.getProjectUpdates = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const project = await ConstructionProject.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        // Security Check: Only admin, assigned architect, or assigned customer can view updates
        const userId = req.user.id;
        if (req.user.role !== "admin" && 
            String(project.customerId) !== userId && 
            String(project.architectId) !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to view updates for this project" });
        }

        const updates = await ProjectUpdate.find({ projectId })
            .populate("authorId", "name email profileImage")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, updates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
