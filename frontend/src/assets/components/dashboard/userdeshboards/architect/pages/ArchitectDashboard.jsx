import React, { useState, useEffect, useContext, useMemo } from "react";
import WebAPI from "../../../../../api/api";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaSpinner, FaCloudUploadAlt, FaBuilding, FaTasks, FaHardHat, FaMapMarkerAlt, FaTimes, FaSearch, FaFilter, FaArrowRight, FaImage, FaCalendarAlt, FaBullhorn, FaPaperPlane, FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
    const [updateTitle, setUpdateTitle] = useState("");
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
        <div className="p-4 md:p-8 text-white min-h-screen bg-[#0a0f1c]">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-5xl font-century text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 tracking-tight">
                        Architect Portal
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm md:text-base font-medium">
                       Welcome back, {user?.name || 'Architect'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#1e293b]/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md self-start md:self-auto shadow-xl">
                    {["Overview", "Projects", "Calendar"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
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
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: "Total Assignments", value: totalProjects, icon: <FaBuilding className="text-blue-400" />, bg: "from-blue-500/10 to-transparent", border: "border-blue-500/30" },
                                { label: "Active Sites", value: activeProjects, icon: <FaSpinner className="text-yellow-400 animate-spin-slow" />, bg: "from-yellow-500/10 to-transparent", border: "border-yellow-500/30" },
                                { label: "Pending Tasks", value: pendingTasks, icon: <FaTasks className="text-rose-400" />, bg: "from-rose-500/10 to-transparent", border: "border-rose-500/30" },
                                { label: "Avg Completion", value: `${overallProgress}%`, icon: <FaCheckCircle className="text-emerald-400" />, bg: "from-emerald-500/10 to-transparent", border: "border-emerald-500/30" },
                            ].map((stat, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className={`bg-gradient-to-br ${stat.bg} ${stat.border} border rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group`}
                                >
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">{stat.icon}</div>
                                    </div>
                                    <h3 className="text-4xl font-black text-white mb-1 relative z-10">{stat.value}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest relative z-10">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity / Highlights */}
                        <div>
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-2xl font-bold text-white/90">Projects In Progress</h2>
                                <button onClick={() => setActiveTab("Projects")} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2 transition-colors">
                                    View All <FaArrowRight />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.filter(p => p.status === "In Progress").slice(0, 3).map(p => (
                                    <div key={p._id} onClick={() => { setSelectedProject(p); fetchProjectUpdates(p._id); }} className="bg-[#1e293b]/60 hover:bg-[#1e293b] border border-white/10 hover:border-indigo-500/50 rounded-3xl p-6 transition-all cursor-pointer shadow-xl group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-500/30">{p.type}</span>
                                            <span className="text-gray-400 text-xs font-medium"><FaMapMarkerAlt className="inline mr-1" /> {p.location.split(',')[0]}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">{p.name}</h3>

                                        <div className="mb-2 flex justify-between text-xs font-bold text-gray-400">
                                            <span>Progress</span>
                                            <span className="text-white">{p.progressPercentage || 0}%</span>
                                        </div>
                                        <div className="w-full bg-[#0f172a] rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${p.progressPercentage || 0}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                                {projects.filter(p => p.status === "In Progress").length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e293b]/30 rounded-3xl border border-white/5 border-dashed">
                                        No active projects right now.
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
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search projects by name or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#1e293b]/80 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                />
                            </div>
                            <div className="relative min-w-[200px]">
                                <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full bg-[#1e293b]/80 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none shadow-inner cursor-pointer"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Planning">Planning</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Projects List Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredProjects.length === 0 ? (
                                <div className="lg:col-span-2 py-16 text-center bg-[#1e293b]/40 rounded-3xl border border-white/10">
                                    <FaBuilding className="text-5xl text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-300">No Projects Found</h3>
                                    <p className="text-gray-500 mt-2">Adjust your filters or await new assignments.</p>
                                </div>
                            ) : (
                                filteredProjects.map((project, i) => (
                                    <motion.div
                                        key={project._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => { setSelectedProject(project); fetchProjectUpdates(project._id); }}
                                        className="bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden hover:border-indigo-500/50 transition-all group flex flex-col cursor-pointer hover:shadow-indigo-500/10 hover:-translate-y-1"
                                    >
                                        <div className="p-6 relative overflow-hidden flex-1">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-all"></div>

                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-white/5 text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">{project.type}</span>
                                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${project.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                                                        project.status === "In Progress" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                                            "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-gray-400 transition-colors border border-white/10">
                                                    <FaArrowRight className="text-sm" />
                                                </div>
                                            </div>

                                            <h2 className="text-2xl font-black text-white mb-2">{project.name}</h2>
                                            <p className="text-sm text-gray-400 flex items-center gap-2 mb-6"><FaMapMarkerAlt className="text-indigo-400/70" /> {project.location}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Start Date</span>
                                                    <span className="text-sm text-white font-medium flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> {new Date(project.startDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Tasks</span>
                                                    <span className="text-sm text-white font-medium flex items-center gap-2"><FaTasks className="text-gray-400" /> {project.tasks.filter(t => t.status === 'Completed').length} / {project.tasks.length} Done</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                                    <span>Overall Completion</span>
                                                    <span className="text-indigo-300">{project.progressPercentage || 0}%</span>
                                                </div>
                                                <div className="w-full bg-[#0f172a] rounded-full h-2 overflow-hidden border border-white/5">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
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
                                <div className="max-w-5xl mx-auto font-sans text-zinc-100">
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                                        {/* Left Side: Calendar Container (Luxury Charcoal & Gold) */}
                                        <div className="lg:col-span-3 bg-[#0f0f11] border border-[#d4af37]/20 p-6 md:p-8 rounded-sm shadow-2xl relative">

                                            {/* Calendar Header */}
                                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                                                <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="w-10 h-10 flex items-center justify-center rounded-sm border border-zinc-800 text-zinc-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all">
                                                    <FaChevronLeft className="text-sm font-light" />
                                                </button>
                                                <h2 className="text-xl font-light uppercase tracking-[0.3em] text-zinc-100">{monthNames[month]} <span className="text-[#d4af37]">{year}</span></h2>
                                                <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="w-10 h-10 flex items-center justify-center rounded-sm border border-zinc-800 text-zinc-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all">
                                                    <FaChevronRight className="text-sm font-light" />
                                                </button>
                                            </div>

                                            {/* Calendar Grid */}
                                            <div>
                                                {/* Day Names */}
                                                <div className="grid grid-cols-7 gap-1 mb-4">
                                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                                        <div key={d} className="text-center text-[9px] uppercase font-light tracking-[0.2em] border-b border-zinc-800 text-zinc-500 pb-2">{d}</div>
                                                    ))}
                                                </div>

                                                {/* Day Cells */}
                                                <div className="grid grid-cols-7 gap-2">
                                                    {/* Empty cells */}
                                                    {Array.from({ length: firstDay }).map((_, i) => (
                                                        <div key={`empty-${i}`} className="aspect-square bg-[#18181b]/30 rounded-sm"></div>
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
                                                                className={`relative aspect-square p-2 flex flex-col items-center justify-center rounded-sm cursor-pointer transition-all duration-300 border ${isSelected ? "bg-[#d4af37]/10 border-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]" :
                                                                    isToday ? "bg-zinc-800/50 border-zinc-600" :
                                                                        dayTasksList.length > 0 ? "bg-[#18181b] border-zinc-800 hover:bg-zinc-800/80 hover:border-[#d4af37]/30" : "bg-[#0f0f11] border-transparent hover:border-zinc-800 hover:bg-zinc-900"
                                                                    }`}
                                                            >
                                                                <span className={`text-sm font-light ${isSelected ? "text-[#d4af37]" :
                                                                    isToday ? "text-zinc-100 font-normal" : "text-zinc-400"
                                                                    }`}>{day}</span>

                                                                {/* Task dots (Luxury style) */}
                                                                {dayTasksList.length > 0 && (
                                                                    <div className="absolute bottom-2 flex gap-1 justify-center w-full">
                                                                        {dayTasksList.slice(0, 3).map((t, idx) => (
                                                                            <div key={idx} className={`w-1 h-1 rounded-full ${t.status === "Completed" ? "bg-zinc-300" :
                                                                                t.status === "In Progress" ? "bg-[#d4af37]" : "bg-zinc-600"
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
                                            <div className="flex justify-between items-center mt-10 pt-4 border-t border-zinc-800 text-zinc-500 text-[9px] uppercase font-light tracking-[0.2em]">
                                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> Pending</span>
                                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span> In Progress</span>
                                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span> Completed</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Selected Day Tasks (Luxury Info Panel style) */}
                                        <div className="lg:col-span-2 space-y-4">
                                            {selectedDay ? (
                                                <div className="bg-[#0f0f11] border border-[#d4af37]/20 rounded-sm p-6 shadow-2xl sticky top-6">
                                                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
                                                        <div className="w-12 h-12 rounded-sm border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] flex items-center justify-center text-xl font-light">
                                                            {selectedDay}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-md font-light uppercase tracking-[0.3em] leading-none text-zinc-100">{monthNames[month]} {year}</h3>
                                                            <p className="text-[9px] font-light text-zinc-500 uppercase tracking-[0.3em] mt-2">Appointments</p>
                                                        </div>
                                                    </div>

                                                    {dayTasks.length === 0 ? (
                                                        <div className="text-center py-12 rounded-sm border border-dashed border-zinc-800/50 bg-[#18181b]/30">
                                                            <FaCalendarAlt className="text-zinc-700 text-3xl mx-auto mb-4 font-light" />
                                                            <p className="text-zinc-500 text-[10px] font-light uppercase tracking-[0.2em]">No Engagements Scheduled</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                            {dayTasks.map(task => {
                                                                const proj = getProjectForTask(task);
                                                                return (
                                                                    <div key={task._id} className="bg-[#18181b]/50 p-5 rounded-sm border border-zinc-800 hover:border-[#d4af37]/30 transition-all group relative">
                                                                        {/* Status Badge */}
                                                                        <div className="absolute top-4 right-4">
                                                                            <span className={`px-2 py-1 text-[8px] font-light uppercase tracking-[0.2em] rounded-sm border ${task.status === "Completed" ? "bg-zinc-100/5 border-zinc-100/20 text-zinc-300" :
                                                                                task.status === "In Progress" ? "bg-[#d4af37]/5 border-[#d4af37]/20 text-[#d4af37]" : "bg-zinc-800/50 border-zinc-700 text-zinc-500"
                                                                                }`}>
                                                                                {task.status}
                                                                            </span>
                                                                        </div>

                                                                        <h4 className="font-light text-lg leading-tight mb-2 pr-20 text-zinc-100">{task.title}</h4>

                                                                        {proj && (
                                                                            <p className="text-[10px] font-light text-[#d4af37]/70 mb-4 flex items-center gap-2 uppercase tracking-[0.1em]">
                                                                                <FaBuilding className="text-[#d4af37]/40" /> {proj.name}
                                                                            </p>
                                                                        )}

                                                                        <div className="flex items-center gap-2 text-[9px] font-light border-t border-zinc-800/50 pt-3 text-zinc-500 uppercase tracking-[0.2em]">
                                                                            <FaCalendarAlt className="text-zinc-600" />
                                                                            <span>
                                                                                {task.dueDate ? "Due " : "Logged "}{getTaskDate(task).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-[#0f0f11] border border-zinc-800 border-dashed rounded-sm p-10 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
                                                    <FaCalendarAlt className="text-zinc-800 text-5xl mb-6 font-light" />
                                                    <h3 className="text-lg font-light uppercase tracking-[0.3em] mb-3 text-zinc-300">Agenda</h3>
                                                    <p className="text-[10px] font-light text-zinc-600 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Select a date to view architectural engagements.</p>
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
                                                <button
                                                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                                                    className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-500/30"
                                                >
                                                    {showUpdateForm ? 'Cancel' : '+ Post Update'}
                                                </button>
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
