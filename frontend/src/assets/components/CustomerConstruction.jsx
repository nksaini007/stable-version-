import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt, FaUserTie, FaTasks,
    FaHardHat, FaBullhorn, FaCubes, FaChevronDown, FaChevronUp,
    FaEnvelope, FaTerminal, FaCrosshairs, FaShieldAlt
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

    const toggleExpand = (id) => {
        setExpandedProject(expandedProject === id ? null : id);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#e5e5e5] flex flex-col justify-center items-center gap-4 font-mono">
            <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
            <p className="text-black font-black uppercase text-[10px] tracking-widest mt-2">INIT_CONSTRUCTION_WORKSPACE...</p>
        </div>
    );

    return (
        <div className="bg-[#e5e5e5] min-h-screen text-black font-mono selection:bg-[#ff5c00] selection:text-black overflow-hidden flex flex-col pt-20">
            <Nev />
            
            {/* 🏁 INDUSTRIAL GRID OVERLAY */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <main className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col px-4 md:px-8 border-t-4 border-black">
                
                {!token ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-black text-white flex items-center justify-center mb-8 border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.1)]">
                            <FaShieldAlt className="text-3xl text-[#ff5c00]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-heading font-black mb-4 uppercase tracking-tighter">Access Reserved</h2>
                        <p className="text-black/50 max-w-sm mx-auto mb-10 font-bold uppercase text-xs leading-loose tracking-widest">
                           IDENTIFICATION_REQUIRED. PLEASE AUTHENTICATE TO ACCESS SECURE PROJECT DATA STREAM.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/login" className="px-12 py-5 bg-black text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff5c00] hover:text-black transition-all">
                                [ LOGIN_INIT ]
                            </Link>
                            <Link to="/signup" className="px-12 py-5 border-4 border-black text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all text-center">
                                CREATE_NODE
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-0">
                        
                        {/* LEFT SIDEBAR: HUD & NAVIGATION */}
                        <div className="md:col-span-3 border-r-4 border-black p-8 hidden md:flex flex-col justify-between bg-white/50">
                           <div>
                              <div className="flex items-center gap-2 mb-8 bg-black text-white px-3 py-1 self-start inline-flex">
                                 <FaTerminal size={12} />
                                 <span className="text-[10px] font-black tracking-widest uppercase">SYSTM_CNTL</span>
                              </div>
                              <div className="flex flex-col gap-1 mb-10">
                                 <span className="text-[#ff5c00] font-black text-[9px] tracking-[0.4em]">// 00_CORE_STRM</span>
                                 <h1 className="text-5xl font-pixel text-lattice leading-[0.85] tracking-tighter uppercase font-black">
                                    CONST<br/>RUCT
                                 </h1>
                              </div>

                              <div className="space-y-4">
                                 <div className="text-[9px] font-black opacity-30 tracking-[0.3em] mb-4">ACTIVE_NODES</div>
                                 {projects.map((p, idx) => (
                                    <div 
                                      key={p._id} 
                                      className={`p-3 border-l-4 cursor-pointer transition-all ${expandedProject === p._id ? 'border-[#ff5c00] bg-black text-white' : 'border-black/10 hover:border-black'}`}
                                      onClick={() => setExpandedProject(p._id)}
                                    >
                                       <span className="text-[8px] font-black block leading-none opacity-50 mb-1">NODE_00{idx+1}</span>
                                       <span className="text-[10px] font-black uppercase tracking-tight truncate block">{p.name}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="mt-12">
                              <div className="h-16 w-full mb-4 bg-black/5 flex items-end gap-1 p-2 border border-black/10">
                                 {[...Array(18)].map((_, i) => (
                                    <div key={i} className="flex-1 bg-black/20" style={{ height: `${Math.random() * 100}%` }}></div>
                                 ))}
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-black uppercase opacity-40">
                                 <span>VER: 2.4.0</span>
                                 <span>STAT: DEPLOYED</span>
                              </div>
                           </div>
                        </div>

                        {/* RIGHT MAIN PANEL: PROJECT DETAILS */}
                        <div className="md:col-span-9 flex flex-col">
                           
                           {/* HEADER BAR */}
                           <div className="h-14 bg-black flex items-center px-8 justify-between">
                              <div className="flex gap-4">
                                 {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-8 h-full skew-x-[30deg] border-r border-white/20"></div>
                                 ))}
                              </div>
                              <div className="text-white text-[10px] font-black tracking-[0.4em] flex items-center gap-3">
                                 <FaCrosshairs size={12} className="text-[#ff5c00]" />
                                 SECURE_WORKSPACE_ACTIVE
                              </div>
                           </div>

                           <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                              {projects.length === 0 ? (
                                 <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-30 select-none">
                                    <FaHardHat size={80} className="mb-6" />
                                    <h3 className="text-2xl font-black uppercase tracking-tight">No Active Projects</h3>
                                    <p className="text-[10px] font-black uppercase mt-2">SYSTEM_IDLE: Awaiting project assignment.</p>
                                 </div>
                              ) : (
                                 <div className="space-y-12">
                                    {projects.filter(p => p._id === expandedProject).map((project) => (
                                       <div key={project._id} className="space-y-10 animate-in fade-in duration-700">
                                          
                                          {/* PROJECT HEADER CARD */}
                                          <div className="border-4 border-black p-8 md:p-12 relative overflow-hidden bg-white">
                                             <div className="absolute top-0 right-0 p-8 flex flex-col items-end opacity-10 select-none">
                                                <span className="font-heading text-8xl md:text-9xl font-vertical leading-none tracking-tighter">{project.type?.charAt(0) || "P"}</span>
                                             </div>

                                             <div className="relative z-10">
                                                <div className="flex flex-wrap gap-4 mb-6">
                                                   <span className="bg-black text-white px-4 py-1 text-[9px] font-black uppercase tracking-widest">{project.type}._</span>
                                                   <span className="border-2 border-black px-4 py-1 text-[9px] font-black uppercase tracking-widest text-[#ff5c00]">{project.status}</span>
                                                   <span className="bg-[#ff5c00] text-black px-4 py-1 text-[9px] font-black uppercase tracking-widest">LOC: {project.location}</span>
                                                </div>
                                                <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tight leading-none mb-8 uppercase max-w-3xl">
                                                   {project.name}
                                                </h2>

                                                <div className="flex flex-col md:flex-row gap-12 items-start md:items-end">
                                                   <div className="flex-1 w-full">
                                                      <div className="flex justify-between items-end mb-4">
                                                         <span className="text-[10px] font-black uppercase tracking-widest opacity-50">COMPLETION_INDEX</span>
                                                         <span className="text-4xl font-heading font-black">{project.progressPercentage}%</span>
                                                      </div>
                                                      <div className="h-6 border-4 border-black p-1 relative overflow-hidden">
                                                         <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${project.progressPercentage}%` }}
                                                            className={`h-full ${project.progressPercentage === 100 ? "bg-black" : "bg-[#ff5c00] animate-pulse"}`}
                                                         />
                                                      </div>
                                                   </div>
                                                   <div className="flex-shrink-0 bg-black text-white p-6 shadow-[10px_10px_0px_rgba(255,92,0,0.4)]">
                                                      <span className="text-[8px] font-black block opacity-50 uppercase mb-2">Principal Architect</span>
                                                      <div className="flex items-center gap-3">
                                                         <div className="w-10 h-10 border border-white/20 flex items-center justify-center font-heading text-xl">
                                                            {project.architectId?.name?.charAt(0) || "A"}
                                                         </div>
                                                         <p className="text-sm font-black uppercase tracking-tight">{project.architectId?.name || "ASSIGNING..."}</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>

                                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                             
                                             {/* LEFT: FEED & LOGS */}
                                             <div className="lg:col-span-8 space-y-12">
                                                
                                                {/* MILESTONES SECTION */}
                                                <section>
                                                   <div className="flex items-center gap-4 mb-8">
                                                      <span className="bg-[#ff5c00] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">01_MILESTONES._</span>
                                                      <div className="flex-1 h-[2px] bg-black"></div>
                                                   </div>
                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                      {project.tasks.length === 0 ? (
                                                         <div className="col-span-full py-10 border-2 border-black border-dashed flex items-center justify-center">
                                                            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">DATA_LOG_EMPTY</span>
                                                         </div>
                                                      ) : (
                                                         project.tasks.map((task, idx) => (
                                                            <div key={task._id} className="border-2 border-black p-6 group hover:bg-[#ff5c00] transition-colors relative overflow-hidden">
                                                               <div className="absolute top-0 right-0 p-2 opacity-5 font-heading text-4xl">{idx+1}</div>
                                                               <div className="flex justify-between items-start mb-4">
                                                                  <span className={`text-[8px] font-black px-2 py-0.5 border border-black uppercase ${task.status === "Completed" ? 'bg-black text-white' : 'bg-transparent text-black'}`}>
                                                                     {task.status}
                                                                  </span>
                                                               </div>
                                                               <h4 className="text-xl font-heading font-black mb-2 uppercase truncate">{task.title}</h4>
                                                               <p className="text-[11px] font-bold text-black/60 leading-relaxed uppercase">{task.description}</p>
                                                               {task.images?.[0] && (
                                                                  <div className="mt-6 border-2 border-black overflow-hidden aspect-video">
                                                                     <img src={getOptimizedImage(task.images[0])} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                                  </div>
                                                               )}
                                                            </div>
                                                         ))
                                                      )}
                                                   </div>
                                                </section>

                                                {/* SITE UPDATES FEED */}
                                                <section>
                                                   <div className="flex items-center gap-4 mb-8">
                                                      <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">02_SITE_COMMUNICATIONS._</span>
                                                      <div className="flex-1 h-[2px] bg-black/10"></div>
                                                   </div>
                                                   <div className="space-y-6">
                                                      {project.updates.length === 0 ? (
                                                         <div className="p-8 border-2 border-black border-dashed flex items-center justify-center">
                                                            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">STREAM_OFFLINE</span>
                                                         </div>
                                                      ) : (
                                                         project.updates.map(upd => (
                                                            <div key={upd._id} className="border-2 border-black p-8 bg-white flex flex-col md:flex-row gap-8 items-start">
                                                               <div className="w-24 flex-shrink-0">
                                                                  <div className="text-[10px] font-black uppercase opacity-40 mb-1">{new Date(upd.createdAt).toLocaleDateString()}</div>
                                                                  <div className="text-[8px] font-black text-[#ff5c00] uppercase tracking-widest animate-pulse">LOG_ENTRY</div>
                                                               </div>
                                                               <div className="flex-1">
                                                                  <div className="flex items-center gap-3 mb-4">
                                                                     <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[10px] font-heading">
                                                                        {upd.authorId?.name?.charAt(0) || "S"}
                                                                     </div>
                                                                     <h4 className="text-lg font-heading font-black uppercase">{upd.title}</h4>
                                                                  </div>
                                                                  <p className="text-xs font-bold text-black/70 leading-relaxed uppercase mb-6">{upd.content}</p>
                                                                  {upd.images?.[0] && (
                                                                     <div className="border-4 border-black max-w-xl">
                                                                        <img src={getOptimizedImage(upd.images[0])} alt="" className="w-full grayscale hover:grayscale-0 transition-all" />
                                                                     </div>
                                                                  )}
                                                               </div>
                                                            </div>
                                                         ))
                                                      )}
                                                   </div>
                                                </section>
                                             </div>

                                             {/* RIGHT: RESOURCES & DASHBOARD */}
                                             <div className="lg:col-span-4 space-y-8">
                                                
                                                {/* RESOURCE HUB */}
                                                <div className="border-4 border-black p-8 bg-white">
                                                   <h3 className="text-sm font-heading font-black mb-8 border-b-4 border-[#ff5c00] pb-2 uppercase tracking-tight">RES_INDEX._</h3>
                                                   <div className="space-y-8">
                                                      {project.materials.length === 0 ? (
                                                         <div className="text-center py-6 opacity-20">
                                                            <FaCubes size={30} className="mx-auto mb-2" />
                                                            <span className="text-[9px] font-black uppercase">Null Allocation</span>
                                                         </div>
                                                      ) : (
                                                         project.materials.map(m => {
                                                            const percentage = Math.round((m.quantityUsed / m.quantityAllocated) * 100);
                                                            return (
                                                               <div key={m._id} className="space-y-2">
                                                                  <div className="flex justify-between items-end">
                                                                     <span className="text-xs font-black uppercase">{m.materialId?.name}</span>
                                                                     <span className={`text-[10px] font-black ${percentage > 90 ? 'text-[#ff5c00]' : 'text-black'}`}>{percentage}% USED</span>
                                                                  </div>
                                                                  <div className="h-1 bg-black/10">
                                                                     <div className={`h-full ${percentage > 90 ? 'bg-[#ff5c00]' : 'bg-black'}`} style={{ width: `${percentage}%` }}></div>
                                                                  </div>
                                                                  <div className="text-[8px] font-black opacity-40 uppercase tracking-tighter">
                                                                     STK: {m.quantityUsed} / {m.quantityAllocated} {m.materialId?.unit}
                                                                  </div>
                                                               </div>
                                                            );
                                                         })
                                                      )}
                                                   </div>
                                                </div>

                                                {/* ACTIONS HUB */}
                                                <div className="border-4 border-black p-8 bg-black text-white space-y-6">
                                                   <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-4">Command Center</h3>
                                                   <p className="text-[10px] font-black leading-relaxed uppercase opacity-70">Execute secure communication with the principal site architect or request material audit.</p>
                                                   <Link to="/support" className="block">
                                                      <button className="w-full py-5 bg-[#ff5c00] text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-3">
                                                         <FaEnvelope /> DIRECT_CONNECT
                                                      </button>
                                                   </Link>
                                                   <button 
                                                      onClick={() => toast.info("Audit packet generated. check your stinchar mail.") }
                                                      className="w-full py-5 border-2 border-white/20 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                                                   >
                                                      REQUST_AUDIT
                                                   </button>
                                                </div>

                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CustomerConstruction;
