import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt, FaUserTie, FaTasks,
    FaHardHat, FaBullhorn, FaCubes, FaChevronDown, FaChevronUp,
    FaEnvelope
} from "react-icons/fa";
import Nev from "./Nev";
import Footer from "./Footer";

const CustomerConstruction = () => {
    const { token } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState(null);

    const fetchProjects = useCallback(async () => {
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
            console.error(error);
            toast.error("Failed to load your construction projects.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchProjects();
    }, [token, fetchProjects]);

    const toggleExpand = (id) => {
        setExpandedProject(expandedProject === id ? null : id);
    };

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;
        const normalized = img.replace(/\\/g, "/");
        if (normalized.startsWith("uploads/")) return `/${normalized}`;
        if (normalized.startsWith("/")) return normalized;
        return `/${normalized}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col justify-center items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">Loading Construction Workspace...</p>
        </div>
    );

    return (
        <div className="bg-[#0d1117] min-h-screen text-white font-sans selection:bg-indigo-500 selection:text-white">
            <Nev />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                {/* Simplified Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Construction <span className="text-gray-500 font-medium">Workspace</span>
                    </h1>
                    <p className="text-gray-400 mt-3 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                        Track your project's heartbeat. Monitor real-time progress, material allocation, and site updates in one reliable place.
                    </p>
                </motion.div>

                {/* Projects Section */}
                <div className="space-y-6">
                    {projects.length === 0 ? (
                        <div className="bg-white/[0.02] border border-white/5 py-20 px-6 rounded-3xl text-center">
                            <FaHardHat className="text-5xl text-gray-700 mx-auto mb-4 opacity-30" />
                            <h3 className="text-xl font-bold text-gray-400">No projects found</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">You don't have any active construction projects assigned to your account yet.</p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <motion.div 
                                key={project._id} 
                                layout
                                className="bg-white/[0.03] rounded-3xl border border-white/5 shadow-xl overflow-hidden transition-all"
                            >
                                {/* Project Card Header */}
                                <div
                                    className={`p-6 md:p-8 cursor-pointer transition-colors ${expandedProject === project._id ? "bg-white/5" : "hover:bg-white/[0.04]"}`}
                                    onClick={() => toggleExpand(project._id)}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-white/[0.05] text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5">
                                                    {project.type}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                    project.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" :
                                                    project.status === "In Progress" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/10" :
                                                    "bg-amber-500/10 text-amber-400 border-amber-500/10"
                                                }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black text-white">{project.name}</h2>
                                            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                                                <FaMapMarkerAlt className="text-gray-600" /> {project.location}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            {/* Progress Info */}
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Progress</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${project.progressPercentage}%` }}
                                                            className={`h-full ${project.progressPercentage === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                                                        />
                                                    </div>
                                                    <span className="text-xl font-black text-white">{project.progressPercentage}%</span>
                                                </div>
                                            </div>

                                            <div className="text-white/20 ml-2">
                                                {expandedProject === project._id ? <FaChevronUp /> : <FaChevronDown />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedProject === project._id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: "auto", opacity: 1 }} 
                                            exit={{ height: 0, opacity: 0 }} 
                                            className="overflow-hidden bg-black/20"
                                        >
                                            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                                                
                                                {/* Left Column: Timeline & Feed */}
                                                <div className="lg:col-span-8 space-y-12">
                                                    
                                                    {/* Milestones */}
                                                    <section>
                                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                                            <FaTasks className="text-indigo-400" /> Milestones
                                                        </h3>
                                                        <div className="space-y-6 relative ml-2 border-l border-white/5 pl-8">
                                                            {project.tasks.length === 0 ? (
                                                                <p className="text-gray-500 text-sm">No milestones logged.</p>
                                                            ) : (
                                                                project.tasks.map((task) => (
                                                                    <div key={task._id} className="relative group">
                                                                        <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-[#0d1117] shadow-lg z-10 ${
                                                                            task.status === "Completed" ? "bg-emerald-500" :
                                                                            task.status === "In Progress" ? "bg-indigo-500" : "bg-gray-700"
                                                                        }`}></div>
                                                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                                                                            {task.images?.[0] && (
                                                                                <img 
                                                                                    src={getImageUrl(task.images[0])} 
                                                                                    alt="" 
                                                                                    className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                                                />
                                                                            )}
                                                                            <div className="p-5">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <h4 className="font-bold text-lg text-white">{task.title}</h4>
                                                                                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">{task.status}</span>
                                                                                </div>
                                                                                <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </section>

                                                    {/* Site Updates Feed */}
                                                    <section>
                                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                                            <FaBullhorn className="text-indigo-400" /> Site Activity
                                                        </h3>
                                                        <div className="space-y-6">
                                                            {project.updates.length === 0 ? (
                                                                <p className="text-gray-500 text-sm">Activity feed is empty.</p>
                                                            ) : (
                                                                project.updates.map(upd => (
                                                                    <div key={upd._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.03] transition-colors">
                                                                        <div className="flex items-center justify-between mb-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs border border-indigo-500/10">
                                                                                    <FaUserTie />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-white uppercase tracking-tight">{upd.authorId?.name || "Admin"}</p>
                                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(upd.createdAt).toLocaleDateString()}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <h4 className="font-bold text-white mb-2">{upd.title}</h4>
                                                                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{upd.content}</p>
                                                                        {upd.images?.[0] && (
                                                                            <div className="rounded-xl overflow-hidden border border-white/5 max-w-lg shadow-2xl">
                                                                                <img src={getImageUrl(upd.images[0])} alt="" className="w-full object-cover" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </section>
                                                </div>

                                                {/* Right Column: Statistics & Team */}
                                                <div className="lg:col-span-4 space-y-8">
                                                    
                                                    {/* Material Table */}
                                                    <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                            <FaCubes className="text-amber-500" /> Resources
                                                        </h3>
                                                        <div className="space-y-5">
                                                            {project.materials.length === 0 ? (
                                                                <p className="text-gray-600 text-[10px] uppercase font-bold text-center py-4 tracking-widest">No allocations yet</p>
                                                            ) : (
                                                                project.materials.map(m => {
                                                                    const percentage = Math.round((m.quantityUsed / m.quantityAllocated) * 100);
                                                                    return (
                                                                        <div key={m._id} className="group">
                                                                            <div className="flex justify-between items-end mb-1.5">
                                                                                <span className="text-xs font-bold text-gray-300 capitalize">{m.materialId?.name}</span>
                                                                                <span className="text-[10px] font-black text-gray-500">{percentage}% used</span>
                                                                            </div>
                                                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                                                <div 
                                                                                    className={`h-full rounded-full transition-all duration-1000 ${percentage > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                                                                    style={{ width: `${percentage}%` }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex justify-between mt-1">
                                                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Usage: {m.quantityUsed} / {m.quantityAllocated} {m.materialId?.unit}</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </section>

                                                    {/* Contact & Team */}
                                                    <section className="space-y-4">
                                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Site Leadership</p>
                                                            <div className="flex items-center gap-4 mb-6">
                                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/10">
                                                                    {project.architectId?.name?.charAt(0) || <FaUserTie />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-white">{project.architectId?.name || "Assigning..."}</p>
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Principal Architect</p>
                                                                </div>
                                                            </div>
                                                            <Link to="/support" className="block">
                                                                <button className="w-full py-4 bg-white text-[#0d1117] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                                                    <FaEnvelope /> Contact Support
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </section>

                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CustomerConstruction;
