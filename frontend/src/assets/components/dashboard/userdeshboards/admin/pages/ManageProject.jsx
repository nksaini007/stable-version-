import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API, { API_BASE } from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus, FaUserTie, FaUser, FaCheckCircle, FaSpinner, FaCalendarAlt, FaTimes, FaHardHat, FaImage, FaFilePdf } from "react-icons/fa";

const ManageProject = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Base API URL for images (exported from api.js)

    const [users, setUsers] = useState([]);

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        imageLinks: "", // Added for milestone images
    });

    const [assignmentData, setAssignmentData] = useState({
        architectId: "",
        customerId: "",
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const projRes = await API.get("/construction/projects");
            const currentProj = projRes.data.projects.find(p => p._id === projectId);

            if (currentProj) {
                setProject(currentProj);
                setAssignmentData({
                    architectId: currentProj.architectId?._id || "",
                    customerId: currentProj.customerId?._id || "",
                });
            }

            const tasksRes = await API.get(`/construction/project/${projectId}/tasks`);
            setTasks(tasksRes.data.tasks);

            const usersRes = await API.get("/users");
            const responseData = usersRes.data;
            const usersList = Array.isArray(responseData)
                ? responseData
                : (responseData && Array.isArray(responseData.users) ? responseData.users : []);
            setUsers(usersList);

        } catch (error) {
            toast.error("Failed to load project details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId, token]);

    const handleAssignRoles = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/construction/project/${projectId}/assign`, assignmentData);
            toast.success("Roles assigned successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to assign roles");
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const images = taskData.imageLinks
                ? taskData.imageLinks.split(",").map(link => link.trim()).filter(link => link !== "")
                : [];

            await API.post("/construction/task", {
                projectId,
                ...taskData,
                images,
            });
            toast.success("Task created successfully");
            setShowTaskModal(false);
            setTaskData({ title: "", description: "", assignedTo: "", dueDate: "", imageLinks: "" });
            fetchData();
        } catch (error) {
            toast.error("Failed to create task");
        }
    };

    const statusColor = (status) => {
        const map = {
            "Completed": "bg-green-50 text-green-700 border-green-200",
            "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
            "Pending": "bg-amber-50 text-amber-700 border-amber-200",
        };
        return map[status] || "bg-[#121212] text-gray-200 border-[#2A2B2F]";
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );

    if (!project) return (
        <div className="text-center py-20">
            <FaHardHat className="text-5xl text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-200">Project not found</h2>
            <button onClick={() => navigate("/admin/construction")} className="mt-4 text-blue-400 hover:text-blue-800 text-sm font-medium">← Back to Projects</button>
        </div>
    );

    const architects = Array.isArray(users) ? users.filter(u => u.role === "architect") : [];
    const customers = Array.isArray(users) ? users.filter(u => u.role === "customer") : [];

    return (
        <div className="space-y-6">
            <button onClick={() => navigate("/admin/construction")} className="inline-flex items-center gap-2 text-[#8E929C] hover:text-blue-400 bg-[#1A1B1E] border border-[#2A2B2F] border border-[#2A2B2F]  px-4 py-2 rounded-xl font-medium transition-all hover:">
                <FaArrowLeft className="text-sm" /> Back to Projects
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-6 rounded-2xl border border-[#2A2B2F]">
                        <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                        <div className="flex gap-3 mb-4">
                            <span className="bg-[#121212] text-[#8E929C] px-3 py-1 rounded-full text-xs font-semibold">{project.type}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(project.status)}`}>{project.status}</span>
                        </div>
                        <p className="text-[#8E929C] text-sm mb-6">{project.description}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#121212] p-4 rounded-xl border border-[#2A2B2F]">
                                <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">Estimated Cost</p>
                                <p className="font-bold text-white text-lg mt-1">₹{Number(project.estimatedCost || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-[#121212] p-4 rounded-xl border border-[#2A2B2F]">
                                <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">Overall Progress</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex-1 bg-[#2A2B2F] h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${project.progressPercentage}%` }}></div>
                                    </div>
                                    <span className="font-bold text-sm text-gray-200">{project.progressPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-6 rounded-2xl border border-[#2A2B2F]">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-white">Tasks & Milestones</h3>
                            <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded-xl text-sm text-white transition font-medium">
                                <FaPlus className="text-xs" /> Add Task
                            </button>
                        </div>

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <div className="text-center py-8 text-gray-300">
                                    <FaCheckCircle className="text-3xl mx-auto mb-2" />
                                    <p className="text-sm text-[#6B7280]">No tasks created yet.</p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                    <div key={task._id} className="bg-[#121212] p-4 rounded-xl border border-[#2A2B2F] space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                                                <p className="text-sm text-[#8E929C] mb-2">{task.description}</p>
                                                {task.dueDate && (
                                                    <p className="text-xs text-blue-400 flex items-center gap-1 mb-1">
                                                        <FaCalendarAlt /> Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(task.dueDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                                {task.assignedTo && (
                                                    <p className="text-xs text-[#6B7280] flex items-center gap-1"><FaUserTie /> Assigned to: {task.assignedTo.name}</p>
                                                )}
                                            </div>
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex items-center gap-1 ${statusColor(task.status)}`}>
                                                {task.status === "Completed" ? <FaCheckCircle /> : <FaSpinner className={task.status === "In Progress" ? "animate-spin" : ""} />}
                                                {task.status}
                                            </span>
                                        </div>

                                        {/* Task Images Display */}
                                        {task.images && task.images.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                {task.images.map((img, i) => (
                                                    <div key={i} className="relative h-20 w-32 shrink-0 rounded-xl overflow-hidden border border-[#2A2B2F] bg-[#1A1B1E] border border-[#2A2B2F]">
                                                        <img 
                                                            src={getOptimizedImage(img, 400)} 
                                                            alt="" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Missing+Image'; }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {/* Blueprints Display */}
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-6 rounded-2xl border border-[#2A2B2F]">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-white">Design & Blueprints</h3>
                        </div>

                        {project.blueprints && project.blueprints.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.blueprints.map(bp => (
                                    <div key={bp._id} className="border border-[#2A2B2F] rounded-xl overflow-hidden ">
                                        <div className="h-32 bg-[#121212] flex items-center justify-center relative group overflow-hidden">
                                            {bp.fileUrl.endsWith('.pdf') ? (
                                                <FaFilePdf className="text-5xl text-red-400" />
                                            ) : (
                                                <img src={getOptimizedImage(bp.fileUrl, 800)} alt={bp.title} className="w-full h-full object-cover" />
                                            )}
                                            <a
                                                href={getOptimizedImage(bp.fileUrl, 2000)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-semibold"
                                            >
                                                View Full
                                            </a>
                                        </div>
                                        <div className="p-3 bg-[#121212]">
                                            <p className="font-semibold text-white text-sm line-clamp-1">{bp.title}</p>
                                            <p className="text-[10px] text-[#6B7280] mt-1">{new Date(bp.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-300">
                                <FaImage className="text-3xl mx-auto mb-2" />
                                <p className="text-sm text-[#6B7280]">No blueprints uploaded by the architect yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Role Assignment */}
                <div className="space-y-6">
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-6 rounded-2xl border border-[#2A2B2F]">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FaUserTie className="text-blue-500" /> Assign Team</h3>
                        <form onSubmit={handleAssignRoles} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Architect</label>
                                <select
                                    value={assignmentData.architectId}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, architectId: e.target.value })}
                                    className="w-full border-2 border-[#2A2B2F] rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 outline-none"
                                >
                                    <option value="">Select Architect...</option>
                                    {architects.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Customer</label>
                                <select
                                    value={assignmentData.customerId}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, customerId: e.target.value })}
                                    className="w-full border-2 border-[#2A2B2F] rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 outline-none"
                                >
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-white text-black hover:bg-gray-200 text-white rounded-xl transition text-sm font-semibold">
                                Save Assignments
                            </button>
                        </form>
                    </div>

                    {/* Project Info Cards */}
                    {project.architectId && (
                        <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-4 rounded-2xl border border-[#2A2B2F]">
                            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mb-2">Assigned Architect</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-400 flex items-center justify-center text-sm font-bold">
                                    {project.architectId.name?.charAt(0).toUpperCase() || "A"}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{project.architectId.name}</p>
                                    <p className="text-[11px] text-[#6B7280]">{project.architectId.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {project.customerId && (
                        <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-4 rounded-2xl border border-[#2A2B2F]">
                            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold mb-2">Customer</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                                    {project.customerId.name?.charAt(0).toUpperCase() || "C"}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{project.customerId.name}</p>
                                    <p className="text-[11px] text-[#6B7280]">{project.customerId.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Task Creation Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl w-full max-w-lg overflow-hidden ">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-[#121212]">
                            <h3 className="font-bold text-lg text-white">Create New Task</h3>
                            <button onClick={() => setShowTaskModal(false)} className="text-[#6B7280] hover:text-red-500"><FaTimes size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Task Title</label>
                                <input required type="text" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-blue-400 outline-none" placeholder="E.g. Foundation Work" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Description</label>
                                <textarea value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} rows="3" className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-blue-400 outline-none" placeholder="Describe the task"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Assign To (Architect)</label>
                                <select value={taskData.assignedTo} onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })} className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-blue-400 outline-none">
                                    <option value="">Unassigned</option>
                                    {project.architectId && (
                                        <option value={project.architectId._id}>{project.architectId.name}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Due Date & Time</label>
                                <input type="datetime-local" value={taskData.dueDate} onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })} className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-blue-400 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Image Links (Comma-separated URLs)</label>
                                <textarea 
                                    value={taskData.imageLinks} 
                                    onChange={(e) => setTaskData({ ...taskData, imageLinks: e.target.value })} 
                                    rows="2" 
                                    className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-blue-400 outline-none" 
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                ></textarea>
                                <p className="text-[10px] text-[#6B7280] mt-1">Provide external image URLs to show as milestone banners.</p>
                            </div>
                            <button type="submit" className="w-full bg-white text-black hover:bg-gray-200 text-white py-3 rounded-xl font-bold mt-4 transition">
                                Save Task
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProject;
