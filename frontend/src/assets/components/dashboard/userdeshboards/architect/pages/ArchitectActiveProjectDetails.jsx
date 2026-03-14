import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../../../context/AuthContext";
import { FaArrowLeft, FaFileAlt, FaUpload, FaTasks, FaPlus, FaCheck, FaSpinner, FaMapMarkerAlt, FaFilePdf, FaImage } from "react-icons/fa";
import { toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ArchitectActiveProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tabs: 'blueprints', 'milestones'
    const [activeTab, setActiveTab] = useState("blueprints");

    // Blueprint Upload State
    const [blueprintFile, setBlueprintFile] = useState(null);
    const [blueprintTitle, setBlueprintTitle] = useState("");
    const [uploadingBlueprint, setUploadingBlueprint] = useState(false);

    // New Milestone State
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskDate, setNewTaskDate] = useState("");

    useEffect(() => {
        fetchProjectData();
    }, [projectId]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            // Get all architect projects, then find the specific one to reuse the endpoint
            const { data: projData } = await axios.get(`${API}/api/construction/architect/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const current = projData.projects.find(p => p._id === projectId);
            if (!current) {
                toast.error("Project not found or access denied.");
                navigate("/architect");
                return;
            }
            setProject(current);

            // Fetch Tasks
            const { data: taskData } = await axios.get(`${API}/api/construction/project/${projectId}/tasks`);
            setTasks(taskData.tasks || []);

        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load project details");
        } finally {
            setLoading(false);
        }
    };

    const handleBlueprintUpload = async (e) => {
        e.preventDefault();
        if (!blueprintFile) return toast.error("Please select a file.");

        const formData = new FormData();
        formData.append("blueprint", blueprintFile);
        formData.append("title", blueprintTitle || "Untitled Blueprint");

        try {
            setUploadingBlueprint(true);
            const { data } = await axios.post(`${API}/api/construction/project/${projectId}/blueprint`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success("Blueprint uploaded successfully");
            setProject(data.project);
            setBlueprintFile(null);
            setBlueprintTitle("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploadingBlueprint(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle) return toast.error("Title is required");

        try {
            const { data } = await axios.post(`${API}/api/construction/project/${projectId}/task`, {
                projectId,
                title: newTaskTitle,
                description: newTaskDesc,
                dueDate: newTaskDate || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Milestone created");
            setTasks([...tasks, data.task]);
            setShowNewTask(false);
            setNewTaskTitle("");
            setNewTaskDesc("");
            setNewTaskDate("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create milestone");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading project details...</div>;
    if (!project) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate("/architect")} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 text-gray-600">
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                        <FaMapMarkerAlt /> {project.location} • <span className="font-semibold text-orange-600">{project.status}</span>
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab("blueprints")}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "blueprints" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                    >
                        <FaFileAlt className="inline mr-2" /> Design & Blueprints
                    </button>
                    <button
                        onClick={() => setActiveTab("milestones")}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "milestones" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                    >
                        <FaTasks className="inline mr-2" /> Milestones & Tasks
                    </button>
                </div>

                <div className="p-6 w-full">

                    {/* ================= BLUEPRINTS TAB ================= */}
                    {activeTab === "blueprints" && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Project Blueprints</h2>
                            </div>

                            {/* Upload Form */}
                            <form onSubmit={handleBlueprintUpload} className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Upload New Design</h3>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="text"
                                        placeholder="Blueprint Title (e.g. Foundation Plan)"
                                        value={blueprintTitle}
                                        onChange={e => setBlueprintTitle(e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                    <input
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={e => setBlueprintFile(e.target.files[0])}
                                        className="block w-full md:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    <button
                                        disabled={uploadingBlueprint}
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap flex items-center justify-center gap-2 disabled:bg-indigo-400"
                                    >
                                        {uploadingBlueprint ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                                        Upload
                                    </button>
                                </div>
                            </form>

                            {/* Blueprint Grid */}
                            {project.blueprints && project.blueprints.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {project.blueprints.map((bp) => (
                                        <div key={bp._id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                                            <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden group">
                                                {bp.fileUrl.endsWith('.pdf') ? (
                                                    <FaFilePdf className="text-6xl text-red-400" />
                                                ) : (
                                                    <img src={`${API}${bp.fileUrl}`} alt={bp.title} className="w-full h-full object-cover" />
                                                )}
                                                <a
                                                    href={`${API}${bp.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flexitems-center justify-center transition flex text-white font-medium items-center gap-2"
                                                >
                                                    <FaCheck /> View Full
                                                </a>
                                            </div>
                                            <div className="p-4 bg-white">
                                                <p className="font-semibold text-gray-800 line-clamp-1">{bp.title}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(bp.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                                    <FaImage className="text-4xl mx-auto mb-3 text-gray-300" />
                                    <p>No blueprints or designs uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================= MILESTONES TAB ================= */}
                    {activeTab === "milestones" && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Project Milestones</h2>
                                <button
                                    onClick={() => setShowNewTask(!showNewTask)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
                                >
                                    <FaPlus /> Add Milestone
                                </button>
                            </div>

                            {/* New Milestone Form */}
                            {showNewTask && (
                                <form onSubmit={handleCreateTask} className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 mb-8 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Milestone Title (e.g. Foundation Complete)"
                                            value={newTaskTitle}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 w-full outline-none"
                                        />
                                        <input
                                            type="date"
                                            value={newTaskDate}
                                            onChange={e => setNewTaskDate(e.target.value)}
                                            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 w-full outline-none text-gray-600"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Milestone Description details..."
                                        value={newTaskDesc}
                                        onChange={e => setNewTaskDesc(e.target.value)}
                                        className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 w-full outline-none mb-4 h-24"
                                    />
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowNewTask(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Milestone</button>
                                    </div>
                                </form>
                            )}

                            {/* Task List */}
                            <div className="space-y-4">
                                {tasks.length === 0 ? (
                                    <p className="text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg">No milestones defined yet.</p>
                                ) : (
                                    tasks.map(task => (
                                        <div key={task._id} className="flex gap-4 p-5 rounded-xl border border-gray-100 shadow-sm bg-white hover:border-indigo-200 transition">
                                            <div className="mt-1">
                                                {task.status === "Completed" ? (
                                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600"><FaCheck size={12} /></div>
                                                ) : task.status === "In Progress" ? (
                                                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><FaSpinner className="animate-spin" size={12} /></div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-800">{task.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                <div className="flex gap-4 mt-3 text-xs font-semibold">
                                                    <span className={`px-2 py-1 rounded-md ${task.status === "Completed" ? "bg-green-50 text-green-700" :
                                                            task.status === "In Progress" ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-600"
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                    {task.dueDate && (
                                                        <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchitectActiveProjectDetails;
