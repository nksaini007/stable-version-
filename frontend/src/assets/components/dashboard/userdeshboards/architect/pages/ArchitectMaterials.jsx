import React, { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCubes, FaPlus, FaBoxOpen, FaExclamationTriangle, FaChartPie,
    FaClipboardList, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter,
    FaSpinner, FaTimes, FaEdit, FaSave
} from "react-icons/fa";

const ArchitectMaterials = () => {
    const { token } = useContext(AuthContext);
    const [materials, setMaterials] = useState([]);
    const [projectMaterials, setProjectMaterials] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Inventory"); // Inventory, Assigned, Alerts, Requests
    const [searchTerm, setSearchTerm] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Forms
    const [materialForm, setMaterialForm] = useState({ name: "", category: "Cement & Concrete", unit: "kg", unitPrice: "", description: "" });
    const [assignForm, setAssignForm] = useState({ projectId: "", materialId: "", quantityAllocated: "", lowStockThreshold: "10", notes: "" });
    const [requestForm, setRequestForm] = useState({ projectId: "", notes: "", items: [{ materialId: "", materialName: "", quantity: "", unit: "", urgency: "Medium" }] });

    useEffect(() => {
        if (token) fetchAllData();
    }, [token]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [matRes, projRes, alertRes, anRes, reqRes] = await Promise.all([
                axios.get("/api/materials/all", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/construction/architect/projects", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/materials/alerts", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/materials/analytics", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/materials/requests/my", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setMaterials(matRes.data.materials);
            setProjects(projRes.data.projects);
            setAlerts(alertRes.data.alerts);
            setAnalytics(anRes.data);
            setRequests(reqRes.data.requests);

            // Fetch materials assigned to all projects
            const pmPromises = projRes.data.projects.map(p =>
                axios.get(`/api/materials/project/${p._id}`, { headers: { Authorization: `Bearer ${token}` } })
            );
            const pmResponses = await Promise.all(pmPromises);
            const allPm = pmResponses.map(res => res.data.materials).flat();
            setProjectMaterials(allPm);

        } catch (err) {
            toast.error("Failed to load materials data");
        } finally {
            setLoading(false);
        }
    };

    // ─── ADD CUSTOM MATERIAL ───
    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/api/materials/custom", materialForm, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Custom material added!");
            setShowMaterialModal(false);
            setMaterialForm({ name: "", category: "Cement & Concrete", unit: "kg", unitPrice: "", description: "" });
            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── ASSIGN MATERIAL TO PROJECT ───
    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/api/materials/project", assignForm, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Material assigned to project!");
            setShowAssignModal(false);
            setAssignForm({ projectId: "", materialId: "", quantityAllocated: "", lowStockThreshold: "10", notes: "" });
            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── UPDATE MATERIAL USAGE ───
    const handleUpdateUsage = async (id, currentUsed, increment) => {
        try {
            const newUsed = currentUsed + increment;
            await axios.put(`/api/materials/project/${id}`, { quantityUsed: newUsed }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Usage updated!");
            fetchAllData();
        } catch (err) {
            toast.error("Failed to update usage");
        }
    };

    // ─── SUBMIT MATERIAL REQUEST ───
    const handleAddRequestItem = () => {
        setRequestForm({ ...requestForm, items: [...requestForm.items, { materialId: "", materialName: "", quantity: "", unit: "", urgency: "Medium" }] });
    };

    const handleRemoveRequestItem = (index) => {
        const items = requestForm.items.filter((_, i) => i !== index);
        setRequestForm({ ...requestForm, items });
    };

    const handleRequestItemChange = (index, field, value) => {
        const items = [...requestForm.items];
        items[index][field] = value;
        // Auto-fill unit if materialId is selected
        if (field === "materialId" && value !== "custom") {
            const mat = materials.find(m => m._id === value);
            if (mat) {
                items[index].unit = mat.unit;
                items[index].materialName = mat.name;
            }
        }
        setRequestForm({ ...requestForm, items });
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/api/materials/requests", requestForm, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Material request submitted to Admin!");
            setShowRequestModal(false);
            setRequestForm({ projectId: "", notes: "", items: [{ materialId: "", materialName: "", quantity: "", unit: "", urgency: "Medium" }] });
            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMaterials = useMemo(() => materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [materials, searchTerm]);

    const filteredAssigned = useMemo(() => projectMaterials.filter(pm =>
        pm.materialId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pm.projectId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [projectMaterials, searchTerm]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1c]">
            <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 text-white min-h-screen bg-[#0a0f1c]">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                        Raw Material Management
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
                        <FaCubes className="text-amber-500" /> Track inventory, assign to projects, and request stock
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all text-sm">
                        <FaClipboardList /> Assign to Project
                    </button>
                    <button onClick={() => setShowRequestModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all text-sm">
                        <FaBoxOpen /> Request Stock
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Active Allocations", value: analytics.summary.totalAllocations, icon: <FaClipboardList className="text-blue-400" />, borderColor: "border-blue-500/30", bg: "from-blue-500/10" },
                        { label: "Low Stock Alerts", value: alerts.length, icon: <FaExclamationTriangle className="text-red-400" />, borderColor: alerts.length > 0 ? "border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-gray-500/30", bg: alerts.length > 0 ? "from-red-500/20" : "from-gray-500/10", textColor: alerts.length > 0 ? "text-red-400" : "text-white" },
                        { label: "Total Cost", value: `₹${analytics.summary.totalMaterialCost.toLocaleString("en-IN")}`, icon: <FaChartPie className="text-emerald-400" />, borderColor: "border-emerald-500/30", bg: "from-emerald-500/10" },
                        { label: "Global DB Items", value: materials.filter(m => m.isGlobal).length, icon: <FaCubes className="text-purple-400" />, borderColor: "border-purple-500/30", bg: "from-purple-500/10" },
                    ].map((stat, i) => (
                        <div key={i} className={`bg-gradient-to-br ${stat.bg} to-transparent border ${stat.borderColor} rounded-2xl p-5`}>
                            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 w-fit mb-3">{stat.icon}</div>
                            <h3 className={`text-2xl md:text-3xl font-black ${stat.textColor || "text-white"}`}>{stat.value}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-[#1e293b]/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md mb-8 w-fit overflow-x-auto max-w-full">
                {["Inventory", "Assigned", "Alerts", "Requests"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? "bg-amber-500 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                        {tab}
                        {tab === "Alerts" && alerts.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
                    </button>
                ))}
            </div>

            {/* INVENTORY TAB */}
            {activeTab === "Inventory" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full max-w-md">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="text" placeholder="Search materials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#1e293b]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all" />
                        </div>
                        <button onClick={() => setShowMaterialModal(true)} className="ml-4 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-gray-300 transition-all flex items-center gap-2">
                            <FaPlus /> New Custom
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredMaterials.map(m => (
                            <div key={m._id} className="bg-[#1e293b]/60 border border-white/10 p-5 rounded-2xl relative group">
                                <span className={`absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${m.isGlobal ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" : "bg-teal-500/10 text-teal-400 border-teal-500/30"}`}>
                                    {m.isGlobal ? "Global DB" : "Custom"}
                                </span>
                                <h4 className="font-bold text-lg text-white mb-1 pr-16">{m.name}</h4>
                                <p className="text-xs text-gray-400 mb-4">{m.category}</p>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <div className="bg-[#0f172a]/50 p-2 rounded-lg border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Price</p>
                                        <p className="text-sm font-bold text-emerald-400">₹{m.unitPrice}/{m.unit}</p>
                                    </div>
                                    <button onClick={() => { setAssignForm({ ...assignForm, materialId: m._id }); setShowAssignModal(true); }}
                                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs font-bold transition-all border border-amber-500/20 h-full">
                                        Assign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ASSIGNED MATERAILS TAB */}
            {activeTab === "Assigned" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="bg-[#1e293b]/40 rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                    <th className="text-left p-4">Project</th>
                                    <th className="text-left p-4">Material</th>
                                    <th className="text-left p-4">Allocated</th>
                                    <th className="text-left p-4">Used</th>
                                    <th className="text-left p-4">Remaining</th>
                                    <th className="text-right p-4">Quick Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssigned.map(pm => (
                                    <tr key={pm._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">{pm.projectId?.name}</td>
                                        <td className="p-4">
                                            <p className="font-bold text-gray-300">{pm.materialId?.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{pm.materialId?.category}</p>
                                        </td>
                                        <td className="p-4 text-gray-400">{pm.quantityAllocated} {pm.materialId?.unit}</td>
                                        <td className="p-4 font-bold text-amber-500">{pm.quantityUsed} {pm.materialId?.unit}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded border font-bold text-xs ${pm.remaining <= pm.lowStockThreshold ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}>
                                                {pm.remaining} {pm.materialId?.unit}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleUpdateUsage(pm._id, pm.quantityUsed, 10)} className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold">+10</button>
                                                <button onClick={() => handleUpdateUsage(pm._id, pm.quantityUsed, 50)} className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold">+50</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAssigned.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No materials assigned to any project yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* ALERTS TAB */}
            {activeTab === "Alerts" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {alerts.length === 0 ? (
                        <div className="py-20 text-center bg-[#1e293b]/30 rounded-3xl border border-emerald-500/30 border-dashed">
                            <FaCheckCircle className="text-5xl text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-300">All Good!</h3>
                            <p className="text-gray-500 mt-2">No projects are running low on materials right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {alerts.map(a => (
                                <div key={a._id} className="bg-red-500/5 border border-red-500/30 p-5 rounded-2xl flex items-center justify-between gap-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                    <FaExclamationTriangle className="text-3xl text-red-500/50" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white leading-tight">{a.projectId?.name}</h4>
                                        <p className="text-sm text-gray-400"><strong className="text-red-400">{a.materialId?.name}</strong> is running low</p>
                                    </div>
                                    <div className="text-right bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                                        <p className="text-[10px] uppercase font-bold text-red-400/70">Remaining</p>
                                        <p className="text-lg font-black text-red-400">{a.remaining} <span className="text-xs">{a.materialId?.unit}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === "Requests" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {requests.length === 0 ? (
                        <div className="py-20 text-center bg-[#1e293b]/30 rounded-3xl border border-white/10 border-dashed">
                            <FaClipboardList className="text-5xl text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-300">No Requests</h3>
                            <p className="text-gray-500 mt-2">You haven't requested any materials from admin yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req._id} className="bg-[#1e293b]/60 border border-white/10 rounded-2xl p-5">
                                    <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{req.projectId?.name}</h4>
                                            <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString("en-IN")}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${req.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                                            req.status === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                                                "bg-red-500/10 text-red-500 border-red-500/30"
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                        {req.items.map((item, idx) => (
                                            <div key={idx} className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-gray-300 text-sm">{item.materialName}</p>
                                                    <p className={`text-[10px] uppercase font-bold ${item.urgency === "Urgent" ? "text-red-400" : item.urgency === "High" ? "text-orange-400" : "text-blue-400"}`}>{item.urgency} Urgency</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-white">{item.quantity}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">{item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {req.notes && <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-lg"><strong className="text-gray-300">My Notes:</strong> {req.notes}</p>}
                                    {req.adminNotes && <p className="text-sm text-yellow-500/90 bg-yellow-500/10 p-3 rounded-lg mt-2 border border-yellow-500/20"><strong className="text-yellow-500">Admin Reply:</strong> {req.adminNotes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* ─── MODALS ─── */}

            {/* 1. Custom Material Modal */}
            <AnimatePresence>
                {showMaterialModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-white/10 p-6 relative">
                            <h3 className="text-xl font-black text-white mb-6 pt-2 border-t-4 border-amber-500 pt-6">Add Custom Material</h3>
                            <button onClick={() => setShowMaterialModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"><FaTimes /></button>

                            <form onSubmit={handleMaterialSubmit} className="space-y-4">
                                <input type="text" placeholder="Material Name" value={materialForm.name} onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500" />

                                <div className="grid grid-cols-2 gap-4">
                                    <select value={materialForm.category} onChange={e => setMaterialForm({ ...materialForm, category: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none cursor-pointer">
                                        <option value="Cement & Concrete">Cement & Concrete</option>
                                        <option value="Steel & Iron">Steel & Iron</option>
                                        <option value="Wood & Timber">Wood & Timber</option>
                                        <option value="Paint & Finishes">Paint & Finishes</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <select value={materialForm.unit} onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none cursor-pointer">
                                        <option value="kg">kg</option>
                                        <option value="ton">ton</option>
                                        <option value="bags">bags</option>
                                        <option value="pieces">pieces</option>
                                        <option value="sqft">sqft</option>
                                        <option value="liters">liters</option>
                                    </select>
                                </div>
                                <input type="number" placeholder="Est. Unit Price (₹)" value={materialForm.unitPrice} onChange={e => setMaterialForm({ ...materialForm, unitPrice: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500" />
                                <textarea placeholder="Description" value={materialForm.description} onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })} rows={2} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none" />

                                <button type="submit" disabled={submitting} className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold transition-all disabled:opacity-50">
                                    {submitting ? "Saving..." : "Create Material"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Assign Material Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-white/10 p-6 relative">
                            <h3 className="text-xl font-black text-white mb-6 pt-2 border-t-4 border-emerald-500 pt-6">Assign to Project</h3>
                            <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"><FaTimes /></button>

                            <form onSubmit={handleAssignSubmit} className="space-y-4">
                                <select value={assignForm.projectId} onChange={e => setAssignForm({ ...assignForm, projectId: e.target.value })} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer">
                                    <option value="">Select Project</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                <select value={assignForm.materialId} onChange={e => setAssignForm({ ...assignForm, materialId: e.target.value })} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer">
                                    <option value="">Select Material</option>
                                    {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.isGlobal ? "Global" : "Custom"})</option>)}
                                </select>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold pl-2 mb-1 block">Initial Quantity</label>
                                        <input type="number" placeholder="Qty" value={assignForm.quantityAllocated} onChange={e => setAssignForm({ ...assignForm, quantityAllocated: e.target.value })} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold pl-2 mb-1 block">Low Alert Threshold</label>
                                        <input type="number" placeholder="Threshold" value={assignForm.lowStockThreshold} onChange={e => setAssignForm({ ...assignForm, lowStockThreshold: e.target.value })} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                    </div>
                                </div>
                                <textarea placeholder="Notes (optional)" value={assignForm.notes} onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })} rows={2} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" />

                                <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl text-white font-bold transition-all disabled:opacity-50">
                                    {submitting ? "Saving..." : "Assign Material"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. Material Request Modal */}
            <AnimatePresence>
                {showRequestModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-start z-50 p-4 py-10 overflow-auto">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#1e293b] w-full max-w-2xl rounded-3xl border border-white/10 p-6 md:p-8 relative">
                            <h3 className="text-xl font-black text-white mb-6 pt-2 border-t-4 border-indigo-500 pt-6">Request Stock from Admin</h3>
                            <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"><FaTimes /></button>

                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                <select value={requestForm.projectId} onChange={e => setRequestForm({ ...requestForm, projectId: e.target.value })} required className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                                    <option value="">Select Target Project</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>

                                {/* Items List */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end mb-2">
                                        <h4 className="text-sm font-bold text-gray-300">Requested Items</h4>
                                        <button type="button" onClick={handleAddRequestItem} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><FaPlus /> Add Row</button>
                                    </div>

                                    {requestForm.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 bg-[#0f172a]/50 p-3 rounded-xl border border-white/5 relative">
                                            {requestForm.items.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveRequestItem(idx)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"><FaTimes /></button>
                                            )}
                                            <div className="w-full md:w-5/12">
                                                <select value={item.materialId} onChange={e => handleRequestItemChange(idx, "materialId", e.target.value)} required className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                                                    <option value="">Select DB Material</option>
                                                    <option value="custom" className="text-amber-400 bg-amber-500/10 font-bold border-t border-white/10">-- Custom Item (Not in DB) --</option>
                                                    {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                </select>
                                                {item.materialId === "custom" && (
                                                    <input type="text" placeholder="Custom Material Name" value={item.materialName} onChange={e => handleRequestItemChange(idx, "materialName", e.target.value)} required className="w-full bg-[#1e293b]/50 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-200 mt-2 focus:outline-none" />
                                                )}
                                            </div>
                                            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleRequestItemChange(idx, "quantity", e.target.value)} required className="w-full md:w-2/12 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                                            <input type="text" placeholder="Unit" value={item.unit} onChange={e => handleRequestItemChange(idx, "unit", e.target.value)} required className="w-full md:w-2/12 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                                            <select value={item.urgency} onChange={e => handleRequestItemChange(idx, "urgency", e.target.value)} className="w-full md:w-3/12 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                                                <option value="Low">Low Priority</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Urgent">Urgent!</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <textarea placeholder="Notes for admin..." value={requestForm.notes} onChange={e => setRequestForm({ ...requestForm, notes: e.target.value })} rows={2} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" />

                                <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-white font-bold transition-all disabled:opacity-50">
                                    {submitting ? "Submitting..." : `Submit Request (${requestForm.items.length} items)`}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArchitectMaterials;
