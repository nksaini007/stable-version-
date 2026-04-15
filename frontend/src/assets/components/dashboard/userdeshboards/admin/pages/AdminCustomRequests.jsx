import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { toast } from "react-toastify";
import { FaUserTie, FaCheckCircle, FaHourglassHalf, FaTools, FaEye, FaClipboardList } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminCustomRequests = () => {
    const [requests, setRequests] = useState([]);
    const [architects, setArchitects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedArchitect, setSelectedArchitect] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, archRes] = await Promise.all([
                API.get("/custom-plans/all"),
                API.get("/users/all?role=architect")
            ]);
            setRequests(reqRes.data.requests || []);
            setArchitects(Array.isArray(archRes.data) ? archRes.data : archRes.data.users || []);
        } catch (error) {
            console.error("Failed to load requests", error);
            toast.error("Failed to sync with customization registry");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedArchitect) return toast.warning("Select an architect for assignment");
        try {
            await API.patch(`/custom-plans/${selectedRequest._id}/assign`, { architectId: selectedArchitect });
            toast.success("Architect assigned successfully");
            setShowAssignModal(false);
            fetchData();
        } catch (error) {
            toast.error("Assignment failed");
        }
    };

    const handleVerify = async (id) => {
        if (!window.confirm("Assure completion of this project? This will finalize the design protocol.")) return;
        try {
            await API.patch(`/custom-plans/${id}/verify-completion`);
            toast.success("Project finalized and assured");
            fetchData();
        } catch (error) {
            toast.error("Verification protocol failed");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Assigned": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Execution Requested": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <div className="p-8 bg-[#0B0C10] min-h-screen text-[#C5C6C7]">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white tracking-[0.2em] uppercase">CUSTOM <span className="text-[#66FCF1]">REQUEST REGISTRY</span></h1>
                <p className="text-[10px] text-[#45A29E] uppercase tracking-[0.4em] mt-2 italic font-light">Stinchar Engineering Verification Protocol</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="w-20 h-[1px] bg-[#1F2833] overflow-hidden relative">
                        <motion.div 
                            className="absolute inset-x-0 bg-[#66FCF1] h-full"
                            animate={{ left: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.5em] text-[#45A29E] uppercase">Retrieving Data Packets</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {requests.map((req) => (
                        <motion.div 
                            key={req._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1A1B1E] border border-[#2A2B2F] overflow-hidden hover:border-[#66FCF1]/50 transition-all group flex flex-col h-full"
                        >
                            {/* Request Header */}
                            <div className="p-6 border-b border-[#2A2B2F] bg-[#121212] flex justify-between items-start">
                                <div>
                                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 border ${getStatusStyle(req.status)}`}>
                                        {req.status.replace("_", " ")}
                                    </span>
                                    <h3 className="text-white font-bold mt-3 tracking-tight group-hover:text-[#66FCF1] transition-colors uppercase">
                                        {req.basePlan?.title || "SYSTEM PLAN"}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-[#45A29E] uppercase tracking-widest leading-none mb-1">Requester</p>
                                    <p className="text-[10px] text-white font-medium">{req.customer?.name || "ANONYMOUS"}</p>
                                </div>
                            </div>

                            {/* Requirements Preview */}
                            <div className="p-6 flex-1 bg-[#1A1B1E]">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaClipboardList className="text-[#45A29E] text-[10px]" />
                                    <span className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Client Briefing</span>
                                </div>
                                <p className="text-[11px] text-[#C5C6C7] leading-relaxed line-clamp-4 italic border-l-2 border-[#1F2833] pl-3 py-1">
                                    "{req.requirements || "No specific modifications stated."}"
                                </p>

                                {req.assignedArchitect && (
                                    <div className="mt-6 pt-4 border-t border-[#2A2B2F] flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaUserTie className="text-[#66FCF1] text-xs" />
                                            <div>
                                                <p className="text-[7px] font-bold text-[#45A29E] uppercase tracking-widest">Assigned Lead</p>
                                                <p className="text-[10px] text-white font-bold">{req.assignedArchitect.name || "SYSTEM ARCHITECT"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Mesh */}
                            <div className="p-6 bg-[#0B0C10] border-t border-[#2A2B2F] flex gap-3">
                                {req.status === "Pending" && (
                                    <button 
                                        onClick={() => { setSelectedRequest(req); setShowAssignModal(true); }}
                                        className="flex-1 bg-[#66FCF1] text-[#0B0C10] py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(102,252,241,0.1)]"
                                    >
                                        <FaTools className="text-[10px]" /> ASSIGN LEAD
                                    </button>
                                )}
                                {req.status === "Execution Requested" && (
                                    <button 
                                        onClick={() => handleVerify(req._id)}
                                        className="flex-1 bg-emerald-500 text-white py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaCheckCircle className="text-[10px]" /> FINAL ASSURANCE
                                    </button>
                                )}
                                <button className="px-4 bg-[#1F2833] text-white py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#66FCF1] hover:text-[#0B0C10] transition-all flex items-center justify-center gap-2 border border-[#2A2B2F]">
                                    <FaEye className="text-[10px]" /> DETS
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {requests.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-[#1A1B1E] border border-dashed border-[#2A2B2F]">
                            <FaHourglassHalf className="text-3xl text-[#1F2833] mx-auto mb-4" />
                            <h3 className="text-sm font-bold text-[#45A29E] uppercase tracking-[0.3em]">No Active Customization Cycles</h3>
                        </div>
                    )}
                </div>
            )}

            {/* Assignment Hub Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10]/95 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1A1B1E] border border-[#2A2B2F] w-full max-w-md p-8 shadow-[0_0_50px_rgba(102,252,241,0.1)]"
                        >
                            <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                                <FaUserTie className="text-[#66FCF1]" /> ARCHITECT ASSIGNMENT
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest block mb-2">Select Certified Personnel</label>
                                    <select 
                                        value={selectedArchitect}
                                        onChange={(e) => setSelectedArchitect(e.target.value)}
                                        className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-4 focus:border-[#66FCF1] outline-none appearance-none"
                                    >
                                        <option value="">SELECT LEAD ARCHITECT</option>
                                        {architects.map(arch => (
                                            <option key={arch._id} value={arch._id}>{arch.name?.toUpperCase()} ({arch.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => setShowAssignModal(false)}
                                        className="flex-1 py-3 text-[9px] font-bold text-[#45A29E] uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Abort Cycle
                                    </button>
                                    <button 
                                        onClick={handleAssign}
                                        className="flex-2 bg-[#66FCF1] text-[#0B0C10] px-8 py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(102,252,241,0.2)]"
                                    >
                                        ACTIVATE LEAD
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCustomRequests;
