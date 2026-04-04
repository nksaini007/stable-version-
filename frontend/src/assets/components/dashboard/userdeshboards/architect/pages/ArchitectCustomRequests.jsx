import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaTasks, FaCheckCircle, FaHourglassHalf, FaExternalLinkAlt, FaClipboardList, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const ArchitectCustomRequests = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/custom-plans/my-assignments");
            setRequests(data.requests || []);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
            toast.error("Cloud synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestCompletion = async (id) => {
        if (!window.confirm("Broadcast completion request to Stinchar HQ for final assurance?")) return;
        try {
            await API.patch(`/custom-plans/${id}/request-completion`);
            toast.success("Completion protocol initiated");
            fetchMyRequests();
        } catch (error) {
            toast.error("Request transmission failed");
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "assigned": return "ACTIVE DESIGN";
            case "completion_requested": return "PENDING ASSURANCE";
            case "verified": return "ARCHIVED / FINALIZED";
            default: return status.toUpperCase();
        }
    };

    return (
        <div className="p-8 bg-[#080808] min-h-screen text-[#A0A0A0]">
            {/* Header section with architect bio-tech feel */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8">
                <div>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-3">
                        <span className="w-10 h-[1px] bg-[#333]"></span>
                        <span className="text-[10px] font-bold text-[#555] uppercase tracking-[0.4em]">Stinchar Architect Terminal / v4.2</span>
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight uppercase">
                        ASSIGNED <span className="font-bold text-[#66FCF1]">SPECIFICATIONS</span>
                    </h1>
                </div>
                <div className="mt-6 md:mt-0 text-right">
                    <p className="text-[10px] font-bold text-[#66FCF1] uppercase tracking-[0.2em]">{user?.name || "Architect"}</p>
                    <p className="text-[8px] text-[#444] font-mono mt-1 uppercase">Certified Personnel Id: {user?._id?.substring(0,8)}</p>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-16 h-16 border-2 border-[#1A1A1C] border-t-[#66FCF1] rounded-full animate-spin"></div>
                    <span className="text-[9px] font-bold tracking-[0.5em] text-[#333] uppercase">Decoding Assigned Logic</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {requests.map((req, index) => (
                        <motion.div 
                            key={req._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-[#0C0C0C] border border-white-[0.03] p-8 relative group hover:border-[#66FCF1]/20 transition-all shadow-2xl"
                        >
                            {/* Card Decorative elements */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#66FCF1]/5 to-transparent pointer-events-none"></div>
                            <div className="absolute bottom-4 right-4 text-[8px] font-mono text-[#222] select-none group-hover:text-[#66FCF1]/10 transition-colors uppercase">
                                STIN-REQ-{req._id.substring(0,6)}
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${req.status === 'assigned' ? 'bg-[#66FCF1] animate-pulse shadow-[0_0_8px_#66FCF1]' : 'bg-[#333]'}`}></div>
                                        <span className="text-[9px] font-bold text-[#66FCF1] uppercase tracking-[0.3em]">{getStatusText(req.status)}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight uppercase group-hover:text-[#66FCF1] transition-colors">
                                        {req.planId?.title || "System Protocol"}
                                    </h2>
                                </div>
                                <div className="p-3 bg-[#1A1A1C] border border-white/5">
                                    <FaTasks className="text-[#66FCF1] text-xs" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-[#080808] border-l-2 border-[#1A1A1C] p-4 group-hover:border-[#66FCF1]/30 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaClipboardList className="text-[#333] text-[10px]" />
                                        <span className="text-[8px] font-bold text-[#444] uppercase tracking-widest">User Requirements</span>
                                    </div>
                                    <p className="text-[11px] text-[#888] leading-relaxed italic font-light">
                                        "{req.requirements || "Awaiting design directives."}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border border-white/5 bg-[#0A0A0A]">
                                        <p className="text-[7px] font-bold text-[#444] uppercase tracking-widest mb-1">Target Client</p>
                                        <p className="text-[10px] text-white font-medium truncate">{req.userId?.name || "Restricted"}</p>
                                    </div>
                                    <div className="p-4 border border-white/5 bg-[#0A0A0A]">
                                        <p className="text-[7px] font-bold text-[#444] uppercase tracking-widest mb-1">Protocol Date</p>
                                        <p className="text-[10px] text-white font-medium">{new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaInfoCircle className="text-[#333] text-[10px]" />
                                    <span className="text-[8px] text-[#444] font-bold uppercase tracking-widest">Priority Alpha</span>
                                </div>
                                
                                <div className="flex gap-3">
                                    {req.status === "assigned" && (
                                        <button 
                                            onClick={() => handleRequestCompletion(req._id)}
                                            className="px-6 py-2.5 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-[#66FCF1] transition-all flex items-center gap-2"
                                        >
                                            <FaCheckCircle /> BROADCAST COMPLETION
                                        </button>
                                    )}
                                    <button className="px-5 py-2.5 bg-[#1A1A1C] text-[#66FCF1] text-[9px] font-bold uppercase tracking-widest border border-white/5 hover:border-[#66FCF1]/30 transition-all flex items-center gap-2">
                                        <FaExternalLinkAlt className="text-[8px]" /> BASE PLAN
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {requests.length === 0 && (
                        <div className="col-span-full py-40 text-center border border-dashed border-white/5">
                            <FaHourglassHalf className="text-3xl text-[#1A1A1C] mx-auto mb-6" />
                            <h3 className="text-[10px] font-bold text-[#333] uppercase tracking-[0.5em]">No active design protocols assigned to this node</h3>
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse-cyan {
                    0% { box-shadow: 0 0 0 0 rgba(102, 252, 241, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(102, 252, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(102, 252, 241, 0); }
                }
            ` }} />
        </div>
    );
};

export default ArchitectCustomRequests;
