import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaHeadset, FaSearch, FaFilter, FaSpinner, FaReply, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const AdminSupport = () => {
    const { token } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");

    // Selected ticket state
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (token) fetchTickets();
    }, [token]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await API.get("/support/all");
            setTickets(res.data.tickets);
        } catch (error) {
            toast.error("Failed to load support tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setUpdating(true);
            await API.post(`/support/${selectedTicket._id}/reply`, { text: replyText });
            toast.success("Reply sent");
            setReplyText("");
            await fetchSpecificTicket(selectedTicket._id);
            fetchTickets(); // refresh list
        } catch (error) {
            toast.error("Failed to reply");
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            setUpdating(true);
            await API.put(`/support/${selectedTicket._id}/status`, { status });
            toast.success(`Ticket marked as ${status}`);
            await fetchSpecificTicket(selectedTicket._id);
            fetchTickets();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const fetchSpecificTicket = async (id) => {
        try {
            const res = await API.get(`/support/${id}`);
            setSelectedTicket(res.data.ticket);
        } catch (error) {
            toast.error("Failed to fetch latest ticket data");
        }
    };

    const selectTicket = (t) => {
        // Automatically fetch fresh data
        setSelectedTicket(t);
        fetchSpecificTicket(t._id);
    };

    const filteredTickets = filterStatus === "All" ? tickets : tickets.filter(t => t.status === filterStatus);

    if (loading) return <div className="p-8 text-center flex justify-center"><FaSpinner className="animate-spin text-3xl text-indigo-500" /></div>;

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FaHeadset className="text-indigo-400" /> Support Desk</h1>
                    <p className="text-[#8E929C] text-sm mt-1">Manage all client support tickets, project issues, and inquiries.</p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Panel: Ticket List */}
                <div className="w-1/3 bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl  border border-[#2A2B2F] flex flex-col min-h-0">
                    <div className="p-4 border-b border-[#2A2B2F] flex justify-between items-center bg-[#121212]/50">
                        <h2 className="font-bold text-gray-200">Inbox ({filteredTickets.length})</h2>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#1A1B1E] border border-[#2A2B2F] border border-[#2A2B2F] rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-0">
                            <option value="All">All Tickets</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredTickets.length === 0 ? (
                            <div className="p-8 text-center text-[#6B7280] text-sm">No tickets found matching this filter.</div>
                        ) : (
                            <div className="space-y-1">
                                {filteredTickets.map(t => (
                                    <button key={t._id} onClick={() => selectTicket(t)} className={`w-full text-left p-4 rounded-xl transition-all border ${selectedTicket?._id === t._id ? 'bg-indigo-50 border-indigo-200 ' : 'border-transparent hover:bg-[#121212]'}`}>
                                        <div className="flex justify-between mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase truncate ${t.priority === 'Urgent' || t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-[#121212] text-[#8E929C]'}`}>{t.priority}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${t.status === 'Open' ? 'bg-blue-100 text-blue-700' : t.status === 'Resolved' || t.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                                        </div>
                                        <h4 className="font-bold text-white text-sm truncate">{t.subject}</h4>
                                        <div className="flex justify-between mt-2 text-xs text-[#8E929C]">
                                            <span className="truncate pr-2">{t.customerId?.name || "Client"}</span>
                                            <span className="whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Ticket Detail & Thread */}
                <div className="flex-1 bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl  border border-[#2A2B2F] flex flex-col min-h-0 relative">
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-[#2A2B2F] bg-[#121212]/50 flex flex-wrap justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                                    <div className="flex gap-4 text-sm text-[#8E929C] mt-2">
                                        <p><span className="font-semibold text-[#8E929C]">From:</span> {selectedTicket.customerId?.name} ({selectedTicket.customerId?.email})</p>
                                        {selectedTicket.projectId && <p><span className="font-semibold text-[#8E929C]">Project:</span> <span className="text-indigo-400 font-medium">{selectedTicket.projectId.name}</span></p>}
                                        <p><span className="font-semibold text-[#8E929C]">Category:</span> {selectedTicket.category}</p>
                                    </div>
                                </div>

                                {/* Status Controls */}
                                <div className="flex flex-col items-end gap-2">
                                    <select value={selectedTicket.status} onChange={(e) => handleStatusUpdate(e.target.value)} disabled={updating}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border  outline-none cursor-pointer ${selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            selectedTicket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                        <option value="Open">Status: Open</option>
                                        <option value="In Progress">Status: In Progress</option>
                                        <option value="Resolved">Status: Resolved</option>
                                        <option value="Closed">Status: Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Conversation Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {selectedTicket.thread.map((msg, idx) => {
                                    const isAdmin = msg.senderRole === "admin";
                                    const isCustomer = msg.senderRole === "customer" || msg.senderRole === "user";
                                    return (
                                        <div key={idx} className={`flex max-w-[85%] ${isAdmin ? "ml-auto" : "mr-auto"}`}>
                                            <div className={`p-4 rounded-2xl  ${isAdmin ? "bg-white text-black rounded-tr-sm" : isCustomer ? "bg-[#121212] text-white rounded-tl-sm border border-[#2A2B2F]" : "bg-blue-50 text-white rounded-tl-sm border border-blue-100"}`}>
                                                <div className="flex justify-between items-center mb-2 gap-4">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isAdmin ? "text-indigo-200" : isCustomer ? "text-[#8E929C]" : "text-blue-400"}`}>
                                                        {isAdmin ? "Admin (You)" : isCustomer ? "Client" : "Architect"}
                                                    </span>
                                                    <span className={`text-[10px] ${isAdmin ? "text-indigo-300" : "text-[#6B7280]"}`}>
                                                        {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reply Box */}
                            <div className="p-4 border-t border-[#2A2B2F] bg-[#121212] rounded-b-2xl">
                                <form onSubmit={handleReply} className="flex gap-3">
                                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} required placeholder="Type your support response... Note that the client and architect (if assigned) can see this."
                                        className="flex-1 border border-[#2A2B2F] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-0 resize-none h-16 " />
                                    <button type="submit" disabled={updating || !replyText.trim()} className="px-6 bg-white text-black hover:bg-gray-200 text-white font-bold rounded-xl  disabled:opacity-50 transition-colors flex items-center gap-2">
                                        <FaReply /> Reply
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col text-[#6B7280]">
                            <FaHeadset className="text-6xl mb-4 text-gray-200" />
                            <p className="font-medium text-[#8E929C]">Select a ticket from the inbox to view details</p>
                        </div>
                    )}

                    {/* Overlay spinner when updating specific ticket actions */}
                    {updating && selectedTicket && (
                        <div className="absolute inset-0 bg-[#1A1B1E] border border-[#2A2B2F]/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                            <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-3 rounded-xl  border border-[#2A2B2F] flex items-center gap-3">
                                <FaSpinner className="animate-spin text-indigo-400" />
                                <span className="font-semibold text-sm text-gray-200">Updating...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
