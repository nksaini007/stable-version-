import React, { useState, useEffect, useContext } from "react";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import { AuthContext } from "../../../../../context/AuthContext";
import { LanguageContext } from "../../../context/LanguageContext";
import { translations } from "../../../translations";
import {
    FaBullhorn, FaPlus, FaCheck, FaTimes, FaClock,
    FaChartLine, FaImage, FaUpload, FaMoneyBillWave, FaRocket,
    FaPause, FaExternalLinkAlt, FaEye, FaMousePointer
} from "react-icons/fa";
import API from "../../../../../api/api";

const STATUS_COLORS = {
    draft: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    pending_payment: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    pending_approval: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    active: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    paused: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    completed: "text-gray-300 bg-gray-300/10 border-gray-300/20",
    rejected: "text-red-500 bg-red-500/10 border-red-500/20",
};

const AD_TYPES = [
    { value: "banner", label: "Premium Banner", desc: "High-impact visual at the top of main pages" },
    { value: "featured_product", label: "Featured Showcase", desc: "Prioritize your product in search results" },
    { value: "category_boost", label: "Niche Dominance", desc: "Stay visible within your specific category" },
];

export default function SellerAds() {
    const { token } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
    const [tab, setTab] = useState("campaigns"); 
    const [campaigns, setCampaigns] = useState([]);
    const [myPayments, setMyPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payModal, setPayModal] = useState(null); 
    const [msg, setMsg] = useState("");

    const [form, setForm] = useState({
        title: "", description: "", adType: "banner",
        targetCategory: "", targetProduct: "", budget: "", durationDays: 7,
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");

    const [categories, setCategories] = useState([]);
    const [myProducts, setMyProducts] = useState([]);

    const [payForm, setPayForm] = useState({ paymentMethod: "UPI", referenceNumber: "" });
    const [proofFile, setProofFile] = useState(null);

    useEffect(() => {
        fetchCampaigns();
        fetchPayments();
        fetchCategories();
        fetchMyProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await API.get(`/categories`);
            setCategories(data);
        } catch (err) { console.error(err); }
    };

    const fetchMyProducts = async () => {
        try {
            const { data } = await API.get(`/products`);
            setMyProducts(data);
        } catch (err) { console.error(err); }
    };

    const fetchCampaigns = async () => {
        try {
            const { data } = await API.get(`/ads/mine`);
            setCampaigns(data);
        } catch { }
    };
    const fetchPayments = async () => {
        try {
            const { data } = await API.get(`/ads/my-payments`);
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
            const { data } = await API.post(`/ads/`, fd);
            setMsg(`✅ ${data.message || "Campaign launched successfully!"}`);
            fetchCampaigns();
            setTab("campaigns");
            setForm({ title: "", description: "", adType: "banner", targetCategory: "", targetProduct: "", budget: "", durationDays: 7 });
            setBannerFile(null); setBannerPreview("");
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Error processing request"));
        } finally { setLoading(false); }
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(payForm).forEach(([k, v]) => fd.append(k, v));
            if (proofFile) fd.append("proofImage", proofFile);
            await API.post(`/ads/${payModal._id}/payment`, fd);
            setMsg("✅ Settlement submitted. Expect activation within 24 hours.");
            setPayModal(null);
            fetchCampaigns();
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Settlement failed"));
        } finally { setLoading(false); }
    };

    const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t.ads}</h1>
                    <p className="text-[14px] text-gray-500 mt-1">{t.marketing_growth_desc}</p>
                </div>
                <button onClick={() => setTab("create")}
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[14px] transition-all shadow-xl shadow-orange-950/20 active:scale-95">
                    <FaPlus size={12} /> {t.launch_campaign}
                </button>
            </div>

            {/* Stats - Premium Dark Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t.ads, val: campaigns.length, icon: <FaBullhorn />, color: "text-orange-500 bg-orange-500/10" },
                    { label: t.active_campaigns, val: activeCampaigns, icon: <FaRocket />, color: "text-emerald-500 bg-emerald-500/10" },
                    { label: t.total_budget, val: `₹${totalBudget.toLocaleString()}`, icon: <FaMoneyBillWave />, color: "text-blue-500 bg-blue-500/10" },
                    { label: t.customer_reach, val: campaigns.reduce((s, c) => s + (c.clicks || 0), 0), icon: <FaChartLine />, color: "text-violet-500 bg-violet-500/10" },
                ].map((s, i) => (
                    <div key={i} className="premium-card p-6 border-b-2 border-b-transparent hover:border-b-white/10 transition-all group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                            {s.icon}
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter">{s.val}</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1 group-hover:text-gray-400 transition-colors">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Notifications */}
            {msg && (
                <div className={`px-6 py-4 rounded-2xl text-[13px] font-bold flex items-center gap-3 border animate-in slide-in-from-top-2 duration-300 ${msg.startsWith("✅") ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-red-500/5 border-red-500/20 text-red-500"}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                    {msg}
                </div>
            )}

            {/* Nav Switcher */}
            <div className="flex bg-[#141414] border border-[#262626] p-1.5 rounded-2xl w-fit">
                {[["campaigns", t.marketing_hub], ["create", t.new_campaign], ["payments", t.settlements]].map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${tab === k ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-gray-300"}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* CAMPAIGNS HUB */}
            {tab === "campaigns" && (
                <div className="grid gap-6">
                    {campaigns.length === 0 ? (
                        <div className="premium-card py-24 text-center">
                            <FaBullhorn className="text-6xl mx-auto mb-6 opacity-5" />
                            <p className="text-gray-600 font-bold uppercase tracking-widest text-[12px]">{t.no_campaigns_hub}</p>
                            <button onClick={() => setTab("create")} className="mt-4 text-orange-500 font-bold hover:underline">{t.start_campaign} →</button>
                        </div>
                    ) : (
                        campaigns.map((c) => (
                            <div key={c._id} className="premium-card overflow-hidden group hover:border-gray-800 transition-all flex flex-col md:flex-row">
                                {c.bannerImage ? (
                                    <div className="md:w-64 h-36 md:h-auto overflow-hidden relative border-b md:border-b-0 md:border-r border-[#262626] flex-shrink-0">
                                        <img src={getOptimizedImage(c.bannerImage, 600)} alt=""
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                            <span className="text-[10px] font-black text-white px-2 py-0.5 bg-orange-600 rounded uppercase tracking-tighter shadow-lg">Visual Asset</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="md:w-64 h-36 md:h-auto bg-[#141414] flex items-center justify-center border-b md:border-b-0 md:border-r border-[#262626] flex-shrink-0">
                                        <FaImage className="text-gray-900 text-6xl" />
                                    </div>
                                )}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-black text-white tracking-tight">{c.title}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-widest transition-colors ${STATUS_COLORS[c.status]}`}>
                                                {c.status?.replace("_", " ")}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-gray-500 line-clamp-2 mb-6">{c.description || "N/A description"}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex items-center gap-8">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 items-center flex gap-1"><FaEye size={10} /> {t.visibility}</p>
                                                <p className="text-lg font-black text-white">{c.impressions || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 items-center flex gap-1"><FaMousePointer size={9} /> {t.interest}</p>
                                                <p className="text-lg font-black text-white">{c.clicks || 0}</p>
                                            </div>
                                            <div className="h-8 w-px bg-[#262626] hidden sm:block"></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{t.amount}</p>
                                                <p className="text-lg font-black text-white">₹{c.budget?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {c.status === "pending_payment" && (
                                            <button onClick={() => setPayModal(c)}
                                                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[12px] font-black transition-all flex items-center gap-2 shadow-xl shadow-orange-950/30 active:scale-95">
                                                <FaMoneyBillWave size={14} /> {t.settle_to_launch}
                                            </button>
                                        )}
                                        {c.status === "active" && (
                                            <div className="flex items-center gap-4">
                                                 <div className="text-right">
                                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">{t.campaign_active}</p>
                                                    <p className="text-[11px] text-gray-500">{t.duration}: {c.durationDays} days</p>
                                                 </div>
                                                 <div className="w-10 h-10 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                                                    <FaRocket size={14} className="animate-bounce" />
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                    {c.status === "rejected" && c.rejectionReason && (
                                        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[11px] text-red-400 font-bold">
                                            {t.dispute_reason}: {c.rejectionReason}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* CREATE CAMPAIGN */}
            {tab === "create" && (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="premium-card p-8">
                        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                             {t.new_launch_config} <FaRocket className="text-orange-500" size={20} />
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.campaign_identity}</label>
                                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                            placeholder="e.g. Winter Sale Dominance"
                                            className="premium-input w-full bg-[#0a0a0a]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.strategy_insight}</label>
                                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Outline your promotional targets..."
                                            rows={3}
                                            className="premium-input w-full bg-[#0a0a0a] resize-none" />
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">{t.placement_strategy}</label>
                                        <div className="space-y-3">
                                            {AD_TYPES.map((type) => (
                                                <label key={type.value}
                                                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${form.adType === type.value ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/50" : "border-[#1a1a1a] bg-[#0a0a0a] hover:border-gray-800"}`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.adType === type.value ? "border-orange-500" : "border-gray-800"}`}>
                                                            {form.adType === type.value && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
                                                        </div>
                                                        <input type="radio" name="adType" value={type.value} checked={form.adType === type.value}
                                                            onChange={(e) => setForm({ ...form, adType: e.target.value })} className="hidden" />
                                                        <div>
                                                            <p className={`text-[14px] font-bold uppercase tracking-tight ${form.adType === type.value ? "text-white" : "text-gray-500"}`}>{type.label}</p>
                                                            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed font-medium">{type.desc}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.daily_cap}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-bold text-[14px]">₹</span>
                                                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} required
                                                    min={100} placeholder="5,000"
                                                    className="premium-input w-full bg-[#0a0a0a] pl-8" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.run_time}</label>
                                            <select value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                                                className="premium-input w-full bg-[#0a0a0a]">
                                                {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d} className="bg-black">{d} {t.duration}</option>)}
                                            </select>
                                        </div>
                                     </div>
                                     <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.visibility_sector}</label>
                                            <select value={form.targetCategory} onChange={(e) => setForm({ ...form, targetCategory: e.target.value, targetProduct: "" })}
                                                className="premium-input w-full bg-[#0a0a0a]">
                                                <option value="" className="bg-black">{t.visibility_sector}</option>
                                                {categories.map((cat) => <option key={cat._id} value={cat.name} className="bg-black">{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">{t.catalog_focus} <span className="text-[9px] text-gray-700 lowercase">(Boost specific SKUs)</span></label>
                                            <select value={form.targetProduct} onChange={(e) => setForm({ ...form, targetProduct: e.target.value })}
                                                className="premium-input w-full bg-[#0a0a0a]"
                                                disabled={!form.targetCategory}>
                                                <option value="" className="bg-black text-gray-500">{!form.targetCategory ? "Await Category Select..." : t.catalog_focus}</option>
                                                {myProducts.filter(p => !form.targetCategory || p.category === form.targetCategory).map(p => (
                                                    <option key={p._id} value={p._id} className="bg-black">{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                     </div>

                                     <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.creative_visual} <span className="text-[9px] text-gray-700 lowercase">(Aspect ratio 16:9)</span></label>
                                        <label className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-[#1a1a1a] rounded-2xl cursor-pointer hover:border-gray-700 transition-all bg-[#0a0a0a]/50 group overflow-hidden">
                                            {bannerPreview ? (
                                                <img src={bannerPreview} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="text-center p-6">
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/10 transition-colors">
                                                        <FaImage className="text-gray-600 group-hover:text-gray-400" />
                                                    </div>
                                                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{t.import_asset}</p>
                                                    <p className="text-[10px] text-gray-700 mt-1">High-rez JPG, PNG preferred</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) { setBannerFile(file); setBannerPreview(URL.createObjectURL(file)); }
                                            }} />
                                        </label>
                                     </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-[#1a1a1a]">
                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-white hover:bg-gray-100 text-black font-black rounded-2xl transition-all text-[15px] uppercase tracking-widest disabled:opacity-50 active:scale-[0.99] shadow-2xl shadow-white/5">
                                    {loading ? "Establishing Link..." : t.init_campaign}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SETTLEMENTS TAB */}
            {tab === "payments" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {myPayments.length === 0 ? (
                        <div className="premium-card py-24 text-center">
                            <FaMoneyBillWave className="text-6xl mx-auto mb-6 opacity-5" />
                            <p className="text-gray-600 font-bold uppercase tracking-widest text-[12px]">{t.settlement_records}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {myPayments.map((p) => (
                                <div key={p._id} className="premium-card p-5 flex items-center justify-between group hover:bg-[#111] transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-orange-500">
                                            <FaMoneyBillWave size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-white tracking-tight">{p.campaign?.title || "Archived Campaign"}</p>
                                            <p className="text-[11px] font-medium text-gray-500 mt-1">Ref: <span className="font-mono text-gray-700">{p.referenceNumber}</span> • {p.paymentMethod.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white">₹{p.amount?.toLocaleString()}</p>
                                        <div className="flex items-center justify-end gap-2 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === "approved" ? "bg-emerald-500" : p.status === "rejected" ? "bg-red-500" : "bg-amber-500"}`}></div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${p.status === "approved" ? "text-emerald-500" : p.status === "rejected" ? "text-red-500" : "text-amber-500"}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* PAYMENT MODAL - Premium Overly */}
            {payModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] border border-[#262626] rounded-[2.5rem] p-10 w-full max-w-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600"></div>
                        
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">{t.campaign_settlement}</h3>
                                <p className="text-gray-500 text-[13px] font-medium mt-1">{t.marketing_allocation}</p>
                            </div>
                            <button onClick={() => setPayModal(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:bg-white/10 active:scale-90">
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 mb-10 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1">{t.total_budget}</p>
                                <p className="text-3xl font-black text-white">₹{payModal.budget?.toLocaleString()}</p>
                            </div>
                            <div className="w-px h-12 bg-[#262626]"></div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1">{t.details}</p>
                                <p className="text-lg font-bold text-orange-500 truncate max-w-[150px]">{payModal.title}</p>
                            </div>
                        </div>

                        <form onSubmit={handlePaySubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.transfer_channel}</label>
                                    <select value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                                        className="premium-input w-full bg-[#111]">
                                        {["UPI", "bank_transfer", "wallet", "cash"].map((m) => (
                                            <option key={m} value={m} className="bg-black">{m.replace("_", " ").toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.audit_ref_id}</label>
                                    <input value={payForm.referenceNumber} onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })} required
                                        placeholder="TXN-2026-XXXX"
                                        className="premium-input w-full bg-[#111]" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.proof_of_transfer} <span className="text-[9px] lowercase text-gray-700">(Optional visual verification)</span></label>
                                <label className="flex items-center gap-4 p-4 border border-[#262626] bg-[#111] rounded-2xl cursor-pointer hover:border-gray-700 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-orange-500 transition-colors">
                                        <FaUpload size={14} />
                                    </div>
                                    <span className="text-[12px] font-bold text-gray-600 group-hover:text-gray-400 transition-colors">
                                        {proofFile ? proofFile.name : "Attach Ledger Screenshot"}
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files[0])} />
                                </label>
                            </div>

                            <div className="pt-6">
                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-all text-[15px] uppercase tracking-widest shadow-2xl shadow-orange-950/20 active:scale-[0.98]">
                                    {loading ? "Verifying Tunnel..." : t.commit_settlement}
                                </button>
                                <p className="text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest mt-6">Secure Financial Node • Stinchar Ad Solutions</p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
