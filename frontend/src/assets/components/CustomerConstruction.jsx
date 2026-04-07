import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt, FaUserTie, FaTasks,
    FaHardHat, FaBullhorn, FaCubes, FaChevronDown, FaChevronUp,
    FaEnvelope, FaTerminal, FaCrosshairs, FaShieldAlt, FaInfoCircle, FaImage, FaBoxOpen, FaLayerGroup
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
    const [activeTab, setActiveTab] = useState("STREAM"); // Mobile: STREAM, UTILS

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
            <p className="text-black font-black uppercase text-[10px] tracking-widest mt-2">BOOTING_COMMAND_DECK...</p>
        </div>
    );

    return (
        <div className="bg-[#e5e5e5] min-h-screen text-black font-mono selection:bg-[#ff5c00] selection:text-black overflow-hidden flex flex-col pt-20 tech-grid">
            <Nev />
            <div className="scanline"></div>
            
            {/* MOBILE NAV (Bottom Bar for Quick Access) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t-4 border-[#ff5c00] flex">
                <button onClick={() => setActiveTab("STREAM")} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === "STREAM" ? 'bg-[#ff5c00] text-black' : 'text-white'}`}>ENGINEERING_FEED</button>
                <button onClick={() => setActiveTab("UTILS")} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === "UTILS" ? 'bg-[#ff5c00] text-black' : 'text-white'}`}>SYSTEM_UTILS</button>
            </div>

            <main className="relative z-10 w-full max-w-[2000px] mx-auto flex-1 flex flex-col md:grid md:grid-cols-12 h-[calc(100vh-5rem)] overflow-hidden">
                {!token ? (
                    <div className="md:col-span-12 flex flex-col items-center justify-center p-20 text-center">
                        <FaShieldAlt className="text-6xl text-[#ff5c00] mb-8" />
                        <h2 className="text-5xl font-heading font-black mb-4 uppercase tracking-tighter">Access Reserved</h2>
                        <Link to="/login" className="px-12 py-5 bg-black text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff5c00] transition-all">[ AUTHENTICATE ]</Link>
                    </div>
                ) : (
                    <>
                        {/* ZONE 01: NODE NAVIGATION (16%) */}
                        <div className="md:col-span-2 border-r-2 border-black/5 flex flex-col h-full bg-white/30 backdrop-blur-md hidden md:flex overflow-hidden">
                           <div className="p-8 border-b-2 border-black bg-black text-white">
                              <div className="flex items-center gap-2 mb-2 opacity-40">
                                 <FaTerminal size={10} />
                                 <span className="text-[8px] font-black tracking-widest">SYS.STRM_V2.4</span>
                              </div>
                              <h3 className="text-xl font-heading font-black tracking-tighter">NODES</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto scrollbar-tech p-4 py-8 space-y-4">
                              {projects.map((p, idx) => (
                                 <div 
                                   key={p._id} 
                                   onClick={() => setExpandedProject(p._id)}
                                   className={`p-5 border-2 transition-all cursor-pointer relative group ${expandedProject === p._id ? 'border-black bg-black text-white' : 'border-black/5 bg-white/50 hover:border-black'}`}
                                 >
                                    <div className="absolute top-2 right-2 text-[7px] font-black opacity-30">PTL.{idx+1}</div>
                                    <span className={`w-2 h-2 rounded-full absolute top-2 left-2 ${expandedProject === p._id ? 'bg-[#ff5c00] animate-pulse' : 'bg-black/10'}`}></span>
                                    <span className="text-[11px] font-black uppercase tracking-tight block mt-3 leading-tight truncate">{p.name}</span>
                                    <span className="text-[7px] font-black opacity-40 uppercase mt-1 block">{p.location}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* ZONE 02: CENTRAL ENGINEERING FEED (60%) */}
                        <div className={`md:col-span-10 lg:col-span-7 flex flex-col h-full overflow-hidden ${activeTab !== "STREAM" ? 'hidden md:flex' : 'flex'}`}>
                           {/* HEADER BAR */}
                           <div className="h-16 bg-white border-b-2 border-black flex items-center px-8 justify-between flex-shrink-0">
                              <div className="flex items-center gap-4">
                                 <div className="flex gap-1">
                                    {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-6 bg-black/5 skew-x-[20deg]"></div>)}
                                 </div>
                                 <h2 className="font-heading font-black uppercase text-xl md:text-2xl tracking-tighter">CONTROL_DECK</h2>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="hidden lg:flex items-center gap-3 border-x border-black/10 px-6">
                                    <span className="text-[8px] font-black opacity-30 mt-1 uppercase">SIGNAL_STRENGTH</span>
                                    <div className="flex gap-0.5 items-end h-3">
                                       {[...Array(5)].map((_, i) => <div key={i} className="w-1 bg-[#ff5c00]" style={{ height: `${20 * (i+1)}%` }}></div>)}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex-1 overflow-y-auto scrollbar-tech p-6 md:p-12 space-y-16 pb-32">
                              {projects.filter(p => p._id === expandedProject).map(project => (
                                 <div key={project._id} className="max-w-5xl mx-auto space-y-20">
                                    {/* SECTOR 01: PROJECT IDENTITY */}
                                    <section className="relative">
                                       <div className="absolute -top-10 -left-10 text-[120px] font-black opacity-[0.03] select-none pointer-events-none font-heading uppercase">{project.type}</div>
                                       <div className="flex flex-wrap gap-4 mb-8">
                                          <span className="bg-[#ff5c00] text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">{project.status}</span>
                                          <span className="border-2 border-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">NODE::{project._id.slice(-6)}</span>
                                       </div>
                                       <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tight leading-none uppercase mb-12">
                                          {project.name}
                                       </h1>
                                       <div className="flex flex-col md:flex-row gap-12 items-end">
                                          <div className="flex-1 w-full space-y-3">
                                             <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">PROGRESS_METRIC</span>
                                                <span className="text-5xl font-heading font-black">{project.progressPercentage}%</span>
                                             </div>
                                             <div className="h-4 border-2 border-black p-0.5 relative overflow-hidden bg-white">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${project.progressPercentage}%` }} className="h-full bg-black" />
                                             </div>
                                          </div>
                                          <div className="flex-shrink-0 bg-black text-white p-6 shadow-[10px_10px_0px_rgba(255,92,0,0.3)] min-w-[280px]">
                                             <span className="text-[8px] font-black uppercase opacity-40 mb-3 block">CHIEF_ENGINEER</span>
                                             <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-heading text-2xl border-l-4 border-[#ff5c00]">{project.architectId?.name?.charAt(0) || "A"}</div>
                                                <p className="text-sm font-black uppercase tracking-tight">{project.architectId?.name || "SYS_ADMIN"}</p>
                                             </div>
                                          </div>
                                       </div>
                                    </section>

                                    {/* SECTOR 02: COMBINED ACTIVITY STREAM */}
                                    <section className="space-y-12">
                                       <div className="flex items-center gap-4">
                                          <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-[0.3em]">SEC_01_ACTIVITY_LOG</span>
                                          <div className="flex-1 h-[2px] bg-black/5"></div>
                                       </div>

                                       <div className="space-y-12">
                                          {/* MILESTONE CARDS (Wide Format) */}
                                          {project.tasks.map((task, idx) => (
                                             <div key={task._id} className="relative bg-white border-2 border-black/5 p-8 md:p-12 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                                                <div className="corner-decal decal-tl"></div>
                                                <div className="corner-decal decal-tr"></div>
                                                <div className="corner-decal decal-bl"></div>
                                                <div className={`corner-decal decal-br ${task.status === "Completed" ? 'border-[#ff5c00]' : ''}`}></div>
                                                
                                                <div className="flex flex-col md:grid md:grid-cols-12 gap-12 relative z-10">
                                                   <div className="md:col-span-4 lg:col-span-5 order-2 md:order-1">
                                                      {task.images?.[0] ? (
                                                         <div className="border-4 border-black aspect-video md:aspect-square overflow-hidden relative">
                                                            <img src={getOptimizedImage(task.images[0])} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                            <div className="absolute inset-0 border-[10px] border-white/10 pointer-events-none"></div>
                                                         </div>
                                                      ) : (
                                                         <div className="border-4 border-black/5 aspect-square flex flex-col items-center justify-center bg-black/5 opacity-20">
                                                            <FaImage size={40} className="mb-4" />
                                                            <span className="text-[8px] font-black uppercase">NO_VISUAL_LOG</span>
                                                         </div>
                                                      )}
                                                   </div>
                                                   <div className="md:col-span-8 lg:col-span-7 flex flex-col justify-center order-1 md:order-2">
                                                      <div className="flex justify-between items-start mb-6">
                                                         <span className={`text-[10px] font-black px-3 py-1 border-2 border-black uppercase ${task.status === "Completed" ? 'bg-black text-white' : 'bg-transparent text-black'}`}>
                                                            {task.status}._
                                                         </span>
                                                         <span className="text-[8px] font-black opacity-30 mt-1">ENTRY_MN_00{idx+1}</span>
                                                      </div>
                                                      <h3 className="text-3xl md:text-5xl font-heading font-black mb-4 uppercase tracking-tighter leading-none">{task.title}</h3>
                                                      <p className="text-sm font-bold text-black/60 uppercase leading-relaxed max-w-xl">{task.description}</p>
                                                      <div className="mt-8 flex items-center gap-4">
                                                         <div className="h-px flex-1 bg-black/10"></div>
                                                         <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">LOG_CHECKED_BY::ENGINEER</span>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          ))}

                                          {/* ACTIVITY UPDATES (Integrated) */}
                                          {project.updates.map(upd => (
                                             <div key={upd._id} className="border-l-[12px] border-black bg-white/50 p-10 relative">
                                                <span className="absolute top-0 right-10 text-[100px] font-black opacity-[0.03] select-none pointer-events-none font-heading">{new Date(upd.createdAt).getDate()}</span>
                                                <div className="flex flex-col md:flex-row gap-10 items-start">
                                                   <div className="w-48 flex-shrink-0 pt-2 border-t-2 border-black/10">
                                                      <div className="text-xs font-black uppercase mb-1">{new Date(upd.createdAt).toLocaleDateString()}</div>
                                                      <div className="text-[8px] font-black text-[#ff5c00] uppercase tracking-[0.3em] animate-pulse">LIVE_ACTIVITY</div>
                                                   </div>
                                                   <div className="flex-1 space-y-6">
                                                      <div className="flex items-center gap-4">
                                                         <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-heading text-xl">{upd.authorId?.name?.charAt(0) || "S"}</div>
                                                         <h4 className="text-2xl font-heading font-black uppercase text-[#ff5c00]">{upd.title}</h4>
                                                      </div>
                                                      <p className="text-sm font-bold text-black/80 uppercase leading-relaxed max-w-2xl">{upd.content}</p>
                                                      {upd.images?.[0] && (
                                                         <div className="border-[10px] border-white shadow-2xl max-w-xl group overflow-hidden">
                                                            <img src={getOptimizedImage(upd.images[0])} alt="" className="w-full grayscale hover:grayscale-0 transition-all duration-700" />
                                                         </div>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </section>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* ZONE 03: SYSTEM UTILITY & RESOURCES (24%) */}
                        <div className={`lg:col-span-3 border-l-2 border-black/5 flex flex-col h-full bg-white/30 backdrop-blur-md overflow-hidden ${activeTab !== "UTILS" ? 'hidden lg:flex' : 'flex'}`}>
                           <div className="p-8 border-b-2 border-black bg-white">
                              <div className="flex items-center gap-2 mb-2 opacity-40">
                                 <FaLayerGroup size={10} />
                                 <span className="text-[8px] font-black tracking-widest">UTL.RES_MTRX</span>
                              </div>
                              <h3 className="text-xl font-heading font-black tracking-tighter">UTILITIES</h3>
                           </div>
                           
                           <div className="flex-1 overflow-y-auto scrollbar-tech p-8 space-y-12">
                              {projects.filter(p => p._id === expandedProject).map(project => (
                                 <div key={project._id} className="space-y-12">
                                    {/* Material Matrix */}
                                    <div className="space-y-8">
                                       <h4 className="text-[10px] font-black uppercase tracking-widest border-b-2 border-[#ff5c00] pb-2 inline-block">RES_INDEX</h4>
                                       <div className="space-y-6">
                                          {project.materials.map(m => {
                                             const pct = Math.round((m.quantityUsed / m.quantityAllocated) * 100);
                                             return (
                                                <div key={m._id} className="space-y-3 relative">
                                                   <div className="flex justify-between items-end">
                                                      <span className="text-xs font-black uppercase">{m.materialId?.name}</span>
                                                      <span className={`text-[10px] font-black ${pct > 90 ? 'text-[#ff5c00]' : 'text-black'}`}>{pct}%</span>
                                                   </div>
                                                   <div className="h-1.5 bg-black/5 relative overflow-hidden">
                                                      <div className={`h-full ${pct > 90 ? 'bg-[#ff5c00]' : 'bg-black'} transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                                                   </div>
                                                   <div className="flex justify-between items-center text-[7px] font-black opacity-30 uppercase">
                                                      <span>CONSUMED: {m.quantityUsed}</span>
                                                      <span>ALLOCATED: {m.quantityAllocated}</span>
                                                   </div>
                                                </div>
                                             );
                                          })}
                                       </div>
                                    </div>

                                    {/* System Actions */}
                                    <div className="bg-black p-8 relative overflow-hidden">
                                       <div className="absolute top-2 right-2 text-white/5 text-6xl font-black">STN</div>
                                       <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">SECURE_ACTIONS</h4>
                                       <div className="space-y-4">
                                          <Link to="/support" className="block">
                                             <button className="w-full py-5 bg-[#ff5c00] text-black font-black text-[10px] tracking-widest hover:bg-white transition-all uppercase flex items-center justify-center gap-3">
                                                <FaEnvelope /> INITIATE_COMMS
                                             </button>
                                          </Link>
                                          <button onClick={() => toast.info("Audit Log Downloaded.")} className="w-full py-5 border-2 border-white/20 text-white font-black text-[10px] tracking-widest hover:bg-white hover:text-black transition-all uppercase">DOWNLOAD_AUDIT</button>
                                       </div>
                                    </div>

                                    {/* Weather/Status Card */}
                                    <div className="border-2 border-black p-6 space-y-4 bg-white shadow-lg">
                                       <div className="flex items-center gap-2 text-[#ff5c00]">
                                          <FaHardHat />
                                          <span className="text-[9px] font-black uppercase">SITE_STATUS::READY</span>
                                       </div>
                                       <p className="text-[9px] font-bold text-black/50 uppercase leading-relaxed">System is performing optimal material tracking and monitoring active node data streams.</p>
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
