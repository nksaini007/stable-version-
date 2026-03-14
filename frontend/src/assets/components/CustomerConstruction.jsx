import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaUserTie, FaTasks,
    FaHardHat, FaBullhorn, FaCubes, FaChevronDown, FaChevronUp,
    FaPhoneAlt, FaEnvelope, FaExclamationTriangle
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

    if (loading) return (
        <>
            <Nev />
            <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-center items-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading your projects...</p>
            </div>
        </>
    );

    return (
        <div className="bg-[#f0f4f8] min-h-screen pb-20">
            <Nev />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                        <FaHardHat className="text-blue-600" /> My Construction
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Track progress, milestones, and material usage for your projects.</p>
                </div>

                <div className="space-y-6">
                    {projects.length === 0 ? (
                        <div className="bg-white py-20 px-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <FaHardHat className="text-6xl text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">No active projects</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">You do not have any construction projects assigned at the moment. Please contact the administration if you believe this is an error.</p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <div key={project._id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                {/* Project Header (Clickable to Expand) */}
                                <div
                                    className={`p-6 md:p-8 cursor-pointer transition-colors ${expandedProject === project._id ? "bg-gray-50/50" : "hover:bg-gray-50"}`}
                                    onClick={() => toggleExpand(project._id)}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-200">{project.type}</span>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${project.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                    project.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-black text-gray-900">{project.name}</h2>
                                            <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
                                                <FaMapMarkerAlt className="text-red-400" /> {project.location}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                                            {/* Circular Progress */}
                                            <div className="relative w-20 h-20 flex-shrink-0 hidden sm:block">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                        strokeDasharray={226} strokeDashoffset={226 - (226 * project.progressPercentage) / 100}
                                                        className={project.progressPercentage === 100 ? "text-emerald-500 transition-all duration-1000" : "text-blue-500 transition-all duration-1000"} />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-lg font-black text-gray-800">{project.progressPercentage}%</span>
                                                </div>
                                            </div>

                                            {project.architectId && (
                                                <div className="flex flex-col items-end text-right">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Architect Assigned</p>
                                                    <div className="flex items-center justify-end gap-3 bg-gray-50 pl-3 pr-4 py-2 rounded-2xl border border-gray-200">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex justify-center items-center text-white font-bold shadow-md">
                                                            {project.architectId.name.charAt(0)}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-bold text-gray-900 text-sm leading-tight">{project.architectId.name}</p>
                                                            {project.architectId.email && <p className="text-xs text-gray-500">{project.architectId.email}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-gray-400 ml-4 hidden md:block">
                                                {expandedProject === project._id ? <FaChevronUp className="text-xl" /> : <FaChevronDown className="text-xl" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Progress Bar (Visible only when circular is hidden) */}
                                    <div className="mt-6 sm:hidden">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-bold text-gray-600">Overall Progress</span>
                                            <span className="text-sm font-black text-blue-600">{project.progressPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-2.5 rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${project.progressPercentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {expandedProject === project._id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="border-t border-gray-100 bg-gray-50/30">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                                                    {/* Left Column: Milestones & Material Usage */}
                                                    <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100">

                                                        {/* Milestones Section */}
                                                        <div className="p-6 md:p-8">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                                <FaTasks className="text-blue-500" /> Project Milestones
                                                            </h3>

                                                            <div className="relative pl-4 sm:pl-8 space-y-8 before:absolute before:inset-0 before:ml-5 sm:before:ml-9 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:to-gray-200">
                                                                {project.tasks.length === 0 ? (
                                                                    <p className="text-gray-500 text-sm italic">No milestones have been defined for this project.</p>
                                                                ) : (
                                                                    project.tasks.map((task) => (
                                                                        <div key={task._id} className="relative flex items-start group">
                                                                            <div className={`absolute -left-4 sm:-left-8 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-sm ring-1 ring-gray-100 z-10 ${task.status === "Completed" ? "bg-emerald-500 text-white" :
                                                                                task.status === "In Progress" ? "bg-blue-500 text-white" : "bg-gray-200 text-transparent"
                                                                                }`}>
                                                                                {task.status === "Completed" && <FaCheckCircle className="text-xs" />}
                                                                            </div>
                                                                            <div className={`w-full bg-white p-5 rounded-2xl border transition-all ${task.status === "In Progress" ? "border-blue-200 shadow-md shadow-blue-500/5 group-hover:border-blue-300" : "border-gray-100 shadow-sm group-hover:border-gray-200"
                                                                                }`}>
                                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                                                    <h4 className="font-bold text-gray-900">{task.title}</h4>
                                                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border whitespace-nowrap w-fit ${task.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                                                        task.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                                                            "bg-gray-50 text-gray-500 border-gray-200"
                                                                                        }`}>
                                                                                        {task.status}
                                                                                    </span>
                                                                                </div>
                                                                                {task.description && <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>}

                                                                                {task.images && task.images.length > 0 && (
                                                                                    <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                                                        {task.images.map((img, i) => (
                                                                                            <img key={i} src={img} alt="Milestone proof" className="h-24 w-36 object-cover rounded-xl border border-gray-200 shadow-sm flex-shrink-0" />
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Material Usage Section */}
                                                        <div className="p-6 md:p-8 bg-white/50">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                                <FaCubes className="text-amber-500" /> Material Usage Summary
                                                            </h3>

                                                            {(!project.materials || project.materials.length === 0) ? (
                                                                <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                                                                    <FaCubes className="text-3xl text-gray-300 mx-auto mb-2" />
                                                                    <p className="text-gray-500 text-sm font-medium">No materials tracked for this project yet.</p>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    {project.materials.map(pm => {
                                                                        const percentUsed = Math.min(100, Math.round((pm.quantityUsed / pm.quantityAllocated) * 100)) || 0;
                                                                        const isLow = (pm.quantityAllocated - pm.quantityUsed) <= (pm.lowStockThreshold || 10);
                                                                        return (
                                                                            <div key={pm._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                                                <div className="flex justify-between items-start mb-3">
                                                                                    <div>
                                                                                        <h4 className="font-bold text-gray-900 text-sm">{pm.materialId?.name}</h4>
                                                                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{pm.materialId?.category}</p>
                                                                                    </div>
                                                                                    {isLow && <span className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-bold"><FaExclamationTriangle /> Low</span>}
                                                                                </div>

                                                                                <div className="mb-2 flex justify-between items-end">
                                                                                    <span className="text-2xl font-black text-gray-800 tracking-tight">{pm.quantityUsed} <span className="text-xs text-gray-500 font-bold uppercase">/ {pm.quantityAllocated} {pm.materialId?.unit}</span></span>
                                                                                    <span className="text-xs font-bold text-amber-600">{percentUsed}% Used</span>
                                                                                </div>

                                                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                                                    <div className={`h-1.5 rounded-full ${percentUsed > 90 ? "bg-red-500" : percentUsed > 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${percentUsed}%` }}></div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>

                                                    {/* Right Column: Architect Updates */}
                                                    <div className="bg-white p-6 md:p-8">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                            <FaBullhorn className="text-indigo-500" /> Architect Updates
                                                        </h3>

                                                        {(!project.updates || project.updates.length === 0) ? (
                                                            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                                                                <FaBullhorn className="text-3xl text-gray-300 mx-auto mb-2" />
                                                                <p className="text-gray-500 text-sm font-medium">No updates posted yet.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-5">
                                                                {project.updates.map(upd => (
                                                                    <div key={upd._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                                                <FaUserTie className="text-xs" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs font-bold text-gray-900">{upd.authorId?.name || "Architect"}</p>
                                                                                <p className="text-[10px] text-gray-400 font-medium">{new Date(upd.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                                            </div>
                                                                        </div>
                                                                        <h4 className="font-bold text-gray-800 text-sm">{upd.title}</h4>
                                                                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{upd.content}</p>

                                                                        {upd.images && upd.images.length > 0 && (
                                                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                                                {upd.images.slice(0, 4).map((img, i) => (
                                                                                    <img key={i} src={img} alt="Update" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerConstruction;
