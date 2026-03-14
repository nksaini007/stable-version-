import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaHeadset, FaPlus, FaTicketAlt, FaSpinner, FaTimes, FaReply,
    FaCircle, FaRegClock, FaCheckCircle, FaExclamationCircle, FaUserShield
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
            const res = await axios.get("/api/support/architect", { headers: { Authorization: `Bearer ${token}` } });
            setTickets(res.data.tickets);
        } catch (err) {
            toast.error("Failed to load support tickets");
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (id) => {
        try {
            const res = await axios.get(`/api/support/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
            await axios.post(`/api/support/${activeTicket._id}/reply`, { text: replyText }, { headers: { Authorization: `Bearer ${token}` } });
            setReplyText("");
            fetchTicketDetails(activeTicket._id);
            fetchTickets(); // refresh list to update status if it changed to In Progress
        } catch (err) {
            toast.error("Failed to send reply");
        } finally {
            setReplying(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Open": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
            case "In Progress": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
            case "Resolved": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
            case "Closed": return "text-gray-400 bg-gray-500/10 border-gray-500/30";
            default: return "text-white bg-white/10";
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "Urgent": return <FaExclamationCircle className="text-red-500" />;
            case "High": return <FaCircle className="text-orange-500 text-[10px]" />;
            case "Medium": return <FaCircle className="text-blue-500 text-[10px]" />;
            case "Low": return <FaCircle className="text-gray-500 text-[10px]" />;
            default: return null;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1c]">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 text-white min-h-screen bg-[#0a0f1c]">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                    Client Support Tickets
                </h1>
                <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
                    <FaHeadset className="text-indigo-400" /> Respond to client queries regarding your assigned projects
                </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Tickets List (Left Panel) */}
                <div className="w-full lg:w-1/3 bg-[#1e293b]/60 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-white/5 bg-[#1e293b]/80">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FaTicketAlt className="text-indigo-400" /> Inbox
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full ml-auto">
                                {tickets.filter(t => t.status === "Open" || t.status === "In Progress").length} Active
                            </span>
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                        {tickets.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 text-sm">No support tickets found for your projects.</div>
                        ) : (
                            tickets.map((t) => (
                                <button
                                    key={t._id}
                                    onClick={() => fetchTicketDetails(t._id)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${activeTicket?._id === t._id ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-[#0f172a]/50 border-white/5 hover:border-white/20"}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(t.status)}`}>
                                            {t.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs font-bold bg-[#1e293b] px-2 py-0.5 rounded">
                                            {getPriorityIcon(t.priority)} <span className="text-gray-400">{t.priority}</span>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{t.subject}</h4>
                                    <p className="text-xs text-indigo-300 mb-2 truncate">Project: {t.projectId?.name}</p>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                                        <span>{t.customerId?.name}</span>
                                        <span className="flex items-center gap-1"><FaRegClock /> {new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Ticket Details & Chat (Right Panel) */}
                <div className="w-full lg:w-2/3 bg-[#1e293b]/60 border border-white/10 rounded-3xl overflow-hidden flex flex-col relative">
                    {activeTicket ? (
                        <>
                            {/* Ticket Header */}
                            <div className="p-6 border-b border-white/5 bg-[#1e293b]/80 shrink-0">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className={`text-[11px] uppercase font-bold px-3 py-1 rounded border ${getStatusColor(activeTicket.status)}`}>
                                        {activeTicket.status}
                                    </span>
                                    <span className="text-xs text-gray-400 bg-[#0f172a] px-3 py-1 rounded border border-white/5">
                                        Project: <strong className="text-white">{activeTicket.projectId?.name || "N/A"}</strong>
                                    </span>
                                    <span className="text-xs text-gray-400 bg-[#0f172a] px-3 py-1 rounded border border-white/5">
                                        Category: <strong className="text-white">{activeTicket.category}</strong>
                                    </span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{activeTicket.subject}</h2>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                        {activeTicket.customerId?.name?.charAt(0) || "C"}
                                    </div>
                                    <span className="text-gray-300">Opened by <strong className="text-white">{activeTicket.customerId?.name}</strong></span>
                                </div>
                            </div>

                            {/* Thread / Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#0a0f1c]/50">
                                {activeTicket.thread.map((msg, i) => {
                                    const isMe = msg.sender?._id === user?._id;
                                    const isAdmin = msg.senderRole === "admin";
                                    const isCustomer = msg.senderRole === "customer";

                                    return (
                                        <div key={i} className={`flex gap-4 ${isMe ? "flex-row-reverse" : ""}`}>
                                            {/* Avatar */}
                                            <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md mt-1"
                                                style={{
                                                    background: isMe ? "linear-gradient(135deg, #6366f1, #a855f7)" :
                                                        isAdmin ? "linear-gradient(135deg, #ef4444, #f97316)" :
                                                            "linear-gradient(135deg, #3b82f6, #0ea5e9)"
                                                }}>
                                                {isAdmin ? <FaUserShield /> : (msg.sender?.name?.charAt(0) || "U")}
                                            </div>

                                            {/* Message Bubble */}
                                            <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                                                <div className={`mb-1 flex items-center gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                                    <span className="text-xs font-bold text-gray-300">{msg.sender?.name || "Unknown"}</span>
                                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-white/10 ${isAdmin ? "bg-red-500/20 text-red-400" : isMe ? "bg-indigo-500/20 text-indigo-300" : "bg-blue-500/20 text-blue-300"
                                                        }`}>
                                                        {msg.senderRole}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap ${isMe
                                                    ? "bg-indigo-500 text-white rounded-tr-sm"
                                                    : isAdmin
                                                        ? "bg-[#1e293b] text-gray-200 border border-red-500/30 rounded-tl-sm shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                                                        : "bg-[#1e293b] text-gray-200 border border-white/5 rounded-tl-sm"
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
                                <div className="p-4 bg-[#1e293b]/90 border-t border-white/5 shrink-0">
                                    <form onSubmit={handleReply} className="flex gap-3">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply to the client..."
                                            className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none h-12 min-h-[48px] max-h-32 transition-all scrollbar-hide"
                                            rows="1"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleReply(e);
                                                }
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyText.trim() || replying}
                                            className="shrink-0 px-6 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {replying ? <FaSpinner className="animate-spin" /> : <FaReply />} Send
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-500/10 border-t border-gray-500/20 text-center text-sm font-bold text-gray-500 shrink-0">
                                    This ticket is closed. No further replies can be added.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                            <FaHeadset className="text-6xl mb-4 text-gray-700" />
                            <h3 className="text-xl font-bold text-gray-400">Select a Ticket</h3>
                            <p className="mt-2 text-sm max-w-xs">Choose a support ticket from the list to view details and reply to the client.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchitectSupport;
