import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt, FaUserTie, FaTasks,
    FaHardHat, FaBullhorn, FaCubes, FaChevronDown, FaChevronUp,
    FaEnvelope, FaTerminal, FaCrosshairs, FaShieldAlt, FaInfoCircle, FaImage, FaBoxOpen, FaLayerGroup, FaExchangeAlt
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
    const [activeTab, setActiveTab] = useState("STREAM"); // Mobile: NODES, STREAM, UTILS

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

    const handleNodeSelect = (projectId) => {
       setExpandedProject(projectId);
       if (window.innerWidth < 768) {
          setActiveTab("STREAM");
       }
    };

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
            
            {/* MOBILE NAV (Bottom Bar) - Fixed High Z-Index & Contrast */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-black border-t-4 border-[#ff5c00] flex shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                <button onClick={() => setActiveTab("NODES")} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "NODES" ? 'bg-[#ff5c00] text-black scale-100' : 'text-white/40 opacity-70'}`}>
                   <FaTerminal size={14} /> NODES
                </button>
                <button onClick={() => setActiveTab("STREAM")} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "STREAM" ? 'bg-[#ff5c00] text-black scale-100' : 'text-white/40 opacity-70'}`}>
                   <FaCrosshairs size={14} /> STREAM
                </button>
                <button onClick={() => setActiveTab("UTILS")} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "UTILS" ? 'bg-[#ff5c00] text-black scale-100' : 'text-white/40 opacity-70'}`}>
                   <FaLayerGroup size={14} /> UTILS
                </button>
            </div>

            <main className="relative z-10 w-full max-w-[2500px] mx-auto flex-1 flex flex-col md:grid md:grid-cols-12 h-[calc(100vh-5rem)] overflow-hidden">
                {!token ? (
                    <div className="md:col-span-12 flex flex-col items-center justify-center p-20 text-center">
                        <FaShieldAlt className="text-6xl text-[#ff5c00] mb-8" />
                        <h2 className="text-5xl font-heading font-black mb-4 uppercase tracking-tighter">Access Reserved</h2>
                        <Link to="/login" className="px-12 py-5 bg-black text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-[#ff5c00] transition-all">[ AUTHENTICATE ]</Link>
                    </div>
                ) : (
                    <>
                        {/* ZONE 01: NODE LIST (Sidebar) */}
                        <div className={`md:col-span-2 border-r-2 border-black/5 flex flex-col h-full bg-white/30 backdrop-blur-md overflow-hidden ${activeTab !== "NODES" ? 'hidden md:flex' : 'flex'}`}>
                           <div className="p-8 border-b-2 border-black bg-black text-white">
                              <div className="flex items-center gap-2 mb-2 opacity-40">
                                 <FaTerminal size={10} />
                                 <span className="text-[8px] font-black tracking-widest uppercase">PNL_01_NODES</span>
                              </div>
                              <h3 className="text-xl font-heading font-black tracking-tighter uppercase">Operations</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto scrollbar-tech p-4 py-8 space-y-4 pb-32">
                              {projects.length === 0 ? (
                                 <div className="text-center py-10 opacity-20 text-[10px] font-black uppercase">No Nodes Detected.</div>
                              ) : (
                                 projects.map((p, idx) => (
                                    <div 
                                      key={p._id} 
                                      onClick={() => handleNodeSelect(p._id)}
                                      className={`p-5 border-2 transition-all cursor-pointer relative group ${expandedProject === p._id ? 'border-black bg-black text-white' : 'border-black/5 bg-white/50 hover:border-black'}`}
                                    >
                                       <div className="absolute top-2 right-2 text-[7px] font-black opacity-30 uppercase">Node_{idx+1}</div>
                                       <span className={`w-2 h-2 rounded-full absolute top-2 left-2 ${expandedProject === p._id ? 'bg-[#ff5c00] animate-pulse' : 'bg-black/10'}`}></span>
                                       <span className="text-[11px] font-black uppercase tracking-tight block mt-3 leading-tight truncate">{p.name}</span>
                                       <span className="text-[7px] font-black opacity-40 uppercase mt-1 block tracking-wider truncate">{p.location}</span>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>

                        {/* ZONE 02: CENTRAL COMMAND STREAM */}
                        <div className={`md:col-span-10 lg:col-span-7 flex flex-col h-full overflow-hidden ${activeTab !== "STREAM" ? 'hidden md:flex' : 'flex'}`}>
                           {/* HEADER BAR (Fixed Area) - Added Mobile Project Switcher */}
                           <div className="bg-white border-b-2 border-black flex flex-col p-6 px-4 md:px-10 gap-4 flex-shrink-0 relative overflow-hidden">
                              {projects.filter(p => p._id === expandedProject).map(project => (
                                 <React.Fragment key={project._id}>
                                    <div className="flex justify-between items-start">
                                       <div className="flex-1">
                                          <div className="flex items-center gap-4 mb-2">
                                             <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase">{project.type}</span>
                                             <span className="text-[#ff5c00] font-black text-[9px] tracking-widest uppercase animate-pulse">● NODE_SYNC</span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <h1 className="text-2xl md:text-5xl font-heading font-black leading-none uppercase tracking-tighter truncate max-w-[200px] md:max-w-none">{project.name}</h1>
                                             <button onClick={() => setActiveTab("NODES")} className="md:hidden p-2 border border-black/10 text-[#ff5c00] text-[9px] font-black uppercase flex items-center gap-1 hover:bg-black hover:text-white transition-all">
                                                <FaExchangeAlt /> [Switch]
                                             </button>
                                          </div>
                                       </div>
                                       <div className="text-right hidden sm:block">
                                          <span className="text-[9px] font-black opacity-30 block mb-1">COMPLETION_INDEX</span>
                                          <span className="text-3xl font-heading font-black">{project.progressPercentage}%</span>
                                       </div>
                                    </div>
                                    <div className="h-4 border-2 border-black p-0.5 relative overflow-hidden bg-white/50 w-full lg:max-w-xl">
                                       <motion.div initial={{ width: 0 }} animate={{ width: `${project.progressPercentage}%` }} className="h-full bg-black" />
                                    </div>
                                 </React.Fragment>
                              ))}
                           </div>

                           {/* SPLIT FEED AREA */}
                           <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-20 md:pb-0">
                              {/* SUB-ZONE A: MILESTONE LOG (Independent Scroll) */}
                              <div className="lg:w-[40%] h-1/2 lg:h-full border-b-2 lg:border-b-0 lg:border-r-2 border-black/5 flex flex-col overflow-hidden">
                                 <div className="p-4 px-10 border-b border-black/5 bg-black/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">SEC_01_TASK_LOG</span>
                                    <FaTasks size={10} className="opacity-20" />
                                 </div>
                                 <div className="flex-1 overflow-y-auto scrollbar-tech p-6 md:p-10 space-y-6">
                                    {projects.filter(p => p._id === expandedProject).map(project => (
                                       <div key={project._id} className="space-y-6">
                                          {project.tasks.length === 0 ? (
                                             <div className="text-center py-10 opacity-20 text-[10px] font-black uppercase">No Tasks Logged.</div>
                                          ) : (
                                             project.tasks.map((task, idx) => (
                                                <div key={task._id} className="bg-white border-2 border-black/5 p-6 relative group overflow-hidden shadow-sm hover:shadow-lg transition-all">
                                                   <div className="corner-decal decal-tl"></div>
                                                   <div className="corner-decal decal-br"></div>
                                                   <span className={`text-[8px] font-black px-2 py-0.5 border border-black uppercase mb-4 inline-block ${task.status === "Completed" ? 'bg-black text-white' : 'text-black'}`}>{task.status}._</span>
                                                   <h4 className="text-lg font-heading font-black uppercase mb-2 tracking-tighter leading-tight">{task.title}</h4>
                                                   <p className="text-[10px] font-bold text-black/50 uppercase leading-relaxed mb-4">{task.description}</p>
                                                   {task.images?.[0] && (
                                                      <div className="border border-black/10 aspect-video overflow-hidden mt-4 bg-black/5">
                                                         <img src={getOptimizedImage(task.images[0])} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                      </div>
                                                   )}
                                                </div>
                                             ))
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* SUB-ZONE B: LIVE ACTIVITY FEED (Independent Scroll) */}
                              <div className="lg:w-[60%] h-1/2 lg:h-full flex flex-col overflow-hidden">
                                 <div className="p-4 px-10 border-b border-black/5 bg-black/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">SEC_02_LIVE_STREAM</span>
                                    <FaBullhorn size={10} className="opacity-20" />
                                 </div>
                                 <div className="flex-1 overflow-y-auto scrollbar-tech p-6 md:p-10 space-y-12 pb-32 lg:pb-12">
                                    {projects.filter(p => p._id === expandedProject).map(project => (
                                       <div key={project._id} className="space-y-12">
                                          {project.updates.length === 0 ? (
                                             <div className="text-center py-20 opacity-20"><FaCrosshairs size={40} className="mx-auto mb-4" /><span className="text-[10px] font-black">NO_SYNCHRONIZED_DATA</span></div>
                                          ) : (
                                             project.updates.map(upd => (
                                                <div key={upd._id} className="border-l-4 border-black p-8 relative bg-white/30 backdrop-blur-sm group">
                                                   <div className="flex items-center justify-between mb-4">
                                                      <div className="flex items-center gap-3">
                                                         <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-heading text-lg">{upd.authorId?.name?.charAt(0) || "S"}</div>
                                                         <p className="text-[9px] font-black uppercase">{new Date(upd.createdAt).toLocaleDateString()}</p>
                                                      </div>
                                                      <span className="text-[7px] font-black text-[#ff5c00] uppercase tracking-widest animate-pulse">LIVE_SYNC</span>
                                                   </div>
                                                   <h4 className="text-2xl font-heading font-black uppercase mb-3 text-black/80">{upd.title}</h4>
                                                   <p className="text-xs font-bold text-black/60 uppercase leading-relaxed mb-6">{upd.content}</p>
                                                   {upd.images?.[0] && (
                                                      <div className="border-4 border-black overflow-hidden aspect-video shadow-2xl relative bg-black/5">
                                                         <img src={getOptimizedImage(upd.images[0])} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                         <div className="absolute inset-0 border-[10px] border-black/5 pointer-events-none"></div>
                                                      </div>
                                                   )}
                                                </div>
                                             ))
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* ZONE 03: SYSTEM UTILITIES (Tools, Materials, Actions) */}
                        <div className={`md:col-span-3 border-l-2 border-black/5 flex flex-col h-full bg-white/40 backdrop-blur-lg overflow-hidden ${activeTab !== "UTILS" ? 'hidden md:flex lg:flex' : 'flex'}`}>
                           <div className="p-8 border-b-2 border-black bg-white">
                              <div className="flex items-center gap-2 mb-2 opacity-40">
                                 <FaLayerGroup size={10} />
                                 <span className="text-[8px] font-black tracking-widest uppercase">SEC_03_RESOURCE_HUB</span>
                              </div>
                              <h3 className="text-xl font-heading font-black tracking-tighter uppercase">Utilities</h3>
                           </div>
                           
                           <div className="flex-1 overflow-y-auto scrollbar-tech p-8 space-y-12 pb-40 md:pb-12">
                              {projects.filter(p => p._id === expandedProject).map(project => (
                                 <div key={project._id} className="space-y-10">
                                    <div className="space-y-8">
                                       <h4 className="text-[10px] font-black uppercase tracking-widest border-b-2 border-[#ff5c00] pb-2 inline-block">MATERIAL_MATRIX</h4>
                                       <div className="space-y-6">
                                          {project.materials.length === 0 ? (
                                             <div className="opacity-20 text-[10px] font-black uppercase">No Material Data.</div>
                                          ) : (
                                             project.materials.map(m => {
                                                const pct = Math.round((m.quantityUsed / m.quantityAllocated) * 100);
                                                return (
                                                   <div key={m._id} className="space-y-2">
                                                      <div className="flex justify-between items-end">
                                                         <span className="text-[10px] font-black uppercase tracking-tight truncate w-3/4">{m.materialId?.name}</span>
                                                         <span className={`text-[10px] font-black ${pct > 90 ? 'text-[#ff5c00]' : 'text-black'}`}>{pct}%</span>
                                                      </div>
                                                      <div className="h-1.5 bg-black/10 overflow-hidden"><div className={`h-full ${pct > 90 ? 'bg-[#ff5c00]' : 'bg-black'} transition-all duration-700`} style={{ width: `${pct}%` }}></div></div>
                                                      <p className="text-[7px] font-black opacity-30 uppercase">Alloc: {m.quantityAllocated} | Used: {m.quantityUsed}</p>
                                                   </div>
                                                );
                                             })
                                          )}
                                       </div>
                                    </div>

                                    <div className="bg-black p-8 text-white relative overflow-hidden group border-b-8 border-[#ff5c00]">
                                       <div className="absolute -top-4 -right-4 text-[#ff5c00]/20 text-6xl opacity-30 rotate-12"><FaShieldAlt /></div>
                                       <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-6">COMMAND_ACTIONS</h4>
                                       <div className="space-y-4">
                                          <Link to="/support" className="block relative z-10"><button className="w-full py-5 bg-[#ff5c00] text-black font-black text-[10px] tracking-[0.2em] hover:bg-white uppercase flex items-center justify-center gap-3"><FaEnvelope /> CONNECT_ARCHITECT</button></Link>
                                          <button onClick={() => toast.info("Audit Log Request Transmitted.")} className="w-full py-5 border-2 border-white/20 text-white font-black text-[10px] tracking-[0.2em] hover:bg-white hover:text-black transition-all uppercase relative z-10">REQUEST_FULL_AUDIT</button>
                                       </div>
                                    </div>
                                    
                                    <div className="border-4 border-black p-6 space-y-4 bg-white shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
                                       <div className="flex items-center gap-2 text-black/40">
                                          <FaInfoCircle size={10} />
                                          <span className="text-[8px] font-black uppercase tracking-widest">DIAGNOSTIC_MSG</span>
                                       </div>
                                       <div className="text-[9px] font-bold text-black opacity-60 uppercase leading-relaxed">Active stream monitoring successful. Project node {project._id.slice(-6)} is broadcasting real-time data to command deck.</div>
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
