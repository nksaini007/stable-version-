import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WebAPI, { API_BASE } from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import { FaArrowLeft, FaFileAlt, FaUpload, FaTasks, FaPlus, FaCheck, FaSpinner, FaMapMarkerAlt, FaFilePdf, FaImage } from "react-icons/fa";
import { toast } from "react-hot-toast";


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
            const { data: projData } = await WebAPI.get("/construction/architect/projects");
            const current = projData.projects.find(p => p._id === projectId);
            if (!current) {
                toast.error("Project not found or access denied.");
                navigate("/architect");
                return;
            }
            setProject(current);

            // Fetch Tasks
            const { data: taskData } = await WebAPI.get(`/construction/project/${projectId}/tasks`);
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
            const { data } = await WebAPI.post(`/construction/project/${projectId}/blueprint`, formData, {
                headers: {
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
            const { data } = await WebAPI.post(`/construction/project/${projectId}/task`, {
                projectId,
                title: newTaskTitle,
                description: newTaskDesc,
                dueDate: newTaskDate || undefined
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
        <div className="p-6 md:p-12 text-white min-h-screen bg-[#080808] font-sans selection:bg-white/10">

            {/* Header Area */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-12 flex flex-col md:flex-row md:items-center gap-8"
            >
                <button 
                    onClick={() => navigate("/architect")} 
                    className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-500 shadow-inner group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-1 bg-white/[0.03] text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg border border-white/[0.05]">{project.type}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{project.status}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">{project.name}</h1>
                    <p className="text-gray-500 text-[11px] font-medium tracking-widest uppercase mt-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="opacity-30" /> {project.location}
                    </p>
                </div>
            </motion.div>

            {/* Main Content Card */}
            <div className="bg-[#121214] border border-white/[0.03] rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* Internal Tabs */}
                <div className="flex border-b border-white/[0.03] p-2">
                    <button
                        onClick={() => setActiveTab("blueprints")}
                        className={`flex-1 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-2xl flex items-center justify-center gap-3 ${activeTab === "blueprints" ? "bg-white/[0.03] text-white border border-white/[0.05]" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <FaFileAlt className="opacity-40" /> Design & Blueprints
                    </button>
                    <button
                        onClick={() => setActiveTab("milestones")}
                        className={`flex-1 py-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-2xl flex items-center justify-center gap-3 ${activeTab === "milestones" ? "bg-white/[0.03] text-white border border-white/[0.05]" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <FaTasks className="opacity-40" /> Milestones & Tasks
                    </button>
                </div>

                <div className="p-8 md:p-12">

                    {/* ================= BLUEPRINTS TAB ================= */}
                    {activeTab === "blueprints" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white tracking-tight uppercase">Project Blueprints</h2>
                            </div>

                            {/* Upload Form - Premium Subtle */}
                            <form onSubmit={handleBlueprintUpload} className="bg-white/[0.01] p-10 rounded-[2rem] border border-white/[0.03] border-dashed hover:border-white/10 transition-colors">
                                <h3 className="text-[10px] font-bold text-gray-500 mb-8 uppercase tracking-[0.2em]">Upload Architectural Design</h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <input
                                        type="text"
                                        placeholder="Blueprint Nomenclature..."
                                        value={blueprintTitle}
                                        onChange={e => setBlueprintTitle(e.target.value)}
                                        className="flex-1 bg-white/[0.02] border border-white/[0.05] px-6 py-4 rounded-[1.2rem] text-sm text-white focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-gray-800"
                                        required
                                    />
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={e => setBlueprintFile(e.target.files[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="bg-white/[0.02] border border-white/[0.05] px-6 py-4 rounded-[1.2rem] text-[11px] font-bold text-gray-500 group-hover:text-white transition-colors uppercase tracking-widest whitespace-nowrap flex items-center gap-3">
                                            {blueprintFile ? blueprintFile.name.substring(0, 15) + "..." : <><FaUpload className="opacity-30" /> Select Asset</>}
                                        </div>
                                    </div>
                                    <button
                                        disabled={uploadingBlueprint}
                                        type="submit"
                                        className="px-10 py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all duration-500 shadow-xl disabled:opacity-50"
                                    >
                                        {uploadingBlueprint ? <FaSpinner className="animate-spin" /> : "Initiate Upload"}
                                    </button>
                                </div>
                            </form>

                            {/* Blueprint Grid */}
                            {project.blueprints && project.blueprints.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {project.blueprints.map((bp) => (
                                        <div key={bp._id} className="bg-[#0C0C0C] border border-white/[0.03] rounded-[2rem] overflow-hidden group hover:border-white/10 transition-all duration-500">
                                            <div className="h-48 bg-white/[0.01] flex items-center justify-center relative overflow-hidden">
                                                {bp.fileUrl.endsWith('.pdf') ? (
                                                    <FaFilePdf className="text-6xl text-gray-800" />
                                                ) : (
                                                    <img src={getOptimizedImage(bp.fileUrl, 400)} alt={bp.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                                                )}
                                                <a
                                                    href={getOptimizedImage(bp.fileUrl, 1200)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] gap-3"
                                                >
                                                    Inspect Archive <FaArrowLeft className="rotate-180" />
                                                </a>
                                            </div>
                                            <div className="p-6">
                                                <p className="font-bold text-white text-[13px] uppercase tracking-tight line-clamp-1">{bp.title}</p>
                                                <div className="flex justify-between items-center mt-4">
                                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{new Date(bp.uploadedAt).toLocaleDateString()}</p>
                                                    <span className="text-[9px] text-gray-800 font-black uppercase tracking-widest flex items-center gap-1"><FaCheck className="text-[8px]" /> Verified</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white/[0.01] rounded-[2.5rem] border border-white/[0.03] border-dashed">
                                    <FaImage className="text-5xl mx-auto mb-6 text-gray-800 opacity-30" />
                                    <h3 className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.3em]">Vault Empty</h3>
                                    <p className="text-gray-700 mt-3 text-xs tracking-widest">Awaiting architectural documentation.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ================= MILESTONES TAB ================= */}
                    {activeTab === "milestones" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white tracking-tight uppercase">Operational Milestones</h2>
                                <button
                                    onClick={() => setShowNewTask(!showNewTask)}
                                    className="px-6 py-2.5 bg-white text-black rounded-[0.9rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 flex items-center gap-3 shadow-xl"
                                >
                                    <FaPlus className="text-[9px]" /> New Entry
                                </button>
                            </div>

                            {/* New Milestone Form */}
                            <AnimatePresence>
                                {showNewTask && (
                                    <motion.form 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: 'auto' }} 
                                        exit={{ opacity: 0, height: 0 }}
                                        onSubmit={handleCreateTask} 
                                        className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/[0.03] mb-12 overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Milestone Objective..."
                                                    value={newTaskTitle}
                                                    onChange={e => setNewTaskTitle(e.target.value)}
                                                    className="w-full bg-white/[0.02] border border-white/[0.05] px-6 py-4 rounded-[1.2rem] text-sm text-white focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-gray-800"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Deadline Date</label>
                                                <input
                                                    type="date"
                                                    value={newTaskDate}
                                                    onChange={e => setNewTaskDate(e.target.value)}
                                                    className="w-full bg-white/[0.02] border border-white/[0.05] px-6 py-4 rounded-[1.2rem] text-sm text-gray-400 focus:outline-none focus:border-white/20 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-8">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Detailed Specifications</label>
                                            <textarea
                                                placeholder="Clarify operational requirements..."
                                                value={newTaskDesc}
                                                onChange={e => setNewTaskDesc(e.target.value)}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] px-6 py-4 rounded-[1.2rem] text-sm text-white focus:outline-none focus:border-white/20 transition-all font-medium h-32 placeholder:text-gray-800 resize-none"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-6 items-center">
                                            <button type="button" onClick={() => setShowNewTask(false)} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Discard</button>
                                            <button type="submit" className="px-10 py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 shadow-xl">Commit Milestone</button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {/* Task List - Premium Cards */}
                            <div className="space-y-6">
                                {tasks.length === 0 ? (
                                    <div className="py-24 text-center bg-white/[0.01] rounded-[2.5rem] border border-white/[0.03] border-dashed">
                                        <FaTasks className="text-5xl mx-auto mb-6 text-gray-800 opacity-30" />
                                        <h3 className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.3em]">Operational Vacuum</h3>
                                        <p className="text-gray-700 mt-3 text-xs tracking-widest">No site logs currently registered.</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <div key={task._id} className="bg-[#0C0C0C] border border-white/[0.03] p-8 rounded-[2rem] hover:bg-[#101012] transition-all duration-500 group flex flex-col md:flex-row gap-8 md:items-center">
                                            <div className="flex-shrink-0">
                                                {task.status === "Completed" ? (
                                                    <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]"><FaCheck size={14} /></div>
                                                ) : task.status === "In Progress" ? (
                                                    <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/20 flex items-center justify-center text-white"><FaSpinner className="animate-spin" size={14} /></div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl border border-white/[0.05] bg-white/[0.01] flex items-center justify-center text-gray-800"><div className="w-2 h-2 rounded-full bg-current"></div></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-2 group-hover:tracking-wide transition-all duration-500">{task.title}</h4>
                                                <p className="text-[13px] text-gray-600 font-medium leading-relaxed max-w-2xl">{task.description}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                                <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg border ${
                                                    task.status === "Completed" ? "bg-white/5 border-white/20 text-white" :
                                                    task.status === "In Progress" ? "bg-white/10 border-white/10 text-white" : 
                                                    "bg-transparent border-white/[0.03] text-gray-600"
                                                }`}>
                                                    {task.status}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest bg-white/[0.02] px-3 py-1 rounded-lg border border-white/[0.03]">
                                                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ArchitectActiveProjectDetails;
