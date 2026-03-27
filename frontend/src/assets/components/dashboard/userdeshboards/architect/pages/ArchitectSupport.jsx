import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaHeadset, FaPlus, FaTicketAlt, FaSpinner, FaTimes, FaReply,
    FaCircle, FaRegClock, FaCheckCircle, FaExclamationCircle, FaUserShield, FaInbox, FaHistory
} from "react-icons/fa";

const ArchitectSupport = () => {
    const { token, user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTicket, setActiveTicket] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        if (token) fetchTickets();
    }, [token]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await API.get("/support/architect");
            setTickets(res.data.tickets);
        } catch (err) {
            toast.error("Failed to load support tickets");
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (id) => {
        try {
            const res = await API.get(`/support/${id}`);
            setActiveTicket(res.data.ticket);
        } catch (err) {
            toast.error("Failed to load ticket details");
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setReplying(true);
        try {
            await API.post(`/support/${activeTicket._id}/reply`, { text: replyText });
            setReplyText("");
            fetchTicketDetails(activeTicket._id);
            fetchTickets(); 
        } catch (err) {
            toast.error("Failed to send reply");
        } finally {
            setReplying(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Open": return "bg-white/5 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]";
            case "In Progress": return "bg-white/[0.02] border-white/10 text-gray-400";
            case "Resolved": return "bg-white text-black border-white";
            case "Closed": return "bg-transparent border-white/5 text-gray-600";
            default: return "bg-white/10 border-white/20 text-white";
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808]">
            <FaSpinner className="text-4xl animate-spin text-gray-800 mb-6" />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Synching Communication Channels...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-12 text-white min-h-screen bg-[#080808] font-sans selection:bg-white/10 flex flex-col">
            {/* Header Area */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-white opacity-20"></span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Client Relations</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Support Interface</h1>
                <p className="text-gray-500 mt-4 text-sm tracking-widest uppercase max-w-2xl leading-relaxed">
                    Direct communication node for active project inquiries and technical assistance.
                </p>
            </motion.div>

            <div className="flex flex-col xl:flex-row gap-10 flex-1 min-h-[700px]">
                {/* Tickets List (Left Panel) */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="w-full xl:w-[400px] bg-[#121214] border border-white/[0.03] rounded-[2.5rem] overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-white/[0.03] flex justify-between items-center">
                        <h3 className="text-[11px] text-gray-700 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <FaInbox className="opacity-30" /> Manifest
                        </h3>
                        <span className="px-3 py-1 bg-white/[0.02] border border-white/[0.05] rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {tickets.filter(t => t.status !== "Closed" && t.status !== "Resolved").length} Active
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scroller-hide">
                        {tickets.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center opacity-20">
                                <FaHistory size={40} className="mb-6" />
                                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Inbox Empty</p>
                            </div>
                        ) : (
                            tickets.map((t) => (
                                <button key={t._id} onClick={() => fetchTicketDetails(t._id)}
                                    className={`w-full text-left p-6 rounded-[1.8rem] transition-all duration-500 border group ${
                                        activeTicket?._id === t._id ? "bg-white/[0.05] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.02)]" : "bg-[#0C0C0C]/50 border-white/[0.03] hover:border-white/10"
                                    }`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStatusStyle(t.status)}`}>
                                            {t.status}
                                        </span>
                                        <span className="text-[8px] text-gray-700 font-black uppercase tracking-[0.2em]">{t.priority}</span>
                                    </div>
                                    <h4 className="font-bold text-white text-[14px] mb-2 uppercase tracking-tight line-clamp-1 group-hover:tracking-wider transition-all duration-500">{t.subject}</h4>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest truncate mb-4">OBJ: {t.projectId?.name || "UNLINKED"}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/[0.03]">
                                        <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{t.customerId?.name}</span>
                                        <span className="text-[9px] text-gray-800 flex items-center gap-1.5"><FaRegClock className="opacity-30" /> {new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Ticket Details & Chat (Right Panel) */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-[#121214] border border-white/[0.03] rounded-[2.5rem] overflow-hidden flex flex-col relative min-h-[600px]">
                    {activeTicket ? (
                        <>
                            {/* Ticket Header */}
                            <div className="p-10 border-b border-white/[0.03] bg-[#0C0C0C]/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="flex flex-wrap items-center gap-4 mb-6 relative z-10">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border ${getStatusStyle(activeTicket.status)}`}>
                                        {activeTicket.status}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-white/[0.02] px-4 py-1.5 rounded-xl border border-white/[0.05]">
                                        VECTOR: {activeTicket.projectId?.name || "GENERAL"}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-white/[0.02] px-4 py-1.5 rounded-xl border border-white/[0.05]">
                                        CATEGORY: {activeTicket.category}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight relative z-10">{activeTicket.subject}</h2>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs">
                                        {activeTicket.customerId?.name?.charAt(0) || "C"}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-0.5">Originator</p>
                                        <p className="text-white text-[13px] font-bold uppercase tracking-tight">{activeTicket.customerId?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thread / Chat Area */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 scroller-hide bg-[#0C0C0C]/20">
                                {activeTicket.thread.map((msg, i) => {
                                    const isMe = msg.sender?._id === user?._id;
                                    const isAdmin = msg.senderRole === "admin";

                                    return (
                                        <div key={i} className={`flex gap-6 ${isMe ? "flex-row-reverse" : ""}`}>
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-xs shadow-xl transition-all duration-500 ${
                                                isMe ? "bg-white" : isAdmin ? "bg-gray-800 text-white" : "bg-white/[0.05] text-white border border-white/10"
                                            }`}>
                                                {isAdmin ? <FaUserShield /> : (msg.sender?.name?.charAt(0) || "U")}
                                            </div>

                                            <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                                                <div className={`mb-3 flex items-center gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{msg.sender?.name || "EXTERNAL"}</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5 ${
                                                        isAdmin ? "text-red-400" : isMe ? "text-gray-500" : "text-white"
                                                    }`}>
                                                        {msg.senderRole}
                                                    </span>
                                                    <span className="text-[9px] text-gray-800 font-bold uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className={`p-8 rounded-[2rem] text-[13px] leading-relaxed tracking-wide shadow-2xl ${
                                                    isMe ? "bg-white text-black rounded-tr-md" : 
                                                    isAdmin ? "bg-[#121214] text-white border border-white/[0.05] rounded-tl-md" : 
                                                    "bg-white/[0.03] text-gray-400 border border-white/[0.03] rounded-tl-md"
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Reply Input */}
                            {activeTicket.status !== "Closed" ? (
                                <div className="p-8 bg-[#0C0C0C]/50 border-t border-white/[0.03]">
                                    <form onSubmit={handleReply} className="flex gap-4">
                                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="DECLARE RESPONSE MESSAGE..."
                                            className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[13px] text-white focus:outline-none focus:border-white/20 resize-none h-16 min-h-[64px] max-h-48 transition-all scroller-hide uppercase tracking-widest placeholder:text-gray-900"
                                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
                                        />
                                        <button type="submit" disabled={!replyText.trim() || replying}
                                            className="shrink-0 px-10 bg-white text-black rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-200 transition-all shadow-xl disabled:opacity-20 flex items-center gap-3">
                                            {replying ? <FaSpinner className="animate-spin text-[14px]" /> : <FaReply size={12} />} EXECUTE
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-8 bg-transparent border-t border-white/[0.01] text-center text-[10px] font-black text-gray-800 uppercase tracking-[0.4em]">
                                    Terminal Closed: Post-Operational Log
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-20 text-center">
                            <div className="w-24 h-24 bg-white/[0.01] border border-white/[0.03] border-dashed rounded-[2rem] flex items-center justify-center text-gray-800 mb-10">
                                <FaHeadset size={40} className="opacity-10" />
                            </div>
                            <h3 className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.4em]">Node selection required</h3>
                            <p className="mt-4 text-[10px] text-gray-800 font-bold uppercase tracking-widest max-w-xs leading-relaxed">Choose an active communication bridge from the catalog to initiate protocol.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ArchitectSupport;
