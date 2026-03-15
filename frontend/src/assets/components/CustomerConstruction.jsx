import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaUserTie, FaTasks,
    FaHardHat, FaBullhorn, FaCubes, FaChevronDown, FaChevronUp,
    FaPhoneAlt, FaEnvelope, FaExclamationTriangle, FaImage, FaCalendarAlt
} from "react-icons/fa";
import Nev from "./Nev";

const CustomerConstruction = () => {
    const { user, token } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState(null);

    useEffect(() => {
        if (token) fetchProjects();
    }, [token]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await API.get("/construction/customer/projects", { headers: { Authorization: `Bearer ${token}` } });

            const projectsData = res.data.projects;

            const projectsWithData = await Promise.all(projectsData.map(async (p) => {
                const [tRes, uRes, mRes] = await Promise.all([
                    API.get(`/construction/project/${p._id}/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
                    API.get(`/construction/project/${p._id}/updates`, { headers: { Authorization: `Bearer ${token}` } }),
                    API.get(`/materials/project-customer/${p._id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { materials: [] } }))
                ]);
                return {
                    ...p,
                    tasks: tRes.data.tasks,
                    updates: uRes.data.updates,
                    materials: mRes.data?.materials || []
                };
            }));

            setProjects(projectsWithData);
            if (projectsWithData.length > 0) {
                setExpandedProject(projectsWithData[0]._id);
            }
        } catch (error) {
            toast.error("Failed to load your construction projects.");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedProject(expandedProject === id ? null : id);
    };

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;
        // Normalize backslashes (common in some DB entries) to forward slashes
        const normalized = img.replace(/\\/g, "/");
        // Ensure it starts with /uploads/ or /
        if (normalized.startsWith("uploads/")) return `/${normalized}`;
        if (normalized.startsWith("/")) return normalized;
        return `/${normalized}`;
    };

    if (loading) return (
        <>
            <Nev />
            <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Architecting your experience...</p>
            </div>
        </>
    );

    return (
        <div className="bg-[#0a0f1c] min-h-screen pb-20 text-white font-sans">
            <Nev />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight flex items-center justify-center md:justify-start gap-4">
                        <FaHardHat className="text-indigo-500" /> My Construction
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg font-medium max-w-2xl">Monitor your vision coming to life with real-time updates, milestone tracking, and detailed material insights.</p>
                </motion.div>

                <div className="space-y-8">
                    {projects.length === 0 ? (
                        <div className="bg-[#1e293b]/50 backdrop-blur-xl py-24 px-6 rounded-[2.5rem] border border-white/10 text-center shadow-2xl">
                            <FaHardHat className="text-7xl text-gray-700 mx-auto mb-6 opacity-50" />
                            <h3 className="text-2xl font-bold text-gray-300">No active projects foundations found</h3>
                            <p className="text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">It looks like you don't have any active construction projects yet. Start your journey with Stinchar today.</p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <motion.div 
                                key={project._id} 
                                layout
                                className="bg-[#1e293b]/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all hover:border-indigo-500/30"
                            >
                                {/* Project Header (Clickable to Expand) */}
                                <div
                                    className={`p-6 md:p-10 cursor-pointer transition-all ${expandedProject === project._id ? "bg-white/5" : "hover:bg-white/5"}`}
                                    onClick={() => toggleExpand(project._id)}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">{project.type}</span>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    project.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    project.status === "In Progress" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">{project.name}</h2>
                                            <p className="text-gray-400 flex items-center gap-2.5 text-sm font-bold">
                                                <FaMapMarkerAlt className="text-indigo-500" /> {project.location}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8 w-full md:w-auto">
                                            {/* Circular Progress — Premium Style */}
                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                        strokeDasharray={264} strokeDashoffset={264 - (264 * project.progressPercentage) / 100}
                                                        strokeLinecap="round"
                                                        className={project.progressPercentage === 100 ? "text-emerald-500 transition-all duration-1000" : "text-indigo-500 transition-all duration-1000"} />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-xl font-black text-white">{project.progressPercentage}%</span>
                                                </div>
                                            </div>

                                            {project.architectId && (
                                                <div className="hidden lg:flex flex-col items-end">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3">Principal Architect</p>
                                                    <div className="flex items-center gap-4 bg-white/5 pl-4 pr-6 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex justify-center items-center text-white font-black shadow-lg text-lg">
                                                            {project.architectId.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white text-sm tracking-tight">{project.architectId.name}</p>
                                                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Verified Professional</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-white/20 ml-4 hidden md:block">
                                                {expandedProject === project._id ? <FaChevronUp className="text-2xl" /> : <FaChevronDown className="text-2xl" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {expandedProject === project._id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="border-t border-white/5">
                                                <div className="grid grid-cols-1 lg:grid-cols-12">

                                                    {/* Feed Column (Main Updates & Milestones) - Left & Center */}
                                                    <div className="lg:col-span-8 p-6 md:p-10 space-y-12 border-b lg:border-b-0 lg:border-r border-white/5">
                                                        
                                                        {/* Milestones / Timeline Feed */}
                                                        <section>
                                                            <div className="flex items-center justify-between mb-8">
                                                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                                                    <FaTasks className="text-indigo-400" /> Project Milestones
                                                                </h3>
                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{project.tasks.length} Phases</span>
                                                            </div>

                                                            <div className="space-y-12 relative before:absolute before:inset-0 before:left-[15px] before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-white/5 before:to-transparent">
                                                                {project.tasks.length === 0 ? (
                                                                    <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/10 border-dashed">
                                                                        <p className="text-gray-500 font-bold text-sm">No milestones have been documented yet.</p>
                                                                    </div>
                                                                ) : (
                                                                    project.tasks.map((task, idx) => (
                                                                        <div key={task._id} className="relative pl-12 group">
                                                                            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-[#1e293b] shadow-xl z-10 flex items-center justify-center ${
                                                                                task.status === "Completed" ? "bg-emerald-500" :
                                                                                task.status === "In Progress" ? "bg-indigo-500 animate-pulse" : "bg-gray-700"
                                                                            }`}>
                                                                                {task.status === "Completed" && <FaCheckCircle className="text-white text-xs" />}
                                                                            </div>
                                                                            
                                                                            <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl transition-all hover:border-white/20">
                                                                                {/* Milestone Banner Image */}
                                                                                {task.images && task.images.length > 0 && (
                                                                                    <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                                                                                        <img 
                                                                                            src={getImageUrl(task.images[0])} 
                                                                                            alt={task.title} 
                                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                                                            onError={(e) => { e.target.src = 'https://placehold.co/800x450/1e293b/white?text=Milestone+Image'; }}
                                                                                        />
                                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                                                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                                                                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                                                                                Phase {idx + 1}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                <div className="p-8">
                                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                                                        <h4 className="text-2xl font-black text-white tracking-tight">{task.title}</h4>
                                                                                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                                                                            task.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                                                            task.status === "In Progress" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                                                            "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                                                                        }`}>
                                                                                            {task.status}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-gray-400 text-base leading-relaxed mb-6 font-medium">{task.description}</p>
                                                                                    
                                                                                    {/* Extra images row if any */}
                                                                                    {task.images && task.images.length > 1 && (
                                                                                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                                                                            {task.images.slice(1).map((img, i) => (
                                                                                                <div key={i} className="relative h-24 w-40 shrink-0 rounded-2xl overflow-hidden border border-white/10">
                                                                                                    <img 
                                                                                                        src={getImageUrl(img)} 
                                                                                                        alt="" 
                                                                                                        className="w-full h-full object-cover" 
                                                                                                        onError={(e) => { e.target.src = 'https://placehold.co/200x150/1e293b/white?text=Preview'; }}
                                                                                                    />
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </section>

                                                        {/* Architect Updates Feed */}
                                                        <section>
                                                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                                                <FaBullhorn className="text-indigo-400" /> Execution Feed
                                                            </h3>

                                                            <div className="space-y-8">
                                                                {(!project.updates || project.updates.length === 0) ? (
                                                                    <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/10 border-dashed">
                                                                        <p className="text-gray-500 font-bold text-sm">Waiting for the first site update.</p>
                                                                    </div>
                                                                ) : (
                                                                    project.updates.map(upd => (
                                                                        <div key={upd._id} className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                                                                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                                                                                        <FaUserTie className="text-sm" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-black text-white">{upd.authorId?.name || "Project Head"}</p>
                                                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                                                                            <FaCalendarAlt className="text-indigo-500/50" /> {new Date(upd.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {upd.images && upd.images.length > 0 && (
                                                                                <div className="w-full aspect-video bg-[#0f172a] relative overflow-hidden">
                                                                                    <img 
                                                                                        src={getImageUrl(upd.images[0])} 
                                                                                        alt="Update" 
                                                                                        className="w-full h-full object-cover" 
                                                                                        onError={(e) => { e.target.src = 'https://placehold.co/800x450/1e293b/white?text=Update+Image'; }}
                                                                                    />
                                                                                    {upd.images.length > 1 && (
                                                                                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                                                                            +{upd.images.length - 1} Images
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            <div className="p-8">
                                                                                <h4 className="text-xl font-black text-white mb-3 tracking-tight">{upd.title}</h4>
                                                                                <p className="text-gray-400 text-base leading-relaxed font-medium">{upd.content}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </section>

                                                    </div>

                                                    {/* Sidebar Column: Material Usage & Team - Right */}
                                                    <div className="lg:col-span-4 bg-white/[0.02] p-6 md:p-10 space-y-10">
                                                        
                                                        {/* Material Tracking Section */}
                                                        <div>
                                                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                                                <FaCubes className="text-amber-500" /> Resource Allocation
                                                            </h3>

                                                            {(!project.materials || project.materials.length === 0) ? (
                                                                <div className="text-center p-8 bg-black/20 rounded-3xl border border-white/5 border-dashed">
                                                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No tracking data</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    {project.materials.map(pm => {
                                                                        const percentUsed = Math.min(100, Math.round((pm.quantityUsed / pm.quantityAllocated) * 100)) || 0;
                                                                        const isLow = (pm.quantityAllocated - pm.quantityUsed) <= (pm.lowStockThreshold || 10);
                                                                        return (
                                                                            <div key={pm._id} className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden group">
                                                                                {isLow && <div className="absolute top-0 right-0 w-16 h-16"><div className="absolute top-2 right-[-24px] bg-red-500 text-white text-[8px] font-black py-1 w-20 text-center rotate-45 uppercase">Stock Low</div></div>}
                                                                                
                                                                                <div className="flex justify-between items-start mb-4">
                                                                                    <div>
                                                                                        <h4 className="font-black text-white text-sm tracking-tight">{pm.materialId?.name}</h4>
                                                                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">{pm.materialId?.category}</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex justify-between items-end mb-2.5">
                                                                                    <span className="text-xl font-black text-white tracking-tighter">{pm.quantityUsed} <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">/ {pm.quantityAllocated} {pm.materialId?.unit}</span></span>
                                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${percentUsed > 90 ? "text-red-400" : "text-emerald-400 text-opacity-70"}`}>{percentUsed}%</span>
                                                                                </div>

                                                                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                                                    <motion.div 
                                                                                        initial={{ width: 0 }} 
                                                                                        animate={{ width: `${percentUsed}%` }}
                                                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                                                        className={`h-full rounded-full ${percentUsed > 90 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-gradient-to-r from-indigo-500 to-indigo-400"}`} 
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Team Snapshot */}
                                                        <div className="pt-10 border-t border-white/5">
                                                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Execution Team</h3>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/20">
                                                                        <FaUserTie />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-white">Head of Projects</p>
                                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Support</p>
                                                                    </div>
                                                                </div>
                                                                <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-400 transition-all flex items-center justify-center gap-3">
                                                                    <FaEnvelope className="text-sm" /> Contact Site Lead
                                                                </button>
                                                            </div>
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerConstruction;
