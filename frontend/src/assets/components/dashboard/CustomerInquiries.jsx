import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { FaEnvelope, FaReply, FaComments } from "react-icons/fa";
import Nev from "../Nev";

const CustomerInquiries = () => {
    const { token, user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        if (token) {
            fetchMessages();
        }
    }, [token]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/messages/my-messages", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data.messages);
        } catch (error) {
            toast.error("Failed to load your inquiries.");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setSendingReply(true);
            const res = await axios.put(`/api/messages/${selectedMessage._id}/reply`, {
                text: replyText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Reply sent successfully.");
            setReplyText("");
            setSelectedMessage(res.data.message);
            fetchMessages();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reply");
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Open": return "bg-blue-100 text-blue-600 border-blue-200";
            case "Replied": return "bg-green-100 text-green-600 border-green-200";
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                        <FaEnvelope className="text-blue-500" /> My Inquiries
                    </h1>
                    <p className="text-gray-500 mt-2">View and respond to your inquiries with the Stinchar team.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
                    {/* INBOX LIST */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                            Your Tickets ({messages.length})
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading your inquiries...</div>
                            ) : messages.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">You haven't sent any inquiries yet.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {messages.map(msg => (
                                        <div
                                            key={msg._id}
                                            onClick={() => setSelectedMessage(msg)}
                                            className={`p-5 cursor-pointer transition-all hover:bg-gray-50 ${selectedMessage?._id === msg._id ? "bg-blue-50 border-l-4 border-blue-500" : "border-l-4 border-transparent"}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800 truncate pr-2">{msg.subject}</h4>
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${getStatusColor(msg.status)}`}>
                                                    {msg.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-2">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </div>
                                            {msg.plan && (
                                                <div className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
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
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
                        {selectedMessage ? (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedMessage.subject}</h2>
                                        <p className="text-sm text-gray-500">
                                            Ticket Status: <span className="font-semibold text-gray-700">{selectedMessage.status}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                                    {selectedMessage.thread.map((t, idx) => {
                                        const isCustomer = t.senderRole === "user" || t.senderRole === "customer";
                                        return (
                                            <div key={idx} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">{isCustomer ? "You" : "Stinchar Team"}</span>
                                                    <span className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString()}</span>
                                                </div>
                                                <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${isCustomer ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200"}`}>
                                                    <p className="whitespace-pre-wrap">{t.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Reply Box */}
                                <div className="p-5 border-t border-gray-100 bg-gray-50">
                                    {selectedMessage.status === "Closed" ? (
                                        <div className="text-center p-4 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 font-medium">
                                            This inquiry has been marked as resolved and closed by the Stinchar team.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleReply} className="flex gap-4">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply to the Stinchar team..."
                                                className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none h-14"
                                                required
                                            ></textarea>
                                            <button type="submit" disabled={sendingReply} className={`px-6 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all ${sendingReply ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"}`}>
                                                <FaReply /> {sendingReply ? "Sending..." : "Reply"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <FaComments className="text-6xl mb-4 opacity-50" />
                                <p className="font-medium text-gray-500">Select an inquiry to view the conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerInquiries;
