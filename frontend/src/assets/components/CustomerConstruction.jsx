import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt, FaUserTie, FaTasks,
    FaHardHat, FaBullhorn, FaCubes, FaChevronDown, FaChevronUp,
    FaEnvelope, FaTerminal, FaCrosshairs, FaShieldAlt, FaInfoCircle, FaImage, FaBoxOpen
} from "react-icons/fa";
import { getOptimizedImage } from "../utils/imageUtils";
import Nev from "./Nev";
import Footer from "./Footer";

const CustomerConstruction = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState(null);
    const [activeTab, setActiveTab] = useState("CORE"); // For Mobile: CORE, FEED, RESOURCE

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
        if (token) {
            fetchProjects();
        } else {
            setLoading(false);
        }
    }, [token, fetchProjects]);

    if (loading) return (
        <div className="min-h-screen bg-[#e5e5e5] flex flex-col justify-center items-center gap-4 font-mono">
            <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
            <p className="text-black font-black uppercase text-[10px] tracking-widest mt-2">INIT_CONTROL_CENTER...</p>
        </div>
    );

    return (
        <div className="bg-[#e5e5e5] min-h-screen text-black font-mono selection:bg-[#ff5c00] selection:text-black overflow-hidden flex flex-col pt-20">
            <Nev />
            
            {/* 🏁 INDUSTRIAL GRID OVERLAY */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            {/* MOBILE NAVIGATION BAR (Visible only on mobile) */}
            <div className="md:hidden flex border-b-2 border-black bg-white sticky top-0 z-40 overflow-x-auto scrollbar-hide">
                {["CORE", "FEED", "RESOURCE"].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest border-r border-black last:border-r-0 ${activeTab === tab ? 'bg-black text-white' : 'text-black/40'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <main className="relative z-10 w-full max-w-[1920px] mx-auto flex-1 flex flex-col md:grid md:grid-cols-12 border-t-4 border-black h-[calc(100vh-5.5rem)] md:h-[calc(100vh-5rem)] overflow-hidden">
                
                {!token ? (
                    <div className="md:col-span-12 flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-black text-white flex items-center justify-center mb-8 border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.1)]">
                            <FaShieldAlt className="text-3xl text-[#ff5c00]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-heading font-black mb-4 uppercase tracking-tighter">Access Reserved</h2>
                        <p className="text-black/50 max-w-sm mx-auto mb-10 font-bold uppercase text-xs leading-loose tracking-widest">IDENTIFICATION_REQUIRED.</p>
                        <Link to="/login" className="px-12 py-5 bg-black text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff5c00] hover:text-black transition-all">[ LOGIN_INIT ]</Link>
                    </div>
                ) : (
                    <>
                        {/* PANEL 01: NODE SIDEBAR (Fixed List) */}
                        <div className="md:col-span-2 border-r-2 border-black flex flex-col h-full overflow-hidden bg-white/20 hidden md:flex">
                           <div className="p-6 border-b-2 border-black bg-black text-white flex flex-col gap-1">
                              <span className="text-[#ff5c00] font-black text-[8px] tracking-[0.4em]">// NODES</span>
                              <h3 className="text-lg font-heading font-black tracking-tighter uppercase">PNL_01</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
                              {projects.map((p, idx) => (
                                 <div 
                                   key={p._id} 
                                   className={`p-4 border-2 transition-all cursor-pointer ${expandedProject === p._id ? 'border-black bg-black text-white' : 'border-black/5 hover:border-black'}`}
                                   onClick={() => setExpandedProject(p._id)}
                                 >
                                    <span className="text-[7px] font-black opacity-50 block mb-1">ST-00{idx+1}</span>
                                    <span className="text-[10px] font-black uppercase truncate block">{p.name}</span>
                                 </div>
                              ))}
                           </div>
                           <div className="p-4 border-t-2 border-black bg-black/5">
                              <div className="flex justify-between items-center text-[7px] font-black uppercase opacity-40">
                                 <span>NODES: {projects.length}</span>
                                 <span>STAT: R_ST</span>
                              </div>
                           </div>
                        </div>

                        {/* PANEL 02: PROJECT CORE & MILESTONES (Zone 2) */}
                        <div className={`md:col-span-3 border-r-2 border-black flex flex-col h-full overflow-hidden bg-white/40 ${activeTab !== "CORE" ? 'hidden md:flex' : 'flex'}`}>
                           <div className="p-6 border-b-2 border-black bg-white flex flex-col gap-1">
                              <span className="text-black/30 font-black text-[8px] tracking-[0.4em]">// CORE_SPEC</span>
                              <h3 className="text-lg font-heading font-black tracking-tighter uppercase">SEC_01_CORE</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
                              {projects.filter(p => p._id === expandedProject).map(project => (
                                 <div key={project._id} className="space-y-8">
                                    {/* Minimal Info */}
                                    <div>
                                       <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase mb-3 inline-block">{project.type}</span>
                                       <h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tight leading-none uppercase mb-2">
                                          {project.name}
                                       </h2>
                                       <div className="flex items-center gap-2 text-[9px] font-black text-black/40 uppercase">
                                          <FaMapMarkerAlt size={10} className="text-[#ff5c00]" /> {project.location}
                                       </div>
                                    </div>

                                    {/* Compact Progress */}
                                    <div className="border-2 border-black p-4 bg-white shadow-[6px_6px_0px_rgba(0,0,0,0.05)]">
                                       <div className="flex justify-between items-end mb-2">
                                          <span className="text-[8px] font-black opacity-30 uppercase">STAT: COMPLETE</span>
                                          <span className="text-xl font-heading font-black">{project.progressPercentage}%</span>
                                       </div>
                                       <div className="h-4 border-2 border-black p-0.5 relative overflow-hidden bg-black/5">
                                          <motion.div initial={{ width: 0 }} animate={{ width: `${project.progressPercentage}%` }} className="h-full bg-[#ff5c00]" />
                                       </div>
                                    </div>

                                    {/* Milestone Vertical List */}
                                    <div className="space-y-6">
                                       <div className="flex items-center gap-2 mb-4">
                                          <FaTasks size={10} className="text-[#ff5c00]" />
                                          <span className="text-[9px] font-black uppercase tracking-widest">MILESTONE_LOG</span>
                                       </div>
                                       <div className="space-y-4 border-l-2 border-black/10 ml-1.5 pl-6 relative">
                                          {project.tasks.map((task, idx) => (
                                             <div key={task._id} className="relative group">
                                                <div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-[#e5e5e5] ${task.status === "Completed" ? 'bg-black' : 'bg-white border-black/20'}`}></div>
                                                <div className="p-3 border-2 border-black/5 hover:border-black transition-all bg-white relative overflow-hidden">
                                                   <span className="absolute top-1 right-2 text-[7px] font-black opacity-10">{idx+1}</span>
                                                   <span className={`text-[7px] font-black px-1.5 py-0.5 border border-black uppercase mb-2 inline-block ${task.status === "Completed" ? 'bg-black text-white' : 'text-black'}`}>
                                                      {task.status}
                                                   </span>
                                                   <h4 className="text-[10px] font-heading font-black uppercase mb-1">{task.title}</h4>
                                                   <p className="text-[9px] font-bold text-black/50 uppercase mb-3 leading-tight">{task.description}</p>
                                                   
                                                   {task.images?.[0] && (
                                                      <div className="mt-2 border border-black/10 overflow-hidden aspect-video">
                                                         <img 
                                                           src={getOptimizedImage(task.images[0])} 
                                                           alt="" 
                                                           className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                                         />
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* PANEL 03: ACTIVITY FEED / POSTS (Zone 3) */}
                        <div className={`md:col-span-4 border-r-2 border-black flex flex-col h-full overflow-hidden bg-white/20 ${activeTab !== "FEED" ? 'hidden md:flex' : 'flex'}`}>
                           <div className="p-6 border-b-2 border-black bg-black text-white flex justify-between items-center">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[#ff5c00] font-black text-[8px] tracking-[0.4em]">// LIVE_FEED</span>
                                 <h3 className="text-lg font-heading font-black tracking-tighter uppercase">SEC_02_POSTS</h3>
                              </div>
                              <FaImage size={18} className="text-white/20" />
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                              {projects.filter(p => p._id === expandedProject).map(project => (
                                 <div key={project._id} className="space-y-6">
                                    {project.updates.length === 0 ? (
                                       <div className="text-center py-20 opacity-20"><FaCrosshairs size={40} className="mx-auto mb-4" /><span className="text-[10px] font-black">NO_LOG_DATA</span></div>
                                    ) : (
                                       project.updates.map(upd => (
                                          <div key={upd._id} className="border-4 border-black bg-white p-6 relative group overflow-hidden">
                                             <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none"><span className="text-8xl font-black">{new Date(upd.createdAt).getDate()}</span></div>
                                             <div className="flex items-center justify-between mb-4 relative z-10">
                                                <div className="flex items-center gap-3">
                                                   <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[10px] font-heading uppercase">{upd.authorId?.name?.charAt(0) || "S"}</div>
                                                   <div>
                                                      <p className="text-[9px] font-black uppercase tracking-tight">{upd.authorId?.name || "SITE_ENG"}</p>
                                                      <p className="text-[7px] font-black text-black/30 uppercase">{new Date(upd.createdAt).toLocaleDateString()}</p>
                                                   </div>
                                                </div>
                                                <span className="text-[7px] font-black text-[#ff5c00] animate-pulse">ENTRY::ACTIVE</span>
                                             </div>
                                             <h4 className="text-xl font-heading font-black uppercase mb-3 leading-none relative z-10">{upd.title}</h4>
                                             <p className="text-[11px] font-bold text-black/70 uppercase leading-relaxed mb-6 relative z-10">{upd.content}</p>
                                             {upd.images?.[0] && (
                                                <div className="border-2 border-black overflow-hidden relative z-10 aspect-square md:aspect-video mb-2">
                                                   <img src={getOptimizedImage(upd.images[0])} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                </div>
                                             )}
                                          </div>
                                       ))
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* PANEL 04: RESOURCE MATRIX & ACTIONS (Zone 4) */}
                        <div className={`md:col-span-3 border-r-2 border-black flex flex-col h-full overflow-hidden bg-white/40 ${activeTab !== "RESOURCE" ? 'hidden md:flex' : 'flex'}`}>
                           <div className="p-6 border-b-2 border-black bg-white flex flex-col gap-1">
                              <span className="text-black/30 font-black text-[8px] tracking-[0.4em]">// RSRCE_HUB</span>
                              <h3 className="text-lg font-heading font-black tracking-tighter uppercase">SEC_03_RESOURCE</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                              {projects.filter(p => p._id === expandedProject).map(project => (
                                 <div key={project._id} className="space-y-10">
                                    {/* Resource Section */}
                                    <div className="space-y-6">
                                       <div className="flex items-center gap-2 mb-6">
                                          <FaBoxOpen size={12} className="text-[#ff5c00]" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">INVENTORY_INDEX</span>
                                       </div>
                                       <div className="space-y-6">
                                          {project.materials.length === 0 ? (
                                             <div className="text-center py-10 opacity-20"><FaCubes size={30} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase">Null Allocation</span></div>
                                          ) : (
                                             project.materials.map(m => {
                                                const percentage = Math.round((m.quantityUsed / m.quantityAllocated) * 100);
                                                return (
                                                   <div key={m._id} className="space-y-2 border-b-2 border-black/5 pb-4">
                                                      <div className="flex justify-between items-end">
                                                         <span className="text-[11px] font-black uppercase tracking-tighter truncate w-32">{m.materialId?.name}</span>
                                                         <span className={`text-[9px] font-black ${percentage > 90 ? 'text-[#ff5c00]' : 'text-black'}`}>{percentage}%</span>
                                                      </div>
                                                      <div className="h-1 bg-black/10"><div className={`h-full ${percentage > 90 ? 'bg-[#ff5c00]' : 'bg-black'}`} style={{ width: `${percentage}%` }}></div></div>
                                                      <p className="text-[7px] font-black opacity-30 uppercase">STK: {m.quantityUsed} / {m.quantityAllocated} {m.materialId?.unit}</p>
                                                   </div>
                                                );
                                             })
                                          )}
                                       </div>
                                    </div>

                                    {/* Command Section */}
                                    <div className="border-4 border-black p-6 bg-black text-white space-y-6 relative overflow-hidden">
                                       <div className="absolute -bottom-2 -right-2 opacity-10"><FaCrosshairs size={80} /></div>
                                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Command_Hub</h4>
                                       <Link to="/support" className="block relative z-10">
                                          <button className="w-full py-4 bg-[#ff5c00] text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-2">
                                             <FaEnvelope size={12} /> CONNECT
                                          </button>
                                       </Link>
                                       <button 
                                          onClick={() => toast.info("Audit packet generated.") }
                                          className="w-full py-4 border-2 border-white/20 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all relative z-10"
                                       >
                                          REQUST_AUDIT
                                       </button>
                                    </div>
                                    
                                    {/* Architect Info */}
                                    <div className="bg-white border-2 border-black p-4 flex items-center gap-4">
                                       <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-heading text-lg bg-black text-white">
                                          {project.architectId?.name?.charAt(0) || "A"}
                                       </div>
                                       <div>
                                          <p className="text-[9px] font-black uppercase tracking-tight">{project.architectId?.name || "ARCHT_ASSIGN"}</p>
                                          <p className="text-[7px] font-black opacity-30 uppercase tracking-[0.2em]">Principal_Engineer</p>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CustomerConstruction;
