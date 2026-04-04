import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../../../../api/api";
import { toast } from "react-toastify";
import { 
    FaChevronLeft, FaProjectDiagram, FaCalendarDay, FaCubes, 
    FaUserAstronaut, FaTasks, FaHistory, FaCheckCircle, 
    FaCloudUploadAlt, FaEdit, FaPlus, FaFilter, FaImages, FaBuilding
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ProjectInspector = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("timeline"); // timeline, tasks, updates
    
    // Task/Phase Modals
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/construction-projects/project/${projectId}/details`);
            setData(data);
        } catch (error) {
            console.error("Scale failure", error);
            toast.error("Failed to access project stream");
            navigate("/admin/projects");
        } finally {
            setLoading(false);
        }
    };

    const updatePhaseStatus = async (phaseName, newStatus) => {
        try {
            const updatedPhases = data.project.phases.map(p => 
                p.name === phaseName ? { ...p, status: newStatus } : p
            );
            
            // Auto-calculate progress
            const completed = updatedPhases.filter(p => p.status === "Completed").length;
            const progress = Math.round((completed / updatedPhases.length) * 100);

            await API.put(`/construction-projects/project/${projectId}/phases`, { 
                phases: updatedPhases,
                progressPercentage: progress,
                currentPhase: newStatus === "In Progress" ? phaseName : data.project.currentPhase
            });
            
            toast.success(`Module ${phaseName} status updated`);
            fetchProjectDetails();
        } catch (error) {
            toast.error("Protocol update failed");
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await API.post("/construction-projects/task", {
                ...newTask,
                projectId,
                assignedTo: data.project.architectId?._id
            });
            toast.success("Design directive dispatched to architect");
            setShowTaskForm(false);
            setNewTask({ title: "", description: "", dueDate: "" });
            fetchProjectDetails();
        } catch (error) {
            toast.error("Task transmission failed");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0C10]">
            <div className="w-16 h-16 border-2 border-zinc-900 border-t-cyan-500 rounded-full animate-spin mb-8"></div>
            <p className="text-zinc-600 tracking-[0.6em] uppercase text-[10px] font-black animate-pulse">Synchronizing Project inspector</p>
        </div>
    );

    const { project, tasks, updates } = data;

    return (
        <div className="p-6 md:p-10 bg-[#0B0C10] min-h-screen font-sans">
            {/* Minimalist Top Nav */}
            <nav className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-900">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-cyan-500 transition-all">
                        <FaChevronLeft className="text-xs" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-bold text-gray-700 uppercase tracking-[0.4em]">REGISTRY</span>
                            <span className="text-zinc-800 text-[8px]">/</span>
                            <span className="text-[8px] font-bold text-cyan-500 uppercase tracking-[0.4em]">{project._id.substring(0,8)}</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">{project.name}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end mr-6">
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.4em]">Current Launch Phase</span>
                        <span className="text-sm font-black text-cyan-500 uppercase flex items-center gap-2">
                            <FaProjectDiagram /> {project.currentPhase}
                        </span>
                    </div>
                    <div className="w-40 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div className="h-full bg-cyan-500" style={{ width: `${project.progressPercentage}%` }}></div>
                    </div>
                    <span className="text-white font-black text-lg ml-2">{project.progressPercentage}%</span>
                </div>
            </nav>

            {/* Main Interactive Ecosystem */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Left Sidebar - Meta & Phases */}
                <aside className="xl:col-span-3 space-y-8">
                    {/* Project Snapshot */}
                    <div className="bg-[#1A1B1E] border border-zinc-800 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full"></div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                             Snapshot
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-loose">Launch Site</span>
                                <span className="text-[9px] text-white font-black uppercase tracking-widest">{project.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Type</span>
                                <span className="text-[9px] text-white font-black uppercase tracking-widest">{project.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Priority</span>
                                <span className={`text-[8px] px-2 py-0.5 rounded border ${project.priority === 'Critical' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-cyan-500 border-cyan-500/20'}`}>{project.priority}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Phases */}
                    <div className="bg-[#1A1B1E] border border-zinc-800 p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                                <FaCalendarDay className="text-xs" /> Timeline Phases
                            </h3>
                        </div>
                        <div className="space-y-0">
                            {project.phases && project.phases.length > 0 ? project.phases.map((phase, i) => (
                                <div key={i} className="relative pl-8 pb-8 last:pb-0">
                                    {/* Timeline Wire */}
                                    {i < project.phases.length - 1 && (
                                        <div className="absolute left-[7px] top-4 bottom-0 w-px bg-zinc-800"></div>
                                    )}
                                    {/* Status Node */}
                                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 transition-all ${phase.status === 'Completed' ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-zinc-900 border-zinc-800'}`}>
                                        {phase.status === 'Completed' && <FaCheckCircle className="text-[#0B0C10] text-[10px] m-auto" />}
                                    </div>
                                    
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`text-[11px] font-black uppercase tracking-widest ${phase.status === 'Completed' ? 'text-zinc-500 line-through' : 'text-white'}`}>{phase.name}</h4>
                                            <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-1">Status: {phase.status}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {phase.status !== 'Completed' && (
                                                <button onClick={() => updatePhaseStatus(phase.name, 'Completed')} className="p-1.5 bg-zinc-800 text-zinc-400 hover:text-cyan-500 rounded-md transition-all">
                                                    <FaCheckCircle className="text-[10px]" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-[9px] text-zinc-700 italic text-center py-4 uppercase font-bold tracking-widest">Registry entry empty</p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Center - Detailed Board */}
                <main className="xl:col-span-6 space-y-8">
                    {/* Mode Selector */}
                    <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl w-fit">
                        {[
                            { id: "timeline", label: "Operations Feed", icon: FaProjectDiagram },
                            { id: "tasks", label: "Architect Directives", icon: FaTasks },
                            { id: "updates", label: "Site Evidence", icon: FaImages }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.id ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                <tab.icon className="text-xs" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'timeline' && (
                            <motion.section 
                                key="tl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="bg-[#1A1B1E] border border-zinc-800 rounded-3xl p-8 min-h-[500px]">
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-lg font-black text-white tracking-widest uppercase">Operations Stream</h2>
                                        <div className="flex gap-2">
                                            <div className="px-4 py-2 bg-black/40 border border-zinc-800 rounded-xl text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                                All Activities
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Activity Log Simulation */}
                                        <div className="flex gap-6 relative">
                                            <div className="w-10 h-10 rounded-full bg-cyan-700/20 flex items-center justify-center border border-cyan-500/30">
                                                <FaProjectDiagram className="text-cyan-500 text-xs" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-zinc-400 font-bold tracking-widest leading-relaxed uppercase">Project node initialized by system admin</p>
                                                <time className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.2em] block mt-2">{new Date(project.createdAt).toLocaleString()}</time>
                                            </div>
                                        </div>

                                        {tasks.filter(t => t.status === 'Completed').map(task => (
                                            <div key={task._id} className="flex gap-6 relative">
                                                <div className="w-10 h-10 rounded-full bg-green-700/20 flex items-center justify-center border border-green-500/30">
                                                    <FaCheckCircle className="text-green-500 text-xs" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-white font-black tracking-widest leading-relaxed uppercase">Directive Executed: {task.title}</p>
                                                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.2em] block mt-2">Validated by {task.assignedTo?.name || "Architect"}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {updates.slice(0, 3).map(up => (
                                            <div key={up._id} className="flex gap-6 relative">
                                                <div className="w-10 h-10 rounded-full bg-blue-700/20 flex items-center justify-center border border-blue-500/30">
                                                    <FaImages className="text-blue-500 text-xs" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-white font-black tracking-widest leading-relaxed uppercase">Visual report lodged: {up.title}</p>
                                                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.2em] block mt-2">{up.authorId?.name} at Site</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {activeTab === 'tasks' && (
                            <motion.section 
                                key="tk" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-black text-white tracking-widest uppercase">Architect Directives</h2>
                                    <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-3 bg-cyan-500 text-[#0B0C10] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl">
                                        <FaPlus /> New Directive
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {tasks.map(task => (
                                        <div key={task._id} className="bg-[#1A1B1E] border border-zinc-800 p-6 rounded-3xl flex items-center justify-between group hover:border-cyan-500/40 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${task.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-600 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 shadow-xl border border-zinc-800'}`}>
                                                    <FaTasks />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{task.title}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{task.status}</span>
                                                        <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                                                        <span className="text-[8px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Target: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-[7px] font-bold text-gray-700 uppercase tracking-widest mb-1">Assigned Agent</p>
                                                    <p className="text-[9px] font-bold text-white uppercase tracking-widest">{task.assignedTo?.name || "N/A"}</p>
                                                </div>
                                                <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-white transition-all"><FaEdit className="text-xs"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeTab === 'updates' && (
                            <motion.section 
                                key="up" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {updates.map(update => (
                                        <div key={update._id} className="bg-[#1A1B1E] border border-zinc-800 rounded-3xl overflow-hidden group hover:border-blue-500/40 transition-all">
                                            <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                                                {update.images?.[0] ? (
                                                    <img src={update.images[0]} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="Update" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-800"><FaImages className="text-4xl" /></div>
                                                )}
                                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-2">
                                                    <FaImages className="text-xs text-blue-500" />
                                                    <span className="text-[9px] text-white font-bold">{update.images?.length || 0} Assets</span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">{update.title}</h4>
                                                <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest font-bold line-clamp-2">{update.content}</p>
                                                <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-zinc-800"></div>
                                                        <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest leading-loose">Author: {update.authorId?.name}</span>
                                                    </div>
                                                    <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(update.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </main>

                {/* Right Sidebar - Personnel & Documents */}
                <aside className="xl:col-span-3 space-y-8">
                    {/* Personnel Registry */}
                    <div className="bg-[#1A1B1E] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-2">
                             Project Personnel
                        </h3>
                        
                        <div className="space-y-10">
                            {/* Lead Architect */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-[30px] bg-zinc-900 border-2 border-cyan-500/20 p-1 mb-4 relative group">
                                    <div className="w-full h-full rounded-[24px] bg-zinc-800 overflow-hidden">
                                        {project.architectId?.profileImage ? <img src={project.architectId.profileImage} className="w-full h-full object-cover" /> : <FaUserAstronaut className="m-auto mt-4 text-4xl text-zinc-700" />}
                                    </div>
                                    <div className="absolute -bottom-2 right-4 bg-cyan-500 text-[#0B0C10] text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Lead</div>
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tighter text-center">{project.architectId?.name || "Unassigned"}</h4>
                                <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-[0.2em] mt-1">Chief Architect</p>
                                <div className="flex gap-4 mt-6">
                                    <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-cyan-400 transition-all"><FaHistory/></button>
                                    <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-cyan-400 transition-all"><FaProjectDiagram/></button>
                                </div>
                            </div>

                            {/* Client Representative */}
                            <div className="pt-8 border-t border-zinc-900 flex flex-col items-center">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest text-center">{project.customerId?.name || "Internal Portfolio"}</h4>
                                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Beneficiary Client</p>
                                <button className="mt-4 text-[9px] font-bold text-zinc-300 hover:text-cyan-500 uppercase tracking-widest flex items-center gap-2 transition-all">
                                    View Dossier <FaPlus className="text-[7px]" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Master Documentation */}
                    <div className="bg-[#1A1B1E] border border-zinc-800 p-8 rounded-3xl">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                            Master Ledger
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 group hover:border-cyan-500/40 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-cyan-500 transition-all">
                                        <FaCloudUploadAlt />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest leading-loose">Structural Docs</h5>
                                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">4.2 MB / PDF</p>
                                    </div>
                                </div>
                            </div>
                            {project.blueprints?.map((bp, i) => (
                                <a key={i} href={bp.fileUrl} target="_blank" className="p-4 rounded-2xl bg-black/40 border border-zinc-800 group hover:border-cyan-500/40 transition-all block">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-cyan-500 transition-all">
                                            <FaBuilding />
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest leading-loose line-clamp-1">{bp.title}</h5>
                                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Blueprint Ledger</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 rounded-2xl border border-zinc-800 text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:border-cyan-500/40 hover:text-white transition-all">
                            Archive All Metadata
                        </button>
                    </div>
                </aside>
            </div>

            {/* Directive Modal */}
            {showTaskForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1A1B1E] border border-zinc-800 w-full max-w-lg rounded-3xl p-10 shadow-3xl"
                    >
                        <h2 className="text-xl font-black text-white tracking-widest uppercase mb-10 flex items-center gap-3">
                            <FaPlus className="text-cyan-500 text-sm" /> Generate Directive
                        </h2>
                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Operational Title</label>
                                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest" placeholder="E.G. FOUNDATION VALIDATION" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Directive Scope</label>
                                <textarea required value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest h-32 resize-none" placeholder="Provide technical scope..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Mission Deadline</label>
                                <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest" />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowTaskForm(false)} className="flex-1 py-4 rounded-xl border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Abort</button>
                                <button type="submit" className="flex-1 py-4 rounded-xl bg-cyan-500 text-[#0B0C10] text-[10px] font-black uppercase tracking-widest hover:bg-white shadow-xl transition-all">Dispatch Directive</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ProjectInspector;
