import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import {
    FaBullhorn, FaCheck, FaTimes, FaPause,
    FaChartLine, FaMoneyBillWave, FaClock, FaRocket,
} from "react-icons/fa";
import API, { API_BASE } from "../../../../../api/api";

const STATUS_COLORS = {
    draft: "bg-gray-500/20 text-[#6B7280]",
    pending_payment: "bg-yellow-500/20 text-yellow-400",
    pending_approval: "bg-orange-500/20 text-orange-400",
    active: "bg-green-500/20 text-green-400",
    paused: "bg-blue-500/20 text-blue-400",
    completed: "bg-gray-500/20 text-[#8E929C]",
    rejected: "bg-red-500/20 text-red-400",
};

export default function AdminAdCampaigns() {
    const { token } = useContext(AuthContext);
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [selected, setSelected] = useState(null);
    const [actionNote, setActionNote] = useState("");
    const [msg, setMsg] = useState("");

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchCampaigns(); fetchStats(); }, [filterStatus]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const qs = filterStatus !== "all" ? `?status=${filterStatus}` : "";
            const { data } = await API.get(`/ads/admin/all${qs}`);
            setCampaigns(data);
        } catch { } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const { data } = await API.get(`/ads/admin/stats`);
            setStats(data);
        } catch { }
    };

    const approve = async (id) => {
        try {
            await API.put(`/ads/admin/${id}/approve`, { adminNote: actionNote });
            setMsg("✅ Campaign approved and activated!");
            setSelected(null); setActionNote("");
            fetchCampaigns(); fetchStats();
        } catch (err) { setMsg("❌ " + (err.response?.data?.message || "Error")); }
    };

    const reject = async (id) => {
        if (!actionNote.trim()) { setMsg("❌ Please provide a rejection reason"); return; }
        try {
            await API.put(`/ads/admin/${id}/reject`, { reason: actionNote });
            setMsg("✅ Campaign rejected");
            setSelected(null); setActionNote("");
            fetchCampaigns(); fetchStats();
        } catch (err) { setMsg("❌ " + (err.response?.data?.message || "Error")); }
    };

    const pause = async (id) => {
        try {
            await API.put(`/ads/admin/${id}/pause`, {});
            setMsg("✅ Campaign paused");
            fetchCampaigns();
        } catch { }
    };

    const filtered = filterStatus === "all" ? campaigns : campaigns.filter((c) => c.status === filterStatus);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-3">
                    <FaBullhorn className="text-orange-400" /> Ad Campaign Management
                </h1>
                <p className="text-[#6B7280] text-sm mt-1">Review and approve seller ad campaigns</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Campaigns", val: stats.total, icon: <FaBullhorn />, color: "from-orange-500 to-amber-500" },
                        { label: "Active", val: stats.active, icon: <FaRocket />, color: "from-green-500 to-emerald-500" },
                        { label: "Pending Approval", val: stats.pendingApproval, icon: <FaClock />, color: "from-yellow-500 to-orange-500" },
                        { label: "Ad Revenue", val: `₹${stats.adRevenue?.toLocaleString()}`, icon: <FaMoneyBillWave />, color: "from-blue-500 to-cyan-500" },
                    ].map((s, i) => (
                        <div key={i} className="bg-[#1A1B1E] border border-[#2A2B2F]/[0.03] border border-white/5 rounded-2xl p-4">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                            <p className="text-2xl font-black text-white">{s.val}</p>
                            <p className="text-[#6B7280] text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {msg && (
                <div className={`p-3 rounded-xl text-sm text-center border ${msg.startsWith("✅") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {msg} <button onClick={() => setMsg("")} className="ml-3 opacity-60">✕</button>
                </div>
            )}

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
                {["all", "pending_approval", "active", "paused", "pending_payment", "rejected", "completed"].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? "bg-orange-500 text-white" : "bg-[#1A1B1E] border border-[#2A2B2F]/5 text-[#6B7280] hover:text-white"}`}>
                        {s === "all" ? "All" : s.replace("_", " ").toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Campaign List */}
            <div className="space-y-4">
                {loading && <div className="text-center py-12 text-[#8E929C]">Loading campaigns...</div>}
                {!loading && filtered.length === 0 && (
                    <div className="text-center py-16 text-[#8E929C]">
                        <FaBullhorn className="text-5xl mx-auto mb-4 opacity-20" />
                        <p>No campaigns in this category.</p>
                    </div>
                )}
                {filtered.map((c) => (
                    <div key={c._id}
                        className={`bg-[#1A1B1E] border border-[#2A2B2F]/[0.03] border rounded-2xl p-5 transition-all ${selected?._id === c._id ? "border-orange-500/40 bg-orange-500/5" : "border-white/5"}`}>
                        <div className="flex flex-wrap gap-4 items-start justify-between">
                            <div className="flex gap-4 items-start">
                                {c.bannerImage && (
                                    <img src={getOptimizedImage(c.bannerImage, 400)} alt="banner"
                                        className="w-20 h-16 object-cover rounded-xl border border-white/10 shrink-0" />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-bold">{c.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[c.status]}`}>
                                            {c.status?.replace("_", " ").toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-[#6B7280] text-sm">
                                        <span className="font-semibold text-orange-400">{c.seller?.businessName || c.seller?.name}</span>
                                        <span className="text-[#8E929C] ml-2">({c.seller?.email})</span>
                                    </p>
                                    <p className="text-[#8E929C] text-xs mt-1">
                                        Type: {c.adType?.replace("_", " ")} · {c.targetCategory && `Category: ${c.targetCategory} ·`} Budget: ₹{c.budget?.toLocaleString()} · {c.durationDays} days
                                    </p>
                                    {c.status === "active" && (
                                        <p className="text-xs text-green-400 mt-1">
                                            📊 {c.impressions || 0} impressions · {c.clicks || 0} clicks
                                            {c.endDate && ` · Ends: ${new Date(c.endDate).toLocaleDateString("en-IN")}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap shrink-0">
                                {/* Payment proof */}
                                {c.latestPayment && (
                                    <div className="text-xs bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-xl px-3 py-2">
                                        <p className="text-[#6B7280]">Payment Ref:</p>
                                        <p className="text-white font-semibold">{c.latestPayment.referenceNumber}</p>
                                        <p className="text-[#6B7280]">{c.latestPayment.paymentMethod} · ₹{c.latestPayment.amount}</p>
                                        {c.latestPayment.proofImage && (
                                            <a href={getOptimizedImage(c.latestPayment.proofImage, 1000)} target="_blank" rel="noreferrer"
                                                className="text-blue-400 text-xs hover:underline mt-1 block">View Proof</a>
                                        )}
                                    </div>
                                )}
                                {c.status === "pending_approval" && (
                                    <button onClick={() => setSelected(c)}
                                        className="px-3 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold hover:bg-orange-500/30 transition-all">
                                        Review
                                    </button>
                                )}
                                {c.status === "active" && (
                                    <button onClick={() => pause(c._id)}
                                        className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition-all flex items-center gap-1">
                                        <FaPause /> Pause
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Inline Review Panel */}
                        {selected?._id === c._id && (
                            <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                                <p className="text-white font-semibold text-sm">Review Campaign</p>
                                <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)}
                                    placeholder="Admin note (required for rejection, optional for approval)"
                                    rows={2}
                                    className="w-full bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none placeholder-gray-600" />
                                <div className="flex gap-3">
                                    <button onClick={() => approve(c._id)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all">
                                        <FaCheck /> Approve & Activate
                                    </button>
                                    <button onClick={() => reject(c._id)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all">
                                        <FaTimes /> Reject
                                    </button>
                                    <button onClick={() => { setSelected(null); setActionNote(""); }}
                                        className="px-4 py-2.5 bg-[#1A1B1E] border border-[#2A2B2F]/5 text-[#6B7280] rounded-xl text-sm hover:bg-[#1A1B1E] border border-[#2A2B2F]/10 transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
