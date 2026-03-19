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
    FaSearch, FaFilter, FaDownload
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
        imageLinks: "", // Added for external URLs
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
            imageLinks: "", // Links will be handled as additions
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
                    // Split by comma or newline and filter empty
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
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1c]">
            <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 text-white min-h-screen bg-[#0a0f1c]">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">
                        My Project Catalog
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
                        <FaPalette className="text-teal-500" /> Manage your portfolio, share via QR code
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all"
                >
                    <FaPlus /> Add New Project
                </button>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1e293b]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-[#1e293b]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Projects", value: works.length, color: "from-blue-500/10", border: "border-blue-500/30" },
                    { label: "Published", value: works.filter(w => w.status === "Published").length, color: "from-emerald-500/10", border: "border-emerald-500/30" },
                    { label: "Drafts", value: works.filter(w => w.status === "Draft").length, color: "from-amber-500/10", border: "border-amber-500/30" },
                    { label: "Public (QR Active)", value: works.filter(w => w.isPublic && w.status === "Published").length, color: "from-purple-500/10", border: "border-purple-500/30" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.color} to-transparent ${stat.border} border rounded-2xl p-5`}>
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Work Grid */}
            {filteredWorks.length === 0 ? (
                <div className="py-20 text-center bg-[#1e293b]/30 rounded-3xl border border-white/10 border-dashed">
                    <FaPalette className="text-5xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-300">No Projects Found</h3>
                    <p className="text-gray-500 mt-2">Create your first project to start building your catalog.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredWorks.map((work, idx) => (
                        <motion.div
                            key={work._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden hover:border-teal-500/30 transition-all group"
                        >
                            {/* Image */}
                            <div className="h-48 bg-gray-800 relative overflow-hidden">
                                {work.images && work.images.length > 0 ? (
                                    <img 
                                        src={getOptimizedImage(work.images[0], 600)} 
                                        alt={work.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-600"><FaImage className="text-4xl" /></div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${work.status === "Published" ? "bg-emerald-500/80 text-white border-emerald-400/50" : "bg-gray-500/80 text-white border-gray-400/50"}`}>
                                        {work.status}
                                    </span>
                                    {work.isPublic && work.status === "Published" && (
                                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md bg-purple-500/80 text-white border border-purple-400/50">
                                            Public
                                        </span>
                                    )}
                                </div>
                                {work.images && work.images.length > 1 && (
                                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-white font-bold">
                                        +{work.images.length - 1} photos
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1.5 block">{work.category}</span>
                                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{work.title}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{work.description}</p>

                                {/* Progress bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span className="text-white">{work.progress}%</span>
                                    </div>
                                    <div className="w-full bg-[#0f172a] rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full transition-all" style={{ width: `${work.progress}%` }}></div>
                                    </div>
                                </div>

                                {/* Location */}
                                {work.location && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                                        <FaMapMarkerAlt className="text-indigo-400/70" /> {work.location}
                                    </p>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                    <button onClick={() => openEditModal(work)} className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-400 rounded-xl transition-colors" title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => setQrModal(work)} className="p-2.5 bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors" title="QR Code">
                                        <FaQrcode />
                                    </button>
                                    <button onClick={() => copyLink(work._id)} className="p-2.5 bg-teal-500/10 hover:bg-teal-500/30 text-teal-400 rounded-xl transition-colors" title="Copy Link">
                                        <FaCopy />
                                    </button>
                                    {work.isPublic && work.status === "Published" && (
                                        <a href={`/project-showcase/${work._id}`} target="_blank" rel="noreferrer" className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors" title="View Public Page">
                                            <FaExternalLinkAlt />
                                        </a>
                                    )}
                                    <button onClick={() => setDeleteConfirm(work._id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors ml-auto" title="Delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ─── CREATE/EDIT MODAL ─── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-start z-50 p-4 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#1e293b] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl relative my-8"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 rounded-t-3xl"></div>

                            <div className="p-6 lg:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black text-white">{editingWork ? "Edit Project" : "Add New Project"}</h3>
                                    <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Project Title *</label>
                                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all" placeholder="e.g. Modern Minimalist Villa" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Category *</label>
                                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all appearance-none cursor-pointer">
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Location</label>
                                            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all" placeholder="City, State" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description *</label>
                                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all resize-none" placeholder="Describe the project in detail..." />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Estimated Cost</label>
                                            <input type="text" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all" placeholder="₹ 25,00,000" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Area</label>
                                            <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all" placeholder="2500 sq ft" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Progress (%)</label>
                                            <input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Features (comma-separated)</label>
                                        <input type="text" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all" placeholder="3 Bedrooms, Open Kitchen, Swimming Pool" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">External Image Links (one per line or comma-separated)</label>
                                        <textarea 
                                            value={form.imageLinks} 
                                            onChange={(e) => setForm({ ...form, imageLinks: e.target.value })}
                                            rows={2}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all resize-none" 
                                            placeholder="https://example.com/image1.jpg" 
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Materials Used (comma-separated)</label>
                                        <input type="text" value={form.materialsUsed} onChange={(e) => setForm({ ...form, materialsUsed: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all" placeholder="Cement, Steel, Marble, Glass" />
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Upload Images</label>
                                        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files))}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-500/20 file:text-teal-300" />

                                        {/* Show existing images if editing */}
                                        {editingWork && editingWork.images && editingWork.images.length > 0 && (
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                {editingWork.images.map((img, i) => (
                                                    <div key={i} className="relative group">
                                                        <img 
                                                            src={getOptimizedImage(img, 200)} 
                                                            alt="" 
                                                            className="w-20 h-16 object-cover rounded-lg border border-white/10" 
                                                        />
                                                        <button type="button" onClick={() => handleRemoveImage(editingWork._id, img)}
                                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status + Visibility */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-all appearance-none cursor-pointer">
                                                <option value="Draft">Draft</option>
                                                <option value="Published">Published</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4 pt-6">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                            </label>
                                            <span className="text-sm text-gray-300 flex items-center gap-2">
                                                {form.isPublic ? <FaEye className="text-teal-400" /> : <FaEyeSlash className="text-gray-500" />}
                                                {form.isPublic ? "Public (QR accessible)" : "Private"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                            className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm font-bold transition-all">Cancel</button>
                                        <button type="submit" disabled={submitting}
                                            className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 rounded-xl text-white text-sm font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {submitting ? <><FaSpinner className="animate-spin" /> Saving...</> : editingWork ? "Update Project" : "Create Project"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── QR CODE MODAL ─── */}
            <AnimatePresence>
                {qrModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-8 text-center relative"
                        >
                            <button onClick={() => setQrModal(null)} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors">
                                <FaTimes />
                            </button>

                            <h3 className="text-xl font-black text-white mb-2">Share via QR Code</h3>
                            <p className="text-sm text-gray-400 mb-6">{qrModal.title}</p>

                            {qrModal.isPublic && qrModal.status === "Published" ? (
                                <>
                                    <div className="bg-white rounded-2xl p-6 inline-block mb-6 shadow-xl">
                                        <QRCodeSVG
                                            id={`qr-${qrModal._id}`}
                                            value={`${window.location.origin}/project-showcase/${qrModal._id}`}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>

                                    <p className="text-xs text-gray-500 mb-6 break-all">
                                        {window.location.origin}/project-showcase/{qrModal._id}
                                    </p>

                                    <div className="flex gap-3">
                                        <button onClick={() => copyLink(qrModal._id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl font-bold text-sm border border-teal-500/30 transition-all">
                                            <FaCopy /> Copy Link
                                        </button>
                                        <button onClick={() => downloadQR(qrModal._id, qrModal.title)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl font-bold text-sm border border-indigo-500/30 transition-all">
                                            <FaDownload /> Download QR
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-8">
                                    <FaEyeSlash className="text-4xl text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">This project must be <strong className="text-white">Published</strong> and <strong className="text-teal-400">Public</strong> to generate a shareable QR code.</p>
                                    <p className="text-gray-500 text-xs mt-2">Edit the project to change its status and visibility.</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── DELETE CONFIRM MODAL ─── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl p-6 text-center">
                            <FaTrash className="text-3xl text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
                            <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 font-bold text-sm transition-all">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold text-sm transition-all">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArchitectWork;
