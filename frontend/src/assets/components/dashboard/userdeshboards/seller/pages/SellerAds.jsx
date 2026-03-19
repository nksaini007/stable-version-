import React, { useState, useEffect, useContext } from "react";
import {
    FaBullhorn, FaPlus, FaCheck, FaTimes, FaClock,
    FaChartLine, FaImage, FaUpload, FaMoneyBillWave, FaRocket,
    FaPause,
} from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../../../../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "";

const STATUS_COLORS = {
    draft: "bg-gray-500/20 text-gray-400",
    pending_payment: "bg-yellow-500/20 text-yellow-400",
    pending_approval: "bg-orange-500/20 text-orange-400",
    active: "bg-green-500/20 text-green-400",
    paused: "bg-blue-500/20 text-blue-400",
    completed: "bg-gray-500/20 text-gray-400",
    rejected: "bg-red-500/20 text-red-400",
};

const AD_TYPES = [
    { value: "banner", label: "Banner Ad", desc: "Full-width banner shown across pages" },
    { value: "featured_product", label: "Featured Product", desc: "Your product highlighted in category listings" },
    { value: "category_boost", label: "Category Boost", desc: "Boost visibility in a specific category" },
];

export default function SellerAds() {
    const { token } = useContext(AuthContext);
    const [tab, setTab] = useState("campaigns"); // campaigns, create, payments
    const [campaigns, setCampaigns] = useState([]);
    const [myPayments, setMyPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payModal, setPayModal] = useState(null); // campaign being paid for
    const [msg, setMsg] = useState("");

    // Create form
    const [form, setForm] = useState({
        title: "", description: "", adType: "banner",
        targetCategory: "", targetProduct: "", budget: "", durationDays: 7,
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");

    // Dropdown data
    const [categories, setCategories] = useState([]);
    const [myProducts, setMyProducts] = useState([]);

    // Pay form
    const [payForm, setPayForm] = useState({ paymentMethod: "UPI", referenceNumber: "" });
    const [proofFile, setProofFile] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchCampaigns();
        fetchPayments();
        fetchCategories();
        fetchMyProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${API}/api/categories`);
            setCategories(data);
        } catch (err) { console.error(err); }
    };

    const fetchMyProducts = async () => {
        try {
            const { data } = await axios.get(`${API}/api/products`, { headers });
            setMyProducts(data);
        } catch (err) { console.error(err); }
    };

    const fetchCampaigns = async () => {
        try {
            const { data } = await axios.get(`${API}/api/ads/mine`, { headers });
            setCampaigns(data);
        } catch { }
    };
    const fetchPayments = async () => {
        try {
            const { data } = await axios.get(`${API}/api/ads/my-payments`, { headers });
            setMyPayments(data);
        } catch { }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (bannerFile) fd.append("bannerImage", bannerFile);
            const { data } = await axios.post(`${API}/api/ads/`, fd, { headers });
            setMsg(`✅ ${data.message || "Campaign created!"}`);
            fetchCampaigns();
            setTab("campaigns");
            setForm({ title: "", description: "", adType: "banner", targetCategory: "", targetProduct: "", budget: "", durationDays: 7 });
            setBannerFile(null); setBannerPreview("");
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Error creating campaign"));
        } finally { setLoading(false); }
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(payForm).forEach(([k, v]) => fd.append(k, v));
            if (proofFile) fd.append("proofImage", proofFile);
            await axios.post(`${API}/api/ads/${payModal._id}/payment`, fd, { headers });
            setMsg("✅ Payment submitted! Admin will verify and activate.");
            setPayModal(null);
            fetchCampaigns();
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Error"));
        } finally { setLoading(false); }
    };

    const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-500 flex items-center gap-3">
                        <FaBullhorn className="text-orange-400" /> Ad Campaigns
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Create and manage your promotional campaigns</p>
                </div>
                <button onClick={() => setTab("create")}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <FaPlus /> New Campaign
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Campaigns", val: campaigns.length, icon: <FaBullhorn />, color: "from-orange-500 to-amber-500" },
                    { label: "Active Now", val: activeCampaigns, icon: <FaRocket />, color: "from-green-500 to-emerald-500" },
                    { label: "Total Budget", val: `₹${totalBudget.toLocaleString()}`, icon: <FaMoneyBillWave />, color: "from-blue-500 to-cyan-500" },
                    { label: "Total Clicks", val: campaigns.reduce((s, c) => s + (c.clicks || 0), 0), icon: <FaChartLine />, color: "from-purple-500 to-pink-500" },
                ].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-gray-500 mb-3`}>{s.icon}</div>
                        <p className="text-2xl font-black text-gray-500">{s.val}</p>
                        <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Flash Msg */}
            {msg && (
                <div className={`p-3 rounded-xl text-sm text-center border ${msg.startsWith("✅") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {msg}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-white/[0.03] border border-white/5 p-1 rounded-xl overflow-x-auto hidden-scrollbar w-full sm:w-fit">
                {[["campaigns", "My Campaigns"], ["create", "Create Campaign"], ["payments", "Payment History"]].map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? "bg-orange-500 text-white shadow" : "text-gray-400 hover:text-gray-500"}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* CAMPAIGNS TAB */}
            {tab === "campaigns" && (
                <div className="space-y-4">
                    {campaigns.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <FaBullhorn className="text-5xl mx-auto mb-4 opacity-30" />
                            <p>No campaigns yet. Create your first ad!</p>
                        </div>
                    ) : (
                        campaigns.map((c) => (
                            <div key={c._id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-5">
                                {c.bannerImage && (
                                    <img src={`${API}${c.bannerImage}`} alt="banner"
                                        className="w-full md:w-40 h-24 object-cover rounded-xl border border-white/10" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                            <h3 className="text-gray-500 font-bold text-lg">{c.title}</h3>
                                            <p className="text-gray-400 text-sm">{c.adType?.replace("_", " ")}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[c.status] || "bg-gray-500/20 text-gray-400"}`}>
                                            {c.status?.replace("_", " ").toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                                        <div className="bg-white/5 rounded-xl px-3 py-2">
                                            <p className="text-gray-400 text-xs">Budget</p>
                                            <p className="text-orange-400 font-bold">₹{c.budget?.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl px-3 py-2">
                                            <p className="text-gray-400 text-xs">Duration</p>
                                            <p className="text-gray-500 font-bold">{c.durationDays} days</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl px-3 py-2">
                                            <p className="text-gray-400 text-xs">Impressions</p>
                                            <p className="text-gray-500 font-bold">{c.impressions || 0}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl px-3 py-2">
                                            <p className="text-gray-400 text-xs">Clicks</p>
                                            <p className="text-gray-500 font-bold">{c.clicks || 0}</p>
                                        </div>
                                    </div>
                                    {c.status === "pending_payment" && (
                                        <button onClick={() => setPayModal(c)}
                                            className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-gray-500 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                                            <FaMoneyBillWave /> Submit Payment to Activate
                                        </button>
                                    )}
                                    {c.status === "rejected" && c.rejectionReason && (
                                        <p className="mt-2 text-red-400 text-xs">Reason: {c.rejectionReason}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* CREATE TAB */}
            {tab === "create" && (
                <form onSubmit={handleCreate} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5 max-w-2xl">
                    <h3 className="text-gray-500 font-bold text-lg">Create New Campaign</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Campaign Title *</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                placeholder="e.g. Summer Sale Banner 2026"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none focus:border-orange-500/50 placeholder-gray-600" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="What are you promoting?"
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none focus:border-orange-500/50 placeholder-gray-600 resize-none" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Ad Type *</label>
                            <div className="space-y-2">
                                {AD_TYPES.map((t) => (
                                    <label key={t.value}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.adType === t.value ? "border-orange-500/40 bg-orange-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                                        <input type="radio" name="adType" value={t.value} checked={form.adType === t.value}
                                            onChange={(e) => setForm({ ...form, adType: e.target.value })} className="mt-0.5" />
                                        <div>
                                            <p className="text-gray-500 text-sm font-semibold">{t.label}</p>
                                            <p className="text-gray-400 text-xs">{t.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Target Category</label>
                                <select value={form.targetCategory} onChange={(e) => setForm({ ...form, targetCategory: e.target.value, targetProduct: "" })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none focus:border-orange-500/50">
                                    <option value="" className="bg-[#1a1a2e]">-- Select a Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name} className="bg-[#1a1a2e]">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Target Product (Optional)</label>
                                <select value={form.targetProduct} onChange={(e) => setForm({ ...form, targetProduct: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none focus:border-orange-500/50"
                                    disabled={!form.targetCategory}>
                                    <option value="" className="bg-[#1a1a2e]">
                                        {!form.targetCategory ? "Select a category first" : "-- Select Your Product --"}
                                    </option>
                                    {myProducts
                                        .filter((p) => !form.targetCategory || p.category === form.targetCategory)
                                        .map((p) => (
                                            <option key={p._id} value={p._id} className="bg-[#1a1a2e]">
                                                {p.name}
                                            </option>
                                        ))}
                                </select>
                                <p className="text-gray-500 text-xs mt-1">Select one of your products to feature it.</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Budget (₹) *</label>
                                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} required
                                    min={100} placeholder="e.g. 5000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none focus:border-orange-500/50 placeholder-gray-600" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Duration (Days) *</label>
                                <select value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none focus:border-orange-500/50">
                                    {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d} className="bg-[#1a1a2e]">{d} days</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Banner Upload */}
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Banner Image</label>
                            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-orange-500/40 transition-all bg-white/[0.02]">
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="preview" className="h-full w-full object-cover rounded-xl" />
                                ) : (
                                    <>
                                        <FaImage className="text-gray-500 text-2xl mb-2" />
                                        <p className="text-gray-500 text-sm">Click to upload banner (JPG, PNG)</p>
                                    </>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) { setBannerFile(file); setBannerPreview(URL.createObjectURL(file)); }
                                }} />
                            </label>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-gray-500 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all text-sm disabled:opacity-60">
                        {loading ? "Creating..." : "🚀 Create Campaign"}
                    </button>
                </form>
            )}

            {/* PAYMENTS TAB */}
            {tab === "payments" && (
                <div className="space-y-3">
                    {myPayments.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <FaMoneyBillWave className="text-5xl mx-auto mb-4 opacity-30" />
                            <p>No payment records yet.</p>
                        </div>
                    ) : (
                        myPayments.map((p) => (
                            <div key={p._id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="text-gray-500 font-semibold">{p.campaign?.title}</p>
                                    <p className="text-gray-400 text-xs">{p.paymentMethod} · Ref: {p.referenceNumber}</p>
                                    <p className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-orange-400 font-bold">₹{p.amount?.toLocaleString()}</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === "approved" ? "bg-green-500/20 text-green-400" : p.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                        {p.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* PAY MODAL */}
            {payModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-gray-500 font-bold text-lg">Submit Payment</h3>
                            <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-500"><FaTimes /></button>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-5">
                            <p className="text-orange-300 font-semibold">{payModal.title}</p>
                            <p className="text-gray-500 font-black text-xl">₹{payModal.budget?.toLocaleString()}</p>
                        </div>
                        <form onSubmit={handlePaySubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Payment Method *</label>
                                <select value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none">
                                    {["UPI", "bank_transfer", "wallet", "cash"].map((m) => <option key={m} value={m} className="bg-[#1a1a2e]">{m.replace("_", " ").toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Transaction Reference # *</label>
                                <input value={payForm.referenceNumber} onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })} required
                                    placeholder="UPI Txn ID / Bank Reference Number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none placeholder-gray-600" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Payment Screenshot</label>
                                <label className="flex items-center gap-3 p-3 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-orange-500/40 transition-all">
                                    <FaUpload className="text-gray-500" />
                                    <span className="text-gray-400 text-sm">{proofFile ? proofFile.name : "Upload screenshot (optional)"}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files[0])} />
                                </label>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-gray-500 font-bold rounded-xl transition-all disabled:opacity-60">
                                {loading ? "Submitting..." : "Submit Payment for Approval"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
