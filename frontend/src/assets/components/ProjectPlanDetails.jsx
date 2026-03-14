import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FaChevronLeft, FaMap, FaRulerCombined, FaTag, FaCheckCircle, FaComments, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import Nev from "./Nev";

const ProjectPlanDetails = () => {
    const { id } = useParams();
    const { token } = React.useContext(AuthContext);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    // Messaging Modal State
    const [showContactModal, setShowContactModal] = useState(false);
    const [messageData, setMessageData] = useState({ subject: "", text: "" });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await axios.get(`/api/construction-plans/${id}`);
                setPlan(res.data.plan);
            } catch (error) {
                console.error("Failed to fetch plan exact details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please log in to contact the Stinchar team.");
            return;
        }

        try {
            setSending(true);
            await axios.post(
                "/api/messages",
                {
                    planId: id,
                    subject: messageData.subject,
                    text: messageData.text,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Message sent successfully! The admin team will reply shortly.");
            setShowContactModal(false);
            setMessageData({ subject: "", text: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mt-20"></div>
        </div>
    );

    if (!plan) return <div className="min-h-screen text-center pt-40">Plan not found</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <Nev />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <Link to="/project-plans" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <FaChevronLeft className="text-xs" /> Back to Catalog
                </Link>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* LEFT: Image Gallery */}
                        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[300px] md:h-[400px] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                {plan.images && plan.images.length > 0 ? (
                                    <img src={plan.images[activeImage]} alt="Plan Blueprint" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex justify-center items-center text-gray-300"><FaMap className="text-8xl" /></div>
                                )}
                            </motion.div>

                            {/* Thumbnails */}
                            {plan.images && plan.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                                    {plan.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? "border-slate-800" : "border-transparent opacity-50 hover:opacity-100"}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Plan Info */}
                        <div className="p-6 md:p-8 lg:p-10 flex flex-col">
                            <div>
                                <div className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
                                    {plan.category}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{plan.title}</h1>

                                <div className="flex flex-wrap items-center gap-6 mb-8 py-4 border-y border-gray-100">
                                    <div className="flex items-center gap-2.5">
                                        <FaRulerCombined className="text-gray-400" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total Area</p>
                                            <p className="font-semibold text-gray-900 text-sm">{plan.area}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                                    <div className="flex items-center gap-2.5">
                                        <FaTag className="text-gray-400" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Estimated Cost</p>
                                            <p className="font-semibold text-gray-900 text-sm">{plan.estimatedCost}</p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-8">{plan.description}</p>

                                {plan.features && plan.features.length > 0 && (
                                    <>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-10">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <FaCheckCircle className="text-slate-800 mt-1 flex-shrink-0 text-[10px]" /> {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>

                            <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-6">
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg font-medium text-sm transition-all flex justify-center items-center gap-2"
                                >
                                    <FaComments /> Contact Stinchar Team
                                </button>
                                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-2.5 rounded-lg font-medium text-sm transition-all flex justify-center items-center gap-2">
                                    Save to Favorites
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Support Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2"><FaComments /> Contact Us</h2>
                            <button onClick={() => setShowContactModal(false)} className="text-white/80 hover:text-white transition-colors">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 mb-2">Send an inquiry about <strong>{plan.title}</strong> to the Stinchar support team.</p>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                                <input
                                    required
                                    type="text"
                                    value={messageData.subject}
                                    onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    placeholder="What is your inquiry about?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={messageData.text}
                                    onChange={(e) => setMessageData({ ...messageData, text: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                                    placeholder="Write your message here..."
                                ></textarea>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowContactModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={sending} className={`px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${sending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"}`}>
                                    {sending ? "Sending..." : "Send Message"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectPlanDetails;
