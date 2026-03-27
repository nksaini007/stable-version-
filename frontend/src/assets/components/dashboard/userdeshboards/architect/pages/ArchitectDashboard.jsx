import React, { useState, useEffect, useContext, useMemo } from "react";
import WebAPI from "../../../../../api/api";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaSpinner, FaCloudUploadAlt, FaBuilding, FaTasks, FaHardHat, FaMapMarkerAlt, FaTimes, FaSearch, FaFilter, FaArrowRight, FaImage, FaCalendarAlt, FaRegCalendarAlt, FaBullhorn, FaPaperPlane, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ArchitectDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("Overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [statusInput, setStatusInput] = useState("");
    const [evidenceFiles, setEvidenceFiles] = useState([]);

    // Project Updates (Feed) state
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false); // Fix: Added missing state
    const [updateTitle, setUpdateTitle] = useState("");
    const [updatePhase, setUpdatePhase] = useState(""); // Fix: Added missing state
    const [updateContent, setUpdateContent] = useState("");
    const [updateImageFiles, setUpdateImageFiles] = useState([]);
    const [projectUpdates, setProjectUpdates] = useState([]);
    const [updatesLoading, setUpdatesLoading] = useState(false);
    const [postingUpdate, setPostingUpdate] = useState(false);

    useEffect(() => {
        if (token) {
            fetchProjects();
        }
    }, [token]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await WebAPI.get("/construction/architect/projects");

            const projectsData = res.data.projects;

            const projectsWithTasks = await Promise.all(projectsData.map(async (p) => {
                const tRes = await WebAPI.get(`/construction/project/${p._id}/tasks`);
                return { ...p, tasks: tRes.data.tasks };
            }));

            setProjects(projectsWithTasks);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to load your projects.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;

        try {
            const formData = new FormData();
            formData.append("status", statusInput);
            evidenceFiles.forEach(file => formData.append("images", file));

            const res = await WebAPI.put(`/construction/task/${selectedTask._id}/progress`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Task updated successfully!");

            // Update local state to reflect changes instantly without full reload
            const updatedTask = res.data.task;

            setProjects(prevProjects => prevProjects.map(p => {
                if (p._id === updatedTask.projectId) {
                    const updatedTasks = p.tasks.map(t => t._id === updatedTask._id ? { ...t, status: updatedTask.status, images: updatedTask.images } : t);
                    return { ...p, tasks: updatedTasks };
                }
                return p;
            }));

            if (selectedProject) {
                setSelectedProject(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t => t._id === updatedTask._id ? { ...t, status: updatedTask.status, images: updatedTask.images } : t)
                }));
            }

            setSelectedTask(null);
            setStatusInput("");
            setEvidenceFiles([]);

            // Background fetch to get accurate progress % from server
            fetchProjects();
        } catch (error) {
            console.error("Task update error:", error);
            toast.error("Failed to update task.");
        }
    };

    // Fetch project updates
    const fetchProjectUpdates = async (projectId) => {
        try {
            setUpdatesLoading(true);
            const res = await WebAPI.get(`/construction/project/${projectId}/updates`);
            setProjectUpdates(res.data.updates);
        } catch (error) {
            console.error("Error fetching updates:", error);
        } finally {
            setUpdatesLoading(false);
        }
    };

    // Post a new project update
    const handlePostUpdate = async (e) => {
        e.preventDefault();
        if (!selectedProject) return;
        try {
            setPostingUpdate(true);
            const formData = new FormData();
            formData.append("title", updateTitle);
            formData.append("content", updateContent);
            updateImageFiles.forEach(file => formData.append("images", file));

            await WebAPI.post(`/construction/project/${selectedProject._id}/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Update posted successfully!");
            setUpdateTitle("");
            setUpdateContent("");
            setUpdateImageFiles([]);
            setShowUpdateForm(false);
            fetchProjectUpdates(selectedProject._id);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post update");
        } finally {
            setPostingUpdate(false);
        }
    };

    // Fix: Added missing handleUpdateSubmit for the milestone modal
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject) return;
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("title", updatePhase);
            formData.append("content", updateContent);
            // Reusing updateImageFiles for consistency if any were selected
            // But this modal doesn't have an image input in its current JSX form
            
            await WebAPI.post(`/construction/project/${selectedProject._id}/update`, formData);
            
            toast.success("Milestone logged successfully!");
            setUpdatePhase("");
            setUpdateContent("");
            setShowUpdateModal(false);
            fetchProjectUpdates(selectedProject._id);
        } catch (error) {
            toast.error("Failed to log milestone.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate Overview Metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "In Progress").length;
    const allTasks = useMemo(() => projects.flatMap(p => p.tasks), [projects]);
    const pendingTasks = allTasks.filter(t => t.status !== "Completed").length;
    const overallProgress = totalProjects > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / totalProjects) : 0;

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [projects, searchTerm, statusFilter]);

    if (loading && projects.length === 0) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-12 text-white min-h-screen bg-[#080808] font-sans selection:bg-white/10">
            {/* Header Area */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-12 flex flex-col md:flex-row md:justify-between md:items-center gap-8"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
                        Architect <span className="text-gray-500 font-light">Panel</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-gray-500 text-[13px] font-medium tracking-wide uppercase">
                            Operational / {user?.name || 'Architect'}
                        </p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-[#121214] p-1.5 rounded-[1.2rem] border border-white/[0.03] self-start md:self-auto shadow-2xl">
                    {["Overview", "Projects", "Calendar"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-[0.9rem] text-[13px] font-semibold transition-all duration-500 ${activeTab === tab
                                ? "bg-[#1A1A1C] text-white border border-white/5 shadow-lg"
                                : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* TAB CONTENT: OVERVIEW */}
            <AnimatePresence mode="wait">
                {activeTab === "Overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="space-y-12"
                    >
                        {/* Metrics Grid - Minimalist Premium Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Total Assignments", value: totalProjects, icon: <FaBuilding className="opacity-40" />, detail: "All time assets" },
                                { label: "Active Sites", value: activeProjects, icon: <FaSpinner className="opacity-40 animate-spin-slow" />, detail: "In execution phase" },
                                { label: "Pending Tasks", value: pendingTasks, icon: <FaTasks className="opacity-40" />, detail: "Requiring attention" },
                                { label: "Avg Completion", value: `${overallProgress}%`, icon: <FaCheckCircle className="opacity-40" />, detail: "Portfolio health" },
                            ].map((stat, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                                    key={idx}
                                    className="bg-[#121214] border border-white/[0.03] rounded-[2rem] p-8 hover:bg-[#161618] transition-all duration-500 group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-white/[0.02] rounded-2xl border border-white/[0.05] text-white">
                                            {stat.icon}
                                        </div>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{stat.label.split(' ')[0]}</div>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">{stat.value}</h3>
                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-[0.1em]">{stat.label}</p>
                                        <p className="text-[10px] text-gray-600 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{stat.detail}</p>
                                    </div>
                                    {/* Subtle corner glow */}
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-white/[0.03] transition-all duration-700"></div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity / Highlights */}
                        <div className="pt-6">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight uppercase">Active Projects</h2>
                                    <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Recently updated architectural sites</p>
                                </div>
                                <button onClick={() => setActiveTab("Projects")} className="text-gray-400 hover:text-white text-[12px] font-bold flex items-center gap-2 transition-colors uppercase tracking-widest">
                                    View Repository <FaArrowRight className="text-[10px]" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.filter(p => p.status === "In Progress").slice(0, 3).map(p => (
                                    <div key={p._id} onClick={() => { setSelectedProject(p); fetchProjectUpdates(p._id); }} className="bg-[#121214] hover:bg-[#161618] border border-white/[0.03] hover:border-white/[0.1] rounded-[2rem] p-8 transition-all duration-500 cursor-pointer shadow-2xl group flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-8">
                                            <span className="px-3 py-1 bg-white/[0.02] text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/[0.05]">{p.type}</span>
                                            <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold"><FaMapMarkerAlt className="inline mr-1" /> {p.location.split(',')[0]}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-6 group-hover:tracking-wide transition-all duration-500 flex-1">{p.name}</h3>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                                <span>Phase Progress</span>
                                                <span className="text-white">{p.progressPercentage || 0}%</span>
                                            </div>
                                            <div className="w-full bg-white/[0.02] rounded-full h-[3px] overflow-hidden">
                                                <div className="bg-white h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_white]" style={{ width: `${p.progressPercentage || 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {projects.filter(p => p.status === "In Progress").length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-600 bg-[#121214]/50 rounded-[2rem] border border-white/[0.03] border-dashed">
                                        No active projects in the current cycle.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB CONTENT: PROJECTS */}
                {activeTab === "Projects" && (
                    <motion.div
                        key="projects"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="space-y-10"
                    >
                        {/* Search & Filters Repository Style */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Project Repository..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#121214] border border-white/[0.03] rounded-[1.5rem] pl-16 pr-6 py-5 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all font-medium tracking-wide placeholder:text-gray-700"
                                />
                            </div>
                            <div className="relative min-w-[240px]">
                                <FaFilter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full bg-[#121214] border border-white/[0.03] rounded-[1.5rem] pl-16 pr-6 py-5 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all appearance-none cursor-pointer font-bold uppercase tracking-widest"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Planning">Planning</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Projects Repository Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {filteredProjects.length === 0 ? (
                                <div className="lg:col-span-2 py-32 text-center bg-[#121214]/50 rounded-[2.5rem] border border-white/[0.03] border-dashed">
                                    <FaBuilding className="text-6xl text-gray-800 mx-auto mb-6 opacity-30" />
                                    <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">Repository Empty</h3>
                                    <p className="text-gray-700 mt-3 text-sm tracking-wide">Adjust filters to broaden search range.</p>
                                </div>
                            ) : (
                                filteredProjects.map((project, i) => (
                                    <motion.div
                                        key={project._id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05, duration: 0.6 }}
                                        onClick={() => { setSelectedProject(project); fetchProjectUpdates(project._id); }}
                                        className="bg-[#121214] hover:bg-[#161618] border border-white/[0.03] rounded-[2.5rem] p-4 group cursor-pointer transition-all duration-500"
                                    >
                                        <div className="p-8 flex flex-col h-full relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.005] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/[0.015] transition-all duration-700"></div>

                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-white/[0.02] text-gray-500 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-white/[0.05]">{project.type}</span>
                                                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg border ${
                                                        project.status === "Completed" ? "bg-white/5 text-white border-white/20" :
                                                        project.status === "In Progress" ? "bg-white/10 text-white border-white/10" :
                                                        "bg-transparent text-gray-600 border-white/[0.03]"
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:bg-white group-hover:text-black text-gray-500 transition-all duration-500 border border-white/[0.05]">
                                                    <FaArrowRight className="text-sm" />
                                                </div>
                                            </div>

                                            <h2 className="text-2xl font-bold text-white mb-3 group-hover:tracking-tight transition-all duration-500">{project.name}</h2>
                                            <p className="text-sm text-gray-600 flex items-center gap-2 mb-10 uppercase tracking-widest font-medium"><FaMapMarkerAlt className="text-current opacity-40" /> {project.location}</p>

                                            <div className="grid grid-cols-2 gap-6 mb-10">
                                                <div className="bg-white/[0.01] p-5 rounded-[1.5rem] border border-white/[0.03]">
                                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest block mb-2">Commissioned</span>
                                                    <span className="text-[13px] text-gray-300 font-bold flex items-center gap-2 tracking-wide"><FaCalendarAlt className="opacity-30" /> {new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="bg-white/[0.01] p-5 rounded-[1.5rem] border border-white/[0.03]">
                                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest block mb-2">Milestones</span>
                                                    <span className="text-[13px] text-gray-300 font-bold flex items-center gap-2 tracking-wide"><FaTasks className="opacity-30" /> {project.tasks.filter(t => t.status === 'Completed').length} / {project.tasks.length}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex justify-between text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-3">
                                                    <span>Completion Status</span>
                                                    <span className="text-white">{project.progressPercentage || 0}%</span>
                                                </div>
                                                <div className="w-full bg-white/[0.02] rounded-full h-[4px] overflow-hidden">
                                                    <div
                                                        className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_white]"
                                                        style={{ width: `${project.progressPercentage || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* TAB CONTENT: CALENDAR */}
                {activeTab === "Calendar" && (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                        {(() => {
                            const year = calendarMonth.getFullYear();
                            const month = calendarMonth.getMonth();
                            const firstDay = new Date(year, month, 1).getDay();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const today = new Date();
                            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                            // Get all tasks - use dueDate if set, otherwise fall back to createdAt
                            const getTaskDate = (t) => t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);

                            const getTasksForDay = (day) => {
                                return allTasks.filter(t => {
                                    const d = getTaskDate(t);
                                    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                                });
                            };

                            // Get project name for a task
                            const getProjectForTask = (task) => {
                                return projects.find(p => p._id === task.projectId);
                            };

                            const dayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

                            return (
                                <div className="max-w-6xl mx-auto font-sans text-white">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                                        {/* Left Side: Calendar Container (Premium Monochromatic) */}
                                        <div className="lg:col-span-8 bg-[#121214] border border-white/[0.03] p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative">

                                            {/* Calendar Header */}
                                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]">
                                                <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/[0.03] text-gray-500 hover:text-white hover:bg-white/[0.02] transition-all duration-500 shadow-inner">
                                                    <FaChevronLeft className="text-xs" />
                                                </button>
                                                <h2 className="text-[15px] font-bold uppercase tracking-[0.4em] text-white">
                                                    {monthNames[month]} <span className="text-gray-600 font-light ml-2">{year}</span>
                                                </h2>
                                                <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/[0.03] text-gray-500 hover:text-white hover:bg-white/[0.02] transition-all duration-500 shadow-inner">
                                                    <FaChevronRight className="text-xs" />
                                                </button>
                                            </div>

                                            {/* Calendar Grid */}
                                            <div>
                                                {/* Day Names */}
                                                <div className="grid grid-cols-7 gap-1 mb-6">
                                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                                        <div key={d} className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-gray-700 pb-4">{d}</div>
                                                    ))}
                                                </div>

                                                {/* Day Cells */}
                                                <div className="grid grid-cols-7 gap-3">
                                                    {/* Empty cells */}
                                                    {Array.from({ length: firstDay }).map((_, i) => (
                                                        <div key={`empty-${i}`} className="aspect-square opacity-20"></div>
                                                    ))}

                                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                                        const day = i + 1;
                                                        const dayTasksList = getTasksForDay(day);
                                                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                                        const isSelected = selectedDay === day;

                                                        return (
                                                            <div
                                                                key={day}
                                                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                                                className={`relative aspect-square flex flex-col items-center justify-center rounded-[1.2rem] cursor-pointer transition-all duration-500 border group ${
                                                                    isSelected ? "bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.1)]" :
                                                                    isToday ? "bg-white/[0.05] border-white/10" :
                                                                    dayTasksList.length > 0 ? "bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10" : 
                                                                    "bg-transparent border-transparent hover:bg-white/[0.01] hover:border-white/[0.03]"
                                                                }`}
                                                            >
                                                                <span className={`text-[13px] font-bold tracking-tighter ${
                                                                    isSelected ? "text-black" :
                                                                    isToday ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                                                                }`}>{day}</span>

                                                                {/* Task markers (Sleek minimalist dots) */}
                                                                {dayTasksList.length > 0 && (
                                                                    <div className="absolute bottom-3 flex gap-1 justify-center w-full">
                                                                        {dayTasksList.slice(0, 3).map((t, idx) => (
                                                                            <div key={idx} className={`w-1 h-1 rounded-full ${
                                                                                isSelected ? "bg-black/30" : 
                                                                                t.status === "Completed" ? "bg-white/20" :
                                                                                t.status === "In Progress" ? "bg-white/60 shadow-[0_0_5px_white]" : "bg-gray-800"
                                                                            }`}></div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Legend */}
                                            <div className="flex justify-start gap-8 items-center mt-12 pt-6 border-t border-white/[0.03] text-[9px] uppercase font-bold tracking-[0.2em] text-gray-600">
                                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-800"></span> Pending</span>
                                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_white]"></span> In Progress</span>
                                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> Completed</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Selected Day Tasks (Premium Info Panel) */}
                                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                                            {selectedDay ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-[#121214] border border-white/[0.03] rounded-[2.5rem] p-8 shadow-2xl"
                                                >
                                                    <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/[0.03]">
                                                        <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center text-xl font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                                            {selectedDay}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-white">{monthNames[month]}</h3>
                                                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Daily Manifest</p>
                                                        </div>
                                                    </div>

                                                    {dayTasks.length === 0 ? (
                                                        <div className="text-center py-20 bg-white/[0.01] rounded-[1.5rem] border border-dashed border-white/[0.03]">
                                                            <FaCalendarAlt className="text-gray-800 text-3xl mx-auto mb-4 opacity-30" />
                                                            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">Zero Engagements</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4 max-h-[440px] overflow-y-auto no-scrollbar pr-1">
                                                            {dayTasks.map(task => {
                                                                const proj = getProjectForTask(task);
                                                                return (
                                                                    <div key={task._id} className="bg-white/[0.02] p-6 rounded-[1.5rem] border border-white/[0.03] hover:border-white/10 transition-all duration-500 group relative overflow-hidden">
                                                                        {/* Status Glow */}
                                                                        <div className={`absolute top-0 right-0 w-12 h-12 blur-2xl opacity-10 transition-all ${
                                                                            task.status === "Completed" ? "bg-white" :
                                                                            task.status === "In Progress" ? "bg-white" : "bg-transparent"
                                                                        }`}></div>

                                                                        <div className="flex justify-between items-start mb-4">
                                                                            <span className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest rounded-lg border ${
                                                                                task.status === "Completed" ? "bg-white/5 border-white/20 text-white" :
                                                                                task.status === "In Progress" ? "bg-white/10 border-white/10 text-white" : 
                                                                                "bg-transparent border-white/[0.03] text-gray-600"
                                                                            }`}>
                                                                                {task.status}
                                                                            </span>
                                                                        </div>

                                                                        <h4 className="font-bold text-[15px] leading-snug mb-3 group-hover:tracking-tight transition-all duration-500 pr-4">{task.title}</h4>

                                                                        {proj && (
                                                                            <p className="text-[9px] font-bold text-gray-500 mb-6 flex items-center gap-2 uppercase tracking-[0.1em] border-t border-white/[0.03] pt-4 mt-4">
                                                                                <FaBuilding className="opacity-30" /> {proj.name}
                                                                            </p>
                                                                        )}

                                                                        <div className="flex items-center gap-2 text-[8px] font-bold pt-1 text-gray-600 uppercase tracking-[0.2em]">
                                                                            <FaCalendarAlt className="opacity-30" />
                                                                            <span>
                                                                                {task.dueDate ? "Deadline " : "Entry "}{getTaskDate(task).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="bg-[#121214] border border-white/[0.03] border-dashed rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center min-h-[480px] shadow-inner opacity-60">
                                                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-8">
                                                        <FaRegCalendarAlt className="text-gray-700 text-3xl opacity-50" />
                                                    </div>
                                                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-4 text-gray-500">Global Agenda</h3>
                                                    <p className="text-[10px] font-medium text-gray-700 uppercase tracking-[0.2em] leading-loose max-w-[220px]">Pick a timestamp to audit architectural events.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PROJECT DETAILS MODAL */}
            <AnimatePresence>
                {selectedProject && !selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-40 p-4 md:p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0a0f1c] w-full max-w-5xl max-h-[90vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative"
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 bg-[#1e293b]/50 border-b border-white/10 flex justify-between items-start shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <div className="relative z-10 w-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-white/10 text-gray-200 text-xs font-bold uppercase tracking-wider rounded-lg backdrop-blur-md">{selectedProject.type}</span>
                                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-500/30">{selectedProject.status}</span>
                                        </div>
                                        <button onClick={() => setSelectedProject(null)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors border border-white/10">
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{selectedProject.name}</h2>
                                    <p className="text-gray-400 flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-400" /> {selectedProject.location}</p>
                                </div>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#0a0f1c]">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Col: Info */}
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-[#1e293b]/40 rounded-3xl p-6 border border-white/5">
                                            <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                                                    <p className="text-sm text-gray-300 leading-relaxed">{selectedProject.description}</p>
                                                </div>
                                                <div className="pt-4 border-t border-white/5 flex justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
                                                        <p className="text-sm text-white">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                                                    </div>
                                                    {selectedProject.endDate && (
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target End</p>
                                                            <p className="text-sm text-white">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedProject.customerId && (
                                                    <div className="pt-4 border-t border-white/5">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Client</p>
                                                        <p className="text-sm text-white">{selectedProject.customerId.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl p-6 border border-indigo-500/20 text-center">
                                            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">Overall Progress</h3>
                                            <div className="text-5xl font-black text-white mb-4">{selectedProject.progressPercentage || 0}<span className="text-2xl text-indigo-400">%</span></div>
                                            <div className="w-full bg-[#0f172a] rounded-full h-3 overflow-hidden border border-white/10">
                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${selectedProject.progressPercentage || 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Col: Tasks Layout */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-white">Project Timeline Tasks</h3>
                                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-400 border border-white/10">{selectedProject.tasks.length} Total Tasks</span>
                                        </div>

                                        {selectedProject.tasks.length === 0 ? (
                                            <div className="bg-[#1e293b]/30 border border-white/5 border-dashed rounded-3xl p-12 text-center text-gray-500">
                                                <FaTasks className="text-4xl mx-auto mb-3 opacity-50" />
                                                <p>No tasks have been assigned to this project yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedProject.tasks.map(task => (
                                                    <div key={task._id} className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-5 rounded-2xl border border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5 group">
                                                        <div className="flex-1 flex gap-4">
                                                            <div className={`mt-1 w-10 h-10 shrink-0 rounded-full flex items-center justify-center border ${task.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                                                task.status === "In Progress" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                                                                    "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                                                }`}>
                                                                {task.status === "Completed" ? <FaCheckCircle /> : task.status === "In Progress" ? <FaSpinner className="animate-spin" /> : <FaTasks />}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-base mb-1 group-hover:text-indigo-300 transition-colors">{task.title}</h4>
                                                                <p className="text-sm text-gray-400 leading-relaxed mb-2">{task.description}</p>
                                                                {task.dueDate && (
                                                                    <p className="text-xs text-indigo-400 flex items-center gap-1.5 mb-2">
                                                                        <FaCalendarAlt /> {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(task.dueDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                )}
                                                                {task.images && task.images.length > 0 && (
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 w-fit px-3 py-1.5 rounded-lg border border-indigo-500/20">
                                                                        <FaImage /> {task.images.length} Evidence Attached
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-3 border-t border-white/5 sm:border-t-0 pt-4 sm:pt-0">
                                                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${task.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                                                                task.status === "In Progress" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                                                    "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                                }`}>
                                                                {task.status}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTask(task);
                                                                    setStatusInput(task.status);
                                                                    setEvidenceFiles([]);
                                                                }}
                                                                className="px-6 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                                            >
                                                                Update Status
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* POST UPDATE SECTION */}
                                        <div className="mt-10 pt-8 border-t border-white/10">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><FaBullhorn className="text-indigo-400" /> Project Updates</h3>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setShowUpdateModal(true)}
                                                        className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-xl text-xs font-bold transition-all shadow-lg"
                                                    >
                                                        Log Milestone
                                                    </button>
                                                    <button
                                                        onClick={() => setShowUpdateForm(!showUpdateForm)}
                                                        className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-500/30"
                                                    >
                                                        {showUpdateForm ? 'Cancel' : '+ Post Update'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Post Update Form */}
                                            {showUpdateForm && (
                                                <form onSubmit={handlePostUpdate} className="bg-[#1e293b]/60 p-6 rounded-2xl border border-indigo-500/20 mb-6 space-y-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Update title..."
                                                        value={updateTitle}
                                                        onChange={(e) => setUpdateTitle(e.target.value)}
                                                        required
                                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                    />
                                                    <textarea
                                                        placeholder="Write your update for the client..."
                                                        value={updateContent}
                                                        onChange={(e) => setUpdateContent(e.target.value)}
                                                        required
                                                        rows={3}
                                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                                                    />
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Attach Images (optional)</label>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={(e) => setUpdateImageFiles(Array.from(e.target.files))}
                                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-300"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={postingUpdate}
                                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50"
                                                    >
                                                        <FaPaperPlane /> {postingUpdate ? 'Posting...' : 'Post Update'}
                                                    </button>
                                                </form>
                                            )}

                                            {/* Existing Updates List */}
                                            {updatesLoading ? (
                                                <p className="text-gray-500 text-sm">Loading updates...</p>
                                            ) : projectUpdates.length === 0 ? (
                                                <div className="bg-[#1e293b]/30 border border-white/5 border-dashed rounded-2xl p-8 text-center text-gray-500 text-sm">
                                                    No updates posted yet. Share progress with your client!
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {projectUpdates.map(upd => (
                                                        <div key={upd._id} className="bg-[#1e293b]/40 p-5 rounded-2xl border border-white/5">
                                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                                <h4 className="font-bold text-white text-sm">{upd.title}</h4>
                                                                <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(upd.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-400 leading-relaxed">{upd.content}</p>
                                                            {upd.images && upd.images.length > 0 && (
                                                                <div className="mt-3 flex gap-2 overflow-x-auto">
                                                                    {upd.images.map((img, i) => (
                                                                        <img key={i} src={getOptimizedImage(img, 300)} alt="Update" className="h-20 w-28 object-cover rounded-lg border border-white/10 flex-shrink-0" />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TASK UPDATE FORM MODAL */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="bg-[#1e293b] p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                            <button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors">
                                <FaTimes />
                            </button>

                            <h3 className="text-2xl font-black mb-2 text-white">Update Task</h3>
                            <p className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-4">{selectedTask.title}</p>

                            <form onSubmit={handleUpdateTask} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Progress Status</label>
                                    <select
                                        value={statusInput}
                                        onChange={(e) => setStatusInput(e.target.value)}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-4 py-4 appearance-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium text-white shadow-inner"
                                    >
                                        <option value="Pending">🚧 Pending</option>
                                        <option value="In Progress">⚙️ In Progress</option>
                                        <option value="Completed">✅ Completed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Site Evidence Photos</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setEvidenceFiles(Array.from(e.target.files))}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-4 py-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-white shadow-inner file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-300"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2 font-medium">Upload photos to document the current state of construction.</p>
                                </div>

                                <div className="flex gap-3 mt-8 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTask(null)}
                                        className="flex-1 py-4 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all text-sm font-bold"
                                    >
                                        Save Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Project Update Modal */}
            <AnimatePresence>
                {showUpdateModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUpdateModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-[#0A0A0B] border border-white/5 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
                        >
                            <div className="p-10">
                                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Log Milestone</h2>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-10">Asset: {selectedProject.name}</p>

                                <form onSubmit={handleUpdateSubmit} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Phase Identifier</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Foundation, Structural Integrity..."
                                            value={updatePhase}
                                            onChange={(e) => setUpdatePhase(e.target.value)}
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-gray-800"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Manifest Content</label>
                                        <textarea
                                            placeholder="Describe the milestone achievements or site status..."
                                            rows="4"
                                            value={updateContent}
                                            onChange={(e) => setUpdateContent(e.target.value)}
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-gray-800 resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUpdateModal(false)}
                                            className="flex-1 py-4 bg-transparent border border-white/[0.05] rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-all duration-500"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 disabled:opacity-50 shadow-xl"
                                        >
                                            {loading ? "Transmitting..." : "Commit Milestone"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global style for custom scrollbar within this component just to make it clean */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </div>
    );
};

export default ArchitectDashboard;
