import React, { useState, useEffect, useContext } from "react";
import API, { API_BASE } from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
    FaPlus, FaImage, FaTrash, FaEdit, FaPalette, FaTimes, FaQrcode,
    FaEye, FaEyeSlash, FaCopy, FaMapMarkerAlt, FaMoneyBillWave,
    FaRulerCombined, FaCheckCircle, FaSpinner, FaExternalLinkAlt,
    FaSearch, FaFilter, FaDownload, FaBriefcase
} from "react-icons/fa";

const CATEGORIES = [
    "Residential Architecture", "Commercial Design", "Interior Design",
    "Landscape Architecture", "Blueprints & Drafting", "Renovation",
    "Industrial Design", "Other"
];

const ArchitectWork = () => {
    const { token, user } = useContext(AuthContext);
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWork, setEditingWork] = useState(null);
    const [qrModal, setQrModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Form state
    const [form, setForm] = useState({
        title: "", category: "Residential Architecture", description: "",
        location: "", estimatedCost: "", area: "",
        features: "", materialsUsed: "",
        progress: 0, status: "Draft", isPublic: false,
        imageLinks: "", 
    });
    const [imageFiles, setImageFiles] = useState([]);

    useEffect(() => {
        if (token) fetchWorks();
    }, [token]);

    const fetchWorks = async () => {
        try {
            setLoading(true);
            const res = await API.get("/architect-works/my");
            setWorks(res.data.works);
        } catch (err) {
            toast.error("Failed to load works.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: "", category: "Residential Architecture", description: "",
            location: "", estimatedCost: "", area: "",
            features: "", materialsUsed: "",
            progress: 0, status: "Draft", isPublic: false,
            imageLinks: "",
        });
        setImageFiles([]);
        setEditingWork(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (work) => {
        setEditingWork(work);
        setForm({
            title: work.title,
            category: work.category,
            description: work.description,
            location: work.location || "",
            estimatedCost: work.estimatedCost || "",
            area: work.area || "",
            features: (work.features || []).join(", "),
            materialsUsed: (work.materialsUsed || []).join(", "),
            progress: work.progress || 0,
            status: work.status,
            isPublic: work.isPublic,
            imageLinks: "", 
        });
        setImageFiles([]);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => {
                if (key === "imageLinks") {
                    const links = val.split(/[\n,]/).map(l => l.trim()).filter(Boolean);
                    links.forEach(link => formData.append("imageLinks", link));
                } else {
                    formData.append(key, val);
                }
            });
            imageFiles.forEach(file => formData.append("images", file));

            if (editingWork) {
                await API.put(`/architect-works/${editingWork._id}`, formData);
                toast.success("Project updated!");
            } else {
                await API.post("/architect-works", formData);
                toast.success("Project created!");
            }

            setShowModal(false);
            resetForm();
            fetchWorks();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/architect-works/${id}`);
            toast.success("Project deleted!");
            setDeleteConfirm(null);
            fetchWorks();
        } catch (err) {
            toast.error("Failed to delete.");
        }
    };

    const handleRemoveImage = async (workId, imageUrl) => {
        try {
            await API.put(`/architect-works/${workId}/remove-image`, { imageUrl });
            fetchWorks();
            if (editingWork && editingWork._id === workId) {
                setEditingWork(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img !== imageUrl)
                }));
            }
        } catch (err) {
            toast.error("Failed to remove image.");
        }
    };

    const copyLink = (id) => {
        const url = `${window.location.origin}/project-showcase/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const downloadQR = (id, title) => {
        const svg = document.getElementById(`qr-${id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL("image/png");
            const dl = document.createElement("a");
            dl.download = `${title.replace(/\s+/g, "_")}_QR.png`;
            dl.href = pngUrl;
            dl.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const filteredWorks = works.filter(w => {
        const matchSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (w.location || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = categoryFilter === "All" || w.category === categoryFilter;
        return matchSearch && matchCat;
    });

    if (loading && works.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808]">
            <FaSpinner className="text-4xl animate-spin text-gray-800 mb-6" />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Mapping Architectural Node...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-12 text-white min-h-screen bg-[#080808] font-sans selection:bg-white/10">
            {/* Header Area */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-white opacity-20"></span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Portfolio Repository</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Public Showcase</h1>
                </div>
                <button onClick={openCreateModal}
                    className="px-8 py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 shadow-xl flex items-center gap-3 w-fit">
                    <FaPlus size={10} /> Initialize Project
                </button>
            </motion.div>

            {/* Controls & Stats */}
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Aggregate Units", value: works.length },
                        { label: "Live Deployment", value: works.filter(w => w.status === "Published").length },
                        { label: "Draft Stacks", value: works.filter(w => w.status === "Draft").length },
                        { label: "Public Vectors", value: works.filter(w => w.isPublic && w.status === "Published").length },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#121214] border border-white/[0.03] rounded-[1.5rem] p-6 hover:border-white/10 transition-all duration-500">
                            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group min-w-[300px]">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-white transition-colors" />
                        <input type="text" placeholder="Filter Repository..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#121214] border border-white/[0.03] rounded-[1.2rem] pl-14 pr-6 py-4 text-[13px] text-white focus:outline-none focus:border-white/10 placeholder:text-gray-900" />
                    </div>
                    <div className="relative group">
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-[#121214] border border-white/[0.03] rounded-[1.2rem] px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 focus:outline-none focus:border-white/10 appearance-none cursor-pointer min-w-[200px]">
                            <option value="All">All Classifications</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredWorks.length === 0 ? (
                <div className="py-32 text-center bg-white/[0.01] rounded-[3rem] border border-white/[0.03] border-dashed">
                    <FaBriefcase className="text-5xl text-gray-800 mx-auto mb-6 opacity-10" />
                    <h3 className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.3em]">Repository Empty</h3>
                    <p className="text-gray-700 mt-3 text-xs tracking-widest uppercase">No architectural nodes found in the current buffer.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredWorks.map((work, idx) => (
                        <motion.div key={work._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                            className="bg-[#121214] rounded-[2.5rem] border border-white/[0.03] overflow-hidden group hover:border-white/10 transition-all duration-700 flex flex-col">
                            {/* Media Header */}
                            <div className="h-64 bg-[#080808] relative overflow-hidden">
                                {work.images && work.images.length > 0 ? (
                                    <img src={getOptimizedImage(work.images[0], 600)} alt={work.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-800"><FaImage size={40} /></div>
                                )}
                                <div className="absolute top-6 right-6 flex flex-col gap-2 scale-90 origin-top-right group-hover:scale-100 transition-all duration-500">
                                    <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border backdrop-blur-xl ${
                                        work.status === "Published" ? "bg-white text-black border-white" : "bg-black/60 text-gray-500 border-white/5"
                                    }`}>
                                        {work.status}
                                    </span>
                                    {work.isPublic && (
                                        <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-white">Public</span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-8 flex-1 flex flex-col">
                                <span className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em] mb-3 block">{work.category}</span>
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight group-hover:tracking-wider transition-all duration-700">{work.title}</h3>
                                <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-2 mb-8 uppercase tracking-widest">{work.description}</p>

                                {/* Progress */}
                                <div className="mb-8 p-6 bg-[#0C0C0C] rounded-[1.5rem] border border-white/[0.02]">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[9px] text-gray-700 font-bold uppercase tracking-[0.2em]">Deployment Delta</span>
                                        <span className="text-[12px] font-black text-white">{work.progress}%</span>
                                    </div>
                                    <div className="w-full bg-white/[0.03] rounded-full h-1 relative overflow-hidden">
                                        <div className="bg-white h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ width: `${work.progress}%` }}></div>
                                    </div>
                                </div>

                                {/* Footer Tools */}
                                <div className="mt-auto pt-6 border-t border-white/[0.03] flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(work)} className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><FaEdit size={14} /></button>
                                        <button onClick={() => setQrModal(work)} className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><FaQrcode size={14} /></button>
                                        <button onClick={() => copyLink(work._id)} className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><FaCopy size={14} /></button>
                                    </div>
                                    <button onClick={() => setDeleteConfirm(work._id)} className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all"><FaTrash size={14} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* PRIMARY MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                            className="bg-[#0A0A0B] border border-white/5 w-full max-w-3xl rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-12 overflow-y-auto scroller-hide">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">{editingWork ? "Edit Component" : "Initialize Component"}</h2>
                                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] font-bold uppercase tracking-[0.3em] mt-2">Core Showcase Protocol</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-white transition-all"><FaTimes size={16} /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Asset Nomenclature</label>
                                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                                className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[15px] font-bold text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-900 shadow-inner" placeholder="E.G. VERTICAL HUB 42" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Classification Area</label>
                                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[12px] font-bold text-gray-500 focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Geo-Coordinates</label>
                                            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                                className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[13px] text-white focus:outline-none focus:border-white/20 transition-all" placeholder="PARIS, FR" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Narrative Manifest</label>
                                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4}
                                            className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-6 text-[13px] text-gray-500 focus:outline-none focus:border-white/20 transition-all resize-none leading-relaxed" placeholder="DECLARE ARCHITECTURAL SCOPE..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Fiscal Budget</label>
                                            <input type="text" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                                                className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[13px] text-white focus:outline-none focus:border-white/20" placeholder="₹ CITADEL SCALE" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Spatial Metrics</label>
                                            <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                                                className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[13px] text-white focus:outline-none focus:border-white/20" placeholder="SQ FT" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Deployment (%)</label>
                                            <input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })}
                                                className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[13px] text-white focus:outline-none focus:border-white/20" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Asset Nodes (External Links)</label>
                                        <textarea value={form.imageLinks} onChange={(e) => setForm({ ...form, imageLinks: e.target.value })} rows={2}
                                            className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[1.5rem] px-8 py-6 text-[13px] text-gray-800 focus:outline-none focus:border-white/20 resize-none font-mono" placeholder="HTTPS://..." />
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Optical Buffer (Capture)</label>
                                        <div className="bg-white/[0.01] border border-white/[0.05] rounded-[2rem] p-10 border-dashed text-center group active:scale-95 transition-all outline-none relative">
                                            <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files))}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            <FaImage size={40} className="mx-auto mb-6 text-gray-900 group-hover:text-white transition-colors" />
                                            <p className="text-[11px] text-gray-700 font-bold uppercase tracking-widest">Deploy Local Media Assets</p>
                                        </div>

                                        {(editingWork?.images?.length > 0 || imageFiles.length > 0) && (
                                            <div className="flex gap-4 overflow-x-auto pb-4 scroller-hide">
                                                {editingWork?.images?.map((img, i) => (
                                                    <div key={i} className="relative group shrink-0">
                                                        <img src={getOptimizedImage(img, 300)} alt="" className="w-24 h-24 object-cover rounded-[1.5rem] opacity-30 group-hover:opacity-100 transition-all" />
                                                        <button type="button" onClick={() => handleRemoveImage(editingWork._id, img)} 
                                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><FaTimes size={10} /></button>
                                                    </div>
                                                ))}
                                                {imageFiles.map((file, i) => (
                                                    <div key={i} className="w-24 h-24 bg-white/[0.05] rounded-[1.5rem] flex items-center justify-center border border-white/10 shrink-0">
                                                        <FaCheckCircle className="text-white" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                                        <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/[0.05]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="sr-only peer" />
                                                <div className="w-12 h-6 bg-white/5 rounded-full peer-checked:bg-white transition-all relative after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-800 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                                            </label>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white font-black uppercase tracking-widest">{form.isPublic ? "Broadcast" : "Stealth"}</span>
                                                <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest"> Visibility Protocol</span>
                                            </div>
                                        </div>
                                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white focus:outline-none">
                                            <option value="Draft">Draft Buffer</option>
                                            <option value="Published">Active Registry</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-4 pt-10">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-6 bg-transparent border border-white/[0.05] rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] text-gray-700 hover:text-white transition-all">Abort</button>
                                        <button type="submit" disabled={submitting} 
                                            className="flex-[2] py-6 bg-white text-black rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                                            {submitting ? "TRANSMITTING..." : editingWork ? "SYNCHRONIZE" : "INITIALIZE"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR MODAL */}
            <AnimatePresence>
                {qrModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQrModal(null)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#121214] border border-white/5 w-full max-w-md rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-12 text-center relative">
                            <button onClick={() => setQrModal(null)} className="absolute top-8 right-8 text-gray-800 hover:text-white transition-all"><FaTimes size={16} /></button>
                            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">QR Signature</h3>
                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em] mb-12">{qrModal.title}</p>

                            {qrModal.isPublic && qrModal.status === "Published" ? (
                                <div className="space-y-12">
                                    <div className="bg-white p-10 rounded-[2.5rem] inline-block shadow-[0_0_80px_rgba(255,255,255,0.05)] relative">
                                        <QRCodeSVG id={`qr-${qrModal._id}`} value={`${window.location.origin}/project-showcase/${qrModal._id}`} size={220} level="H" includeMargin={false} />
                                        <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                                            <span className="bg-[#0C0C0C] border border-white/[0.05] text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white">Showcase Node</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => copyLink(qrModal._id)} className="flex-1 py-5 bg-white/[0.02] border border-white/[0.05] text-gray-600 hover:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">Copy Index</button>
                                        <button onClick={() => downloadQR(qrModal._id, qrModal.title)} className="flex-1 py-5 bg-white text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">Download</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 opacity-20 flex flex-col items-center">
                                    <FaEyeSlash size={60} className="mb-8" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em]">Protocol Blocked</p>
                                    <p className="text-[9px] mt-4 uppercase tracking-widest leading-relaxed">Node must be set to Published & Public <br/> for signature generation.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-[#121214] border border-white/10 w-full max-w-sm rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Discard Node?</h3>
                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em] mb-12 leading-relaxed">This action will permanently purge the project from the central showcase registry.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-transparent border border-white/[0.05] rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Abort</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">Execute Purge</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArchitectWork;
