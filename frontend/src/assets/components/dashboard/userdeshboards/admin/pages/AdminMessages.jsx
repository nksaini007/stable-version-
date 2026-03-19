import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import API from "../../../../../api/api";
import { toast } from "react-toastify";
import { FaEnvelope, FaReply, FaCheckCircle, FaTimes, FaComments } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AdminMessages = () => {
    const { token } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, [token]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await API.get("/messages/admin");
            setMessages(res.data.messages);
        } catch (error) {
            toast.error("Failed to load customer messages.");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setSendingReply(true);
            const res = await API.put(`/messages/${selectedMessage._id}/reply`, {
                text: replyText
            });

            toast.success("Reply sent successfully.");
            setReplyText("");
            setSelectedMessage(res.data.message); // Update view with new thread
            fetchMessages(); // Refresh background list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reply");
        } finally {
            setSendingReply(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await API.put(`/messages/${id}/status`, {
                status: newStatus
            });
            toast.success(`Ticket marked as ${newStatus}`);
            fetchMessages();
            if (selectedMessage && selectedMessage._id === id) {
                setSelectedMessage({ ...selectedMessage, status: newStatus });
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Open": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "Replied": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "Closed": return "bg-green-500/10 text-green-500 border-green-500/20";
            default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

    return (
        <div className="p-6 md:p-8 bg-[#0f172a] min-h-screen text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaEnvelope className="text-blue-500" /> Support Inquiries
                    </h1>
                    <p className="text-gray-400 mt-2">Manage customer messages and project plan inquiries.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
                {/* INBOX LIST */}
                <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/5 font-semibold">
                        Inbox ({messages.length})
                    </div>
                    <div className="flex-1 overflow-y-auto override-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Loading messages...</div>
                        ) : messages.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No messages found.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {messages.map(msg => (
                                    <div
                                        key={msg._id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-white/5 ${selectedMessage?._id === msg._id ? "bg-blue-600/10 border-l-4 border-blue-500" : "border-l-4 border-transparent"}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-200 truncate">{msg.subject}</h4>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getStatusColor(msg.status)}`}>
                                                {msg.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                            <span>{msg.customer?.name || "Unknown User"}</span>
                                            <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {msg.plan && (
                                            <div className="mt-2 text-xs text-blue-400 bg-blue-500/10 inline-block px-2 py-1 rounded">
                                                Plan: {msg.plan.title}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* THREAD VIEW */}
                <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-white/5 flex flex-col overflow-hidden relative">
                    {selectedMessage ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">{selectedMessage.subject}</h2>
                                    <p className="text-sm text-gray-400">
                                        From: <span className="text-gray-200">{selectedMessage.customer?.name} ({selectedMessage.customer?.email})</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {selectedMessage.status !== "Closed" && (
                                        <button onClick={() => handleUpdateStatus(selectedMessage._id, "Closed")} className="px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-sm transition-colors flex items-center gap-2">
                                            <FaCheckCircle /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 override-scrollbar">
                                {selectedMessage.thread.map((t, idx) => (
                                    <div key={idx} className={`flex flex-col ${t.senderRole === "admin" ? "items-end" : "items-start"}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-gray-400 uppercase">{t.senderRole === "admin" ? "Admin (You)" : "Customer"}</span>
                                            <span className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className={`p-4 rounded-2xl max-w-[80%] ${t.senderRole === "admin" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-[#0f172a] border border-white/10 text-gray-200 rounded-tl-sm"}`}>
                                            <p className="whitespace-pre-wrap">{t.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Box */}
                            <div className="p-4 border-t border-white/5 bg-[#0f172a]/50">
                                {selectedMessage.status === "Closed" ? (
                                    <div className="text-center p-4 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                                        This inquiry has been marked as resolved and closed.
                                    </div>
                                ) : (
                                    <form onSubmit={handleReply} className="flex gap-4">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply to the customer..."
                                            className="flex-1 bg-[#1e293b] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-14"
                                            required
                                        ></textarea>
                                        <button type="submit" disabled={sendingReply} className={`px-6 rounded-xl font-bold flex items-center gap-2 transition-all ${sendingReply ? "bg-blue-500/50 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
                                            <FaReply /> {sendingReply ? "Sending..." : "Reply"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <FaComments className="text-6xl mb-4 opacity-20" />
                            <p>Select a message from the inbox to view the conversation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
