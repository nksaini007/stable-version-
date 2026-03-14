import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { FaEnvelope, FaReply, FaComments, FaPlus, FaTimes, FaCircle, FaSpinner } from "react-icons/fa";
import Nev from "../Nev";

const CustomerSupport = () => {
    const { token, user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    // New Ticket Modal
    const [showNewModal, setShowNewModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: "", category: "General", priority: "Medium", projectId: "", message: "" });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketRes, projRes] = await Promise.all([
                axios.get("/api/support/my", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/construction/my-projects", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTickets(ticketRes.data.tickets);
            setProjects(projRes.data.projects);
        } catch (error) {
            toast.error("Failed to load your inquiries.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (id) => {
        try {
            const res = await axios.get(`/api/support/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedTicket(res.data.ticket);
        } catch (err) {
            toast.error("Failed to load ticket details");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await axios.post("/api/support", newTicket, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Support ticket created!");
            setShowNewModal(false);
            setNewTicket({ subject: "", category: "General", priority: "Medium", projectId: "", message: "" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create ticket");
        } finally {
            setCreating(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setSendingReply(true);
            await axios.post(`/api/support/${selectedTicket._id}/reply`, { text: replyText }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Reply sent successfully.");
            setReplyText("");
            fetchTicketDetails(selectedTicket._id);
            fetchData(); // refresh list to update any status changes
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Open": return "bg-blue-100 text-blue-600 border-blue-200";
            case "In Progress": return "bg-amber-100 text-amber-600 border-amber-200";
            case "Resolved": return "bg-emerald-100 text-emerald-600 border-emerald-200";
            case "Closed": return "bg-gray-100 text-gray-500 border-gray-200";
            default: return "bg-gray-100 text-gray-400 border-gray-200";
        }
    };

    if (!token) {
        return <div className="min-h-screen text-center pt-40">Please log in to view your inquiries.</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <Nev />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                            <FaEnvelope className="text-blue-500" /> Support Tickets
                        </h1>
                        <p className="text-gray-500 mt-2">Get help with your projects or general inquiries.</p>
                    </div>
                    <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-500/20">
                        <FaPlus /> New Ticket
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
                    {/* INBOX LIST */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                            Your Tickets ({tickets.length})
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading your tickets...</div>
                            ) : tickets.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500 h-full">
                                    <FaComments className="text-4xl text-gray-300 mb-3" />
                                    <p>You haven't opened any tickets yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {tickets.map(t => (
                                        <div key={t._id} onClick={() => fetchTicketDetails(t._id)}
                                            className={`p-5 cursor-pointer transition-all hover:bg-gray-50 ${selectedTicket?._id === t._id ? "bg-blue-50 border-l-4 border-blue-500" : "border-l-4 border-transparent"}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800 line-clamp-1 pr-2 text-sm">{t.subject}</h4>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border whitespace-nowrap ${getStatusColor(t.status)}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                            {t.projectId && <p className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-2 border border-blue-100 font-semibold">{t.projectId.name}</p>}
                                            <div className="flex justify-between items-center text-xs text-gray-400">
                                                <span>{t.category}</span>
                                                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* THREAD VIEW */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
                        {selectedTicket ? (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded border ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">{selectedTicket.category}</span>
                                        {selectedTicket.priority === "Urgent" && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded flex items-center gap-1"><FaCircle className="text-[8px]" /> Urgent</span>}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedTicket.subject}</h2>
                                    {selectedTicket.projectId && <p className="text-sm text-gray-500">Project: <span className="font-semibold text-gray-700">{selectedTicket.projectId.name}</span></p>}
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                                    {selectedTicket.thread.map((msg, idx) => {
                                        const isCustomer = msg.senderRole === "customer" || msg.senderRole === "user";
                                        const isAdmin = msg.senderRole === "admin";
                                        return (
                                            <div key={idx} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold ${isCustomer ? "text-gray-500 uppercase" : isAdmin ? "text-red-500 uppercase" : "text-blue-600 uppercase"}`}>
                                                        {isCustomer ? "You" : isAdmin ? "Admin Support" : "Project Architect"}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                                                </div>
                                                <div className={`p-4 rounded-2xl max-w-[85%] text-sm shadow-sm ${isCustomer ? "bg-blue-600 text-white rounded-tr-sm" : isAdmin ? "bg-red-50 border border-red-100 text-gray-800 rounded-tl-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200"}`}>
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Reply Box */}
                                <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
                                    {selectedTicket.status === "Closed" || selectedTicket.status === "Resolved" ? (
                                        <div className="text-center p-4 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 font-medium text-sm">
                                            This ticket is {selectedTicket.status.toLowerCase()}. If you need further assistance, please open a new ticket.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleReply} className="flex gap-4">
                                            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." required
                                                className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none h-14" />
                                            <button type="submit" disabled={sendingReply || !replyText.trim()} className="px-6 rounded-xl font-bold flex items-center gap-2 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 h-14">
                                                {sendingReply ? <FaSpinner className="animate-spin" /> : <FaReply />} <span className="hidden sm:inline">Reply</span>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <FaComments className="text-6xl mb-4 text-gray-200" />
                                <p className="font-medium text-gray-500">Select a ticket to view the conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW TICKET MODAL */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 lg:p-8 relative">
                        <button onClick={() => setShowNewModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"><FaTimes /></button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FaEnvelope className="text-blue-500" /> Open Support Ticket</h3>

                        <form onSubmit={handleCreateTicket} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subject *</label>
                                <input type="text" value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} required
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Briefly describe the issue" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <select value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                                        <option value="General">General Inquiry</option>
                                        <option value="Project">My Project</option>
                                        <option value="Billing">Billing & Payments</option>
                                        <option value="Technical">Technical Issue</option>
                                        <option value="Complaint">Complaint</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                                    <select value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Related Project (Optional)</label>
                                <select value={newTicket.projectId} onChange={e => setNewTicket({ ...newTicket, projectId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                                    <option value="">-- None --</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Message *</label>
                                <textarea value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })} required rows={4}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Provide details here..." />
                            </div>

                            <button type="submit" disabled={creating} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                                {creating ? <FaSpinner className="animate-spin" /> : null} Submit Ticket
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSupport;
