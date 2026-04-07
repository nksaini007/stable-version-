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

    if (loading) return (
        <div className="min-h-screen bg-[#e5e5e5] flex flex-col justify-center items-center gap-4 font-mono">
            <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
            <p className="text-black font-black uppercase text-[10px] tracking-widest mt-2">INIT_CONSTRUCTION_WORKSPACE...</p>
        </div>
    );

    return (
        <div className="bg-[#e5e5e5] min-h-screen text-black font-mono selection:bg-[#ff5c00] selection:text-black overflow-hidden flex flex-col pt-20">
            <Nev />
            
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <main className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col md:grid md:grid-cols-12 border-t-4 border-black h-[calc(100vh-5.5rem)] overflow-hidden">
                
                {!token ? (
                    <div className="md:col-span-12 flex flex-col items-center justify-center py-20 text-center">
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
                    <>
                        <div className="md:col-span-3 border-r-4 border-black p-4 md:p-8 flex flex-col justify-between bg-white/50 h-full overflow-hidden">
                           <div className="flex-1 flex flex-col overflow-hidden">
                              <div className="flex items-center gap-2 mb-8 bg-black text-white px-3 py-1 self-start inline-flex flex-shrink-0">
                                 <FaTerminal size={12} />
                                 <span className="text-[10px] font-black tracking-widest uppercase">SYSTM_CNTL</span>
                              </div>
                              <div className="flex flex-col gap-1 mb-8 flex-shrink-0">
                                 <span className="text-[#ff5c00] font-black text-[9px] tracking-[0.4em]">// 00_CORE_STRM</span>
                                 <h1 className="text-4xl lg:text-5xl font-pixel text-lattice leading-[0.85] tracking-tighter uppercase font-black">
                                    CONST<br/>RUCT
                                 </h1>
                              </div>

                              <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                                 <div className="text-[9px] font-black opacity-30 tracking-[0.3em] mb-4 uppercase">ACTIVE_NODES</div>
                                 <div className="space-y-4">
                                    {projects.map((p, idx) => (
                                       <div 
                                         key={p._id} 
                                         className={`p-4 border-2 cursor-pointer transition-all ${expandedProject === p._id ? 'border-black bg-black text-white' : 'border-black/5 hover:border-black'}`}
                                         onClick={() => setExpandedProject(p._id)}
                                       >
                                          <div className="flex justify-between items-start mb-1">
                                             <span className="text-[7px] font-black opacity-50 uppercase tracking-tighter">NODE_00{idx+1}</span>
                                             {expandedProject === p._id && <div className="w-1.5 h-1.5 bg-[#ff5c00] rounded-full animate-pulse"></div>}
                                          </div>
                                          <span className="text-[11px] font-black uppercase tracking-tight truncate block leading-tight">{p.name}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="mt-8 pt-4 border-t border-black/5 flex-shrink-0 hidden md:block">
                              <div className="h-12 w-full mb-4 bg-black/5 flex items-end gap-1 p-1 border border-black/5">
                                 {[...Array(14)].map((_, i) => (
                                    <div key={i} className={`flex-1 ${i % 3 === 0 ? 'bg-[#ff5c00]' : 'bg-black/20'}`} style={{ height: `${Math.random() * 100}%` }}></div>
                                 ))}
                              </div>
                              <div className="flex justify-between items-center text-[7px] font-black uppercase opacity-40">
                                 <span>VER: 2.4.0</span>
                                 <span>STAT: ACTIVE_STREAM</span>
                              </div>
                           </div>
                        </div>

                        <div className="md:col-span-9 flex flex-col h-full overflow-hidden bg-white/30 backdrop-blur-sm">
                           <div className="h-10 bg-black flex items-center px-6 justify-between flex-shrink-0">
                              <div className="flex gap-4 h-full">
                                 {[...Array(8)].map((_, i) => (
                                    <div key={i} className="w-6 h-full skew-x-[30deg] border-r border-white/10"></div>
                                 ))}
                              </div>
                              <div className="text-white text-[9px] font-black tracking-[0.4em] flex items-center gap-3">
                                 <FaCrosshairs size={10} className="text-[#ff5c00]" />
                                 SECURE_WORKSPACE_STINCHAR.V2
                              </div>
                           </div>

                           <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
                              {projects.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-30 select-none">
                                    <FaHardHat size={80} className="mb-6 opacity-20" />
                                    <h3 className="text-2xl font-black uppercase tracking-tight">No Active Projects</h3>
                                    <p className="text-[10px] font-black uppercase mt-2">SYSTEM_IDLE: Awaiting project assignment.</p>
                                 </div>
                              ) : (
                                 <div className="space-y-12 pb-20">
                                    {projects.filter(p => p._id === expandedProject).map((project) => (
                                       <div key={project._id} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                          <div className="border-4 border-black p-6 md:p-10 relative overflow-hidden bg-white shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
                                             <div className="absolute top-0 right-0 p-4 flex flex-col items-end opacity-10 select-none pointer-events-none">
                                                <span className="font-heading text-8xl md:text-9xl font-vertical leading-none tracking-tighter">{project.type?.charAt(0) || "P"}</span>
                                             </div>
                                             <div className="relative z-10 w-full">
                                                <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
                                                   <span className="bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em]">{project.type}._</span>
                                                   <span className="border-2 border-black px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#ff5c00]">{project.status}</span>
                                                   <span className="bg-[#ff5c00] text-black px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em]">LOC: {project.location}</span>
                                                </div>
                                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-none mb-8 uppercase max-w-4xl break-words">
                                                   {project.name}
                                                </h2>
                                                <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-end w-full">
                                                   <div className="flex-1 w-full order-2 lg:order-1">
                                                      <div className="flex justify-between items-end mb-3">
                                                         <span className="text-[9px] font-black uppercase tracking-widest opacity-40">COMPLETION_INDEX:</span>
                                                         <span className="text-3xl font-heading font-black">{project.progressPercentage}%</span>
                                                      </div>
                                                      <div className="h-5 border-4 border-black p-0.5 relative overflow-hidden bg-black/5">
                                                         <motion.div initial={{ width: 0 }} animate={{ width: `${project.progressPercentage}%` }} className={`h-full ${project.progressPercentage === 100 ? "bg-black" : "bg-[#ff5c00]"}`} />
                                                      </div>
                                                   </div>
                                                   <div className="flex-shrink-0 bg-black text-white p-5 w-full lg:w-64 border-l-4 border-[#ff5c00] order-1 lg:order-2">
                                                      <span className="text-[7px] font-black block opacity-40 uppercase mb-2 tracking-[0.2em]">PRINCIPAL_ARCHITECT:</span>
                                                      <div className="flex items-center gap-3">
                                                         <div className="w-9 h-9 border border-white/20 flex items-center justify-center font-heading text-lg bg-white/5">{project.architectId?.name?.charAt(0) || "A"}</div>
                                                         <p className="text-xs font-black uppercase tracking-tight truncate">{project.architectId?.name || "ASSIGNING..."}</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>

                                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                             <div className="lg:col-span-8 space-y-12">
                                                <section>
                                                   <div className="flex items-center gap-4 mb-8">
                                                      <span className="bg-[#ff5c00] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">01_MILESTONES._</span>
                                                      <div className="flex-1 h-[2px] bg-black"></div>
                                                   </div>
                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                      {project.tasks.length === 0 ? (
                                                         <div className="col-span-full py-10 border-2 border-black border-dashed flex items-center justify-center"><span className="text-[10px] font-black opacity-30 uppercase tracking-widest">DATA_LOG_EMPTY</span></div>
                                                      ) : (
                                                         project.tasks.map((task, idx) => (
                                                            <div key={task._id} className="border-2 border-black p-6 group hover:bg-[#ff5c00] transition-colors relative overflow-hidden">
                                                               <div className="absolute top-0 right-0 p-2 opacity-5 font-heading text-4xl">{idx+1}</div>
                                                               <span className={`text-[8px] font-black px-2 py-0.5 border border-black uppercase mb-4 inline-block ${task.status === "Completed" ? 'bg-black text-white' : 'bg-transparent text-black'}`}>{task.status}</span>
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

                                                <section>
                                                   <div className="flex items-center gap-4 mb-8">
                                                      <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">02_SITE_COMMUNICATIONS._</span>
                                                      <div className="flex-1 h-[2px] bg-black/10"></div>
                                                   </div>
                                                   <div className="space-y-6">
                                                      {project.updates.length === 0 ? (
                                                         <div className="p-8 border-2 border-black border-dashed flex items-center justify-center"><span className="text-[10px] font-black opacity-30 uppercase tracking-widest">STREAM_OFFLINE</span></div>
                                                      ) : (
                                                         project.updates.map(upd => (
                                                            <div key={upd._id} className="border-2 border-black p-8 bg-white flex flex-col md:flex-row gap-8 items-start">
                                                               <div className="w-24 flex-shrink-0">
                                                                  <div className="text-[10px] font-black uppercase opacity-40 mb-1">{new Date(upd.createdAt).toLocaleDateString()}</div>
                                                                  <div className="text-[8px] font-black text-[#ff5c00] uppercase tracking-widest animate-pulse">LOG_ENTRY</div>
                                                               </div>
                                                               <div className="flex-1">
                                                                  <div className="flex items-center gap-3 mb-4">
                                                                     <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[10px] font-heading">{upd.authorId?.name?.charAt(0) || "S"}</div>
                                                                     <h4 className="text-lg font-heading font-black uppercase">{upd.title}</h4>
                                                                  </div>
                                                                  <p className="text-xs font-bold text-black/70 leading-relaxed uppercase mb-6">{upd.content}</p>
                                                                  {upd.images?.[0] && <div className="border-4 border-black max-w-xl"><img src={getOptimizedImage(upd.images[0])} alt="" className="w-full grayscale hover:grayscale-0 transition-all" /></div>}
                                                               </div>
                                                            </div>
                                                         ))
                                                      )}
                                                   </div>
                                                </section>
                                             </div>

                                             <div className="lg:col-span-4 space-y-8">
                                                <div className="border-4 border-black p-8 bg-white">
                                                   <h3 className="text-sm font-heading font-black mb-8 border-b-4 border-[#ff5c00] pb-2 uppercase tracking-tight">RES_INDEX._</h3>
                                                   <div className="space-y-8">
                                                      {project.materials.length === 0 ? (
                                                         <div className="text-center py-6 opacity-20"><FaCubes size={30} className="mx-auto mb-2" /><span className="text-[9px] font-black uppercase">Null Allocation</span></div>
                                                      ) : (
                                                         project.materials.map(m => {
                                                            const percentage = Math.round((m.quantityUsed / m.quantityAllocated) * 100);
                                                            return (
                                                               <div key={m._id} className="space-y-2">
                                                                  <div className="flex justify-between items-end"><span className="text-xs font-black uppercase">{m.materialId?.name}</span><span className={`text-[10px] font-black ${percentage > 90 ? 'text-[#ff5c00]' : 'text-black'}`}>{percentage}% USED</span></div>
                                                                  <div className="h-1 bg-black/10"><div className={`h-full ${percentage > 90 ? 'bg-[#ff5c00]' : 'bg-black'}`} style={{ width: `${percentage}%` }}></div></div>
                                                                  <div className="text-[8px] font-black opacity-40 uppercase tracking-tighter">STK: {m.quantityUsed} / {m.quantityAllocated} {m.materialId?.unit}</div>
                                                               </div>
                                                            );
                                                         })
                                                      )}
                                                   </div>
                                                </div>

                                                <div className="border-4 border-black p-8 bg-black text-white space-y-6">
                                                   <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-4">Command Center</h3>
                                                   <p className="text-[10px] font-black leading-relaxed uppercase opacity-70">Execute secure communication with the principal site architect.</p>
                                                   <Link to="/support" className="block"><button className="w-full py-5 bg-[#ff5c00] text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-3"><FaEnvelope /> DIRECT_CONNECT</button></Link>
                                                   <button onClick={() => toast.info("Audit packet generated.") } className="w-full py-5 border-2 border-white/20 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">REQUST_AUDIT</button>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              )}
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
