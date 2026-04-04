import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../../../api/api";
import { toast } from "react-toastify";
import { 
    FaHardHat, FaHistory, FaProjectDiagram, FaPlus, 
    FaSearch, FaFilter, FaArrowRight, FaMapMarkerAlt, 
    FaUserAstronaut, FaCalendarAlt, FaChartLine, FaCheckCircle,
    FaExclamationTriangle, FaClock
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ManageProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/construction-projects/projects");
            setProjects(data.projects || []);
        } catch (error) {
            console.error("Scale failure", error);
            toast.error("Failed to sync project registry");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Planning": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "In Progress": return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
            case "Completed": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "On Hold": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case "Cancelled": return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "Critical": return <FaExclamationTriangle className="text-red-500 animate-pulse" title="Critical Priority" />;
            case "High": return <FaChartLine className="text-amber-500" title="High Priority" />;
            default: return <FaClock className="text-blue-500" title="Normal Priority" />;
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "All" || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === "In Progress").length,
        completed: projects.filter(p => p.status === "Completed").length,
        budget: projects.reduce((acc, p) => acc + (p.estimatedCost || 0), 0)
    };

    return (
        <div className="p-6 md:p-10 bg-[#0B0C10] min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-400">
            {/* Professional Header */}
            <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="relative">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            <FaProjectDiagram className="text-[#0B0C10] text-xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Construction <span className="text-cyan-500">Registry</span></h1>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.5em] mt-2">Stinchar / Operations / V2.0</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative group flex-grow lg:flex-grow-0">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs group-hover:text-cyan-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="SEARCH PROJECT LEDGER..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1A1B1E] border border-zinc-800 rounded-xl px-12 py-3.5 text-[10px] font-bold text-white tracking-widest placeholder:text-gray-700 focus:border-cyan-500 outline-none w-full lg:w-80 transition-all uppercase" 
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-[#1A1B1E] border border-zinc-800 p-1.5 rounded-xl">
                        {["All", "In Progress", "Planning", "Completed"].map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-cyan-500 text-[#0B0C10] shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-500 hover:text-white'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <Link 
                        to="/admin/projects/new" 
                        className="flex items-center gap-3 bg-white text-[#0B0C10] px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all active:scale-95 shadow-xl"
                    >
                        <FaPlus /> Initialize project
                    </Link>
                </div>
            </header>

            {/* Technical Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Active Nodes", val: stats.active, icon: <FaHardHat className="text-cyan-500" /> },
                    { label: "Completion Ratio", val: `${Math.round((stats.completed/stats.total)*100 || 0)}%`, icon: <FaCheckCircle className="text-green-500" /> },
                    { label: "Registry Depth", val: stats.total, icon: <FaHistory className="text-blue-500" /> },
                    { label: "Projected CapEx", val: `₹${(stats.budget / 100000).toFixed(1)}L`, icon: <FaChartLine className="text-purple-500" /> }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1A1B1E] border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:border-cyan-500/50 transition-all cursor-default"
                    >
                        <div>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                            <h4 className="text-2xl font-black text-white tracking-widest">{stat.val}</h4>
                        </div>
                        <div className="text-2xl opacity-40 group-hover:opacity-100 transition-opacity">
                            {stat.icon}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="w-12 h-12 border-2 border-zinc-800 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                    <span className="text-zinc-600 tracking-[0.6em] uppercase text-[10px] font-bold animate-pulse">Accessing Encrypted Project Stream</span>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-[#1A1B1E] border border-dashed border-zinc-800 rounded-3xl py-40 flex flex-col items-center justify-center text-center px-6">
                    <FaProjectDiagram className="text-5xl text-zinc-800 mb-8" />
                    <h3 className="text-zinc-500 tracking-[0.4em] uppercase text-xs font-black">No Active Records Found in Registry</h3>
                    <p className="text-zinc-700 text-[10px] mt-4 max-w-sm font-bold uppercase tracking-widest leading-loose">Initialize a new project node from the command bar above to start tracking construction lifecycle.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredProjects.map((project, idx) => (
                        <motion.div
                            key={project._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="bg-[#1A1B1E] border border-zinc-800 rounded-3xl overflow-hidden group hover:border-cyan-500/60 shadow-2xl transition-all h-[420px] flex flex-col relative"
                        >
                            {/* Card Hero */}
                            <div className="relative h-44 bg-zinc-900 group-hover:h-36 transition-all duration-500 overflow-hidden">
                                {project.images && project.images[0] ? (
                                    <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1B1E] to-zinc-900">
                                        <FaHardHat className="text-5xl text-zinc-800" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B1E] to-transparent"></div>
                                
                                <div className="absolute top-6 left-6 flex items-center gap-3">
                                    <div className={`px-4 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </div>
                                    <div className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-zinc-800">
                                        {getPriorityIcon(project.priority)}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 pt-4 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2 group-hover:text-cyan-500 transition-colors line-clamp-1">{project.name}</h3>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <FaMapMarkerAlt className="text-[10px] text-cyan-500/50" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] line-clamp-1">{project.location || "GLOBAL GRID-X"}</span>
                                    </div>
                                </div>

                                {/* Dynamic Details Grid */}
                                <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-black/30 border border-zinc-800/50 mb-8">
                                    <div>
                                        <p className="text-[7px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Architect Node</p>
                                        <div className="flex items-center gap-2">
                                            {project.architectId?.profileImage ? (
                                                <img src={project.architectId.profileImage} className="w-6 h-6 rounded-full border border-cyan-500/20" alt="Arch" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center"><FaUserAstronaut className="text-[10px] text-zinc-600" /></div>
                                            )}
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest line-clamp-1">{project.architectId?.name || "UNASSIGNED"}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Launch Phase</p>
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-[10px] text-zinc-600" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{new Date(project.startDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Engine */}
                                <div className="mt-auto">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.4em] block mb-1">Status: {project.currentPhase || "Pre-Ops"}</span>
                                            <span className="text-white text-lg font-black tracking-widest">{project.progressPercentage}%</span>
                                        </div>
                                        <p className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">Calculated Flux</p>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progressPercentage}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Deep-Dive Action */}
                            <Link 
                                to={`/admin/projects/${project._id}/details`}
                                className="absolute bottom-6 right-8 w-12 h-12 rounded-2xl bg-[#0B0C10] border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:bg-cyan-500 group-hover:text-[#0B0C10] transition-all shadow-xl group-hover:scale-110 active:scale-95 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                            >
                                <FaArrowRight className="text-sm" />
                            </Link>

                            {/* Background Overlay Art */}
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/5 blur-[80px] rounded-full group-hover:bg-cyan-500/10 transition-all pointer-events-none"></div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageProjects;
