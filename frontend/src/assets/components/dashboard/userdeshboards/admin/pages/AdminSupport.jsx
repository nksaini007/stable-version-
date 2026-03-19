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
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaHeadset className="text-indigo-600" /> Support Desk</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all client support tickets, project issues, and inquiries.</p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Panel: Ticket List */}
                <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-0">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-700">Inbox ({filteredTickets.length})</h2>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="All">All Tickets</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredTickets.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No tickets found matching this filter.</div>
                        ) : (
                            <div className="space-y-1">
                                {filteredTickets.map(t => (
                                    <button key={t._id} onClick={() => selectTicket(t)} className={`w-full text-left p-4 rounded-xl transition-all border ${selectedTicket?._id === t._id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
                                        <div className="flex justify-between mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase truncate ${t.priority === 'Urgent' || t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${t.status === 'Open' ? 'bg-blue-100 text-blue-700' : t.status === 'Resolved' || t.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{t.subject}</h4>
                                        <div className="flex justify-between mt-2 text-xs text-gray-500">
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
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-0 relative">
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedTicket.subject}</h2>
                                    <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                        <p><span className="font-semibold text-gray-500">From:</span> {selectedTicket.customerId?.name} ({selectedTicket.customerId?.email})</p>
                                        {selectedTicket.projectId && <p><span className="font-semibold text-gray-500">Project:</span> <span className="text-indigo-600 font-medium">{selectedTicket.projectId.name}</span></p>}
                                        <p><span className="font-semibold text-gray-500">Category:</span> {selectedTicket.category}</p>
                                    </div>
                                </div>

                                {/* Status Controls */}
                                <div className="flex flex-col items-end gap-2">
                                    <select value={selectedTicket.status} onChange={(e) => handleStatusUpdate(e.target.value)} disabled={updating}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border shadow-sm outline-none cursor-pointer ${selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
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
                                            <div className={`p-4 rounded-2xl shadow-sm ${isAdmin ? "bg-indigo-600 text-white rounded-tr-sm" : isCustomer ? "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200" : "bg-blue-50 text-gray-800 rounded-tl-sm border border-blue-100"}`}>
                                                <div className="flex justify-between items-center mb-2 gap-4">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isAdmin ? "text-indigo-200" : isCustomer ? "text-gray-500" : "text-blue-600"}`}>
                                                        {isAdmin ? "Admin (You)" : isCustomer ? "Client" : "Architect"}
                                                    </span>
                                                    <span className={`text-[10px] ${isAdmin ? "text-indigo-300" : "text-gray-400"}`}>
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
                            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                <form onSubmit={handleReply} className="flex gap-3">
                                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} required placeholder="Type your support response... Note that the client and architect (if assigned) can see this."
                                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-16 shadow-sm" />
                                    <button type="submit" disabled={updating || !replyText.trim()} className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center gap-2">
                                        <FaReply /> Reply
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                            <FaHeadset className="text-6xl mb-4 text-gray-200" />
                            <p className="font-medium text-gray-500">Select a ticket from the inbox to view details</p>
                        </div>
                    )}

                    {/* Overlay spinner when updating specific ticket actions */}
                    {updating && selectedTicket && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                            <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                                <FaSpinner className="animate-spin text-indigo-600" />
                                <span className="font-semibold text-sm text-gray-700">Updating...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
