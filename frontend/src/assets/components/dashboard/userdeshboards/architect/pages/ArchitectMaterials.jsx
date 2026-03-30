import React, { useState, useEffect, useContext, useMemo } from "react";
import WebAPI from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCubes, FaPlus, FaBoxOpen, FaExclamationTriangle, FaChartPie,
    FaClipboardList, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter,
    FaSpinner, FaTimes, FaEdit, FaSave, FaClock
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
                WebAPI.get("/materials/all"),
                WebAPI.get("/construction/architect/projects"),
                WebAPI.get("/materials/alerts"),
                WebAPI.get("/materials/analytics"),
                WebAPI.get("/materials/requests/my"),
            ]);
            setMaterials(matRes.data.materials);
            setProjects(projRes.data.projects);
            setAlerts(alertRes.data.alerts);
            setAnalytics(anRes.data);
            setRequests(reqRes.data.requests);

            // Fetch materials assigned to all projects
            const pmPromises = projRes.data.projects.map(p =>
                WebAPI.get(`/materials/project/${p._id}`)
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
            await WebAPI.post("/materials/custom", materialForm);
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
            await WebAPI.post("/materials/project", assignForm);
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
            await WebAPI.put(`/materials/project/${id}`, { quantityUsed: newUsed });
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
            await WebAPI.post("/materials/requests", requestForm);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808]">
            <FaSpinner className="text-4xl animate-spin text-gray-800 mb-6" />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Auditing Inventory Stacks...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-12 text-white min-h-screen bg-[#080808] font-sans selection:bg-white/10">
            {/* Header Area */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-white opacity-20"></span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Logistics Infrastructure</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Raw Materials</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowAssignModal(true)}
                        className="px-8 py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 shadow-xl flex items-center gap-3">
                        <FaClipboardList className="text-[9px]" /> Deploy Assets
                    </button>
                    <button onClick={() => setShowRequestModal(true)}
                        className="px-8 py-4 bg-[#121214] border border-white/[0.05] text-white rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-white/[0.08] transition-all duration-500 flex items-center gap-3">
                        <FaBoxOpen className="text-[10px] opacity-40" /> Requisition
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            {analytics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Active Allocations", value: analytics.summary.totalAllocations, icon: <FaClipboardList className="opacity-30" /> },
                        { label: "Critical Stock Alerts", value: alerts.length, icon: <FaExclamationTriangle className="opacity-30" />, critical: alerts.length > 0 },
                        { label: "Fiscal Inventory Value", value: `₹${analytics.summary.totalMaterialCost.toLocaleString()}`, icon: <FaChartPie className="opacity-30" /> },
                        { label: "Global Catalog Items", value: materials.filter(m => m.isGlobal).length, icon: <FaCubes className="opacity-30" /> },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#121214] border border-white/[0.03] rounded-[2rem] p-8 group hover:border-white/10 transition-all duration-500">
                            <div className={`w-10 h-10 ${stat.critical ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/[0.02] border border-white/[0.05]"} rounded-xl flex items-center justify-center mb-6 group-hover:text-white transition-colors duration-500`}>{stat.icon}</div>
                            <h3 className={`text-3xl font-bold ${stat.critical ? "text-red-400" : "text-white"} group-hover:tracking-wider transition-all duration-500`}>{stat.value}</h3>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-3">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Navigation & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="flex bg-[#121214] p-1.5 rounded-[1.2rem] border border-white/[0.03] w-full md:w-fit overflow-x-auto scroller-hide">
                    {["Inventory", "Assigned", "Alerts", "Requests"].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3.5 rounded-[0.9rem] text-[10px] font-bold uppercase tracking-widest transition-all duration-500 min-w-fit flex items-center gap-3 ${activeTab === tab ? "bg-white/[0.05] text-white border border-white/[0.05]" : "text-gray-500 hover:text-gray-300"}`}>
                            {tab}
                            {tab === "Alerts" && alerts.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96 group">
                    <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-white transition-colors" />
                    <input type="text" placeholder="Filter Resources..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#121214] border border-white/[0.03] rounded-[1.2rem] pl-16 pr-6 py-4 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all placeholder:text-gray-800 font-medium" />
                </div>
            </div>

            {/* Content Areas */}
            <AnimatePresence mode="wait">
                {activeTab === "Inventory" && (
                    <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h2 className="text-[11px] text-gray-700 font-black uppercase tracking-[0.3em]">Material Catalog</h2>
                            <button onClick={() => setShowMaterialModal(true)} className="text-[10px] text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                                <FaPlus size={8} /> New Entry
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMaterials.map((m, idx) => (
                                <motion.div key={m._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                                    className="bg-[#121214] rounded-[2rem] border border-white/[0.03] p-8 hover:border-white/10 transition-all duration-500 group relative overflow-hidden flex flex-col min-h-[14rem]">
                                    <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border w-fit mb-6 ${m.isGlobal ? "bg-white/5 border-white/10 text-white" : "bg-transparent border-white/[0.03] text-gray-700"}`}>
                                        {m.isGlobal ? "System Asset" : "Private Node"}
                                    </span>
                                    <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">{m.name}</h4>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-8">{m.category}</p>

                                    <div className="mt-auto pt-6 border-t border-white/[0.03] flex justify-between items-center">
                                        <div>
                                            <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">Fiscal Quote</p>
                                            <p className="text-[12px] text-white font-bold">₹{m.unitPrice.toLocaleString()}/{m.unit}</p>
                                        </div>
                                        <button onClick={() => { setAssignForm({ ...assignForm, materialId: m._id }); setShowAssignModal(true); }}
                                            className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-xl">
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "Assigned" && (
                    <motion.div key="assigned" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-[#121214] rounded-[2.5rem] border border-white/[0.03] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/[0.03]">
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Project Vector</th>
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Resource Node</th>
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Deployment Status</th>
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] text-right">Consumption Audit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.01]">
                                        {filteredAssigned.map(pm => (
                                            <tr key={pm._id} className="hover:bg-white/5 transition-colors duration-500 group">
                                                <td className="p-8">
                                                    <p className="font-bold text-white uppercase tracking-tight">{pm.projectId?.name}</p>
                                                    <p className="text-[9px] text-gray-700 mt-1 uppercase font-bold tracking-widest">Target Objective</p>
                                                </td>
                                                <td className="p-8">
                                                    <p className="font-bold text-gray-400 uppercase tracking-tight">{pm.materialId?.name}</p>
                                                    <p className="text-[9px] text-gray-700 mt-1 uppercase font-bold tracking-widest">{pm.materialId?.category}</p>
                                                </td>
                                                <td className="p-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">Residual Stock</span>
                                                            <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${pm.remaining <= pm.lowStockThreshold ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white border-white/10"}`}>
                                                                {pm.remaining} {pm.materialId?.unit}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">Utilization</span>
                                                            <span className="text-white font-bold text-[12px]">{pm.quantityUsed} / {pm.quantityAllocated}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleUpdateUsage(pm._id, pm.quantityUsed, 10)} className="px-5 py-2.5 bg-white/[0.02] hover:bg-white text-gray-500 hover:text-black border border-white/[0.05] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500">Log +10</button>
                                                        <button onClick={() => handleUpdateUsage(pm._id, pm.quantityUsed, 50)} className="px-5 py-2.5 bg-white/[0.02] hover:bg-white text-gray-500 hover:text-black border border-white/[0.05] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500">Log +50</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "Alerts" && (
                    <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {alerts.length === 0 ? (
                            <div className="py-32 text-center bg-white/[0.01] rounded-[3rem] border border-white/[0.03] border-dashed">
                                <FaCheckCircle className="text-5xl text-gray-800 mx-auto mb-6 opacity-30" />
                                <h3 className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.3em]">Logistics Secured</h3>
                                <p className="text-gray-700 mt-3 text-xs tracking-widest uppercase">No critical stock depletion detected.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {alerts.map(a => (
                                    <div key={a._id} className="bg-[#121214] border border-red-500/20 rounded-[2rem] p-8 flex items-center gap-8 relative overflow-hidden group hover:border-red-500/40 transition-all duration-700">
                                        <div className="w-1.5 h-16 bg-red-500 rounded-full blur-sm absolute left-0 opacity-50"></div>
                                        <div className="w-16 h-16 rounded-2xl bg-red-500/5 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-700">
                                            <FaExclamationTriangle size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white text-lg uppercase tracking-tight mb-1">{a.projectId?.name}</h4>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">CRITICAL DEPLETION: <span className="text-red-400">{a.materialId?.name}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest mb-1">Remaining</p>
                                            <p className="text-3xl font-bold text-red-400 tracking-tighter">{a.remaining} <span className="text-[10px] text-red-900">{a.materialId?.unit}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "Requests" && (
                    <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-6">
                            {requests.map((req, idx) => (
                                <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                    className="bg-[#121214] border border-white/[0.03] rounded-[2.5rem] p-10 group hover:border-white/10 transition-all duration-500">
                                    <div className="flex justify-between items-start mb-10 border-b border-white/[0.03] pb-10">
                                        <div>
                                            <h4 className="font-bold text-white text-2xl uppercase tracking-tighter">{req.projectId?.name}</h4>
                                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-3">
                                                <FaClock size={10} className="opacity-30" /> {new Date(req.createdAt).toLocaleDateString()} · PHASE AUDIT LOG
                                            </p>
                                        </div>
                                        <span className={`px-6 py-2 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl border ${
                                            req.status === "Pending" ? "bg-white/5 border-white/20 text-white" :
                                            req.status === "Approved" ? "bg-white text-black border-white" : "bg-red-500/10 border-red-500/20 text-red-500"
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
                                        {req.items.map((item, i) => (
                                            <div key={i} className="bg-[#0C0C0C] p-6 rounded-[1.5rem] border border-white/[0.02]">
                                                <p className="text-[12px] font-bold text-white uppercase tracking-tight mb-4">{item.materialName}</p>
                                                <div className="flex justify-between items-baseline mb-4">
                                                    <p className="text-2xl font-black text-white group-hover:tracking-wider transition-all duration-500">{item.quantity}</p>
                                                    <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{item.unit}</p>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                                    item.urgency === "Urgent" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                                                    item.urgency === "High" ? "bg-white/5 text-gray-500 border-white/10" : "bg-transparent text-gray-800 border-white/5"
                                                }`}>
                                                    {item.urgency} Level
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {req.notes && (
                                        <div className="bg-[#0C0C0C] p-6 rounded-[1.2rem] border border-white/[0.01]">
                                            <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-2">Narrative Context</p>
                                            <p className="text-[11px] text-gray-500 tracking-wider leading-relaxed">{req.notes}</p>
                                        </div>
                                    )}
                                    {req.adminNotes && (
                                        <div className="mt-4 bg-white/[0.02] p-6 rounded-[1.2rem] border border-white/[0.05]">
                                            <p className="text-[8px] text-white font-black uppercase tracking-widest mb-2">Directive Response</p>
                                            <p className="text-[11px] text-white tracking-wider leading-relaxed">{req.adminNotes}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            <AnimatePresence>
                {/* 1. Custom Material Modal */}
                {showMaterialModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMaterialModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0A0A0B] border border-white/5 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Catalog expansion</h2>
                                    <button onClick={() => setShowMaterialModal(false)} className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-white transition-all"><FaTimes size={12} /></button>
                                </div>
                                <form onSubmit={handleMaterialSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Asset Nomenclature</label>
                                        <input type="text" placeholder="e.g. GRADE A CEMENT" value={materialForm.name} onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })} required 
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-800" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Classification Area</label>
                                            <select value={materialForm.category} onChange={e => setMaterialForm({ ...materialForm, category: e.target.value })}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-[12px] text-gray-500 focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                                <option value="Cement & Concrete">Cement & Concrete</option>
                                                <option value="Steel & Iron">Steel & Iron</option>
                                                <option value="Wood & Timber">Wood & Timber</option>
                                                <option value="Paint & Finishes">Paint & Finishes</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Unit Protocol</label>
                                            <select value={materialForm.unit} onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value })}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-[12px] text-gray-500 focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                                <option value="kg">kg</option>
                                                <option value="ton">ton</option>
                                                <option value="bags">bags</option>
                                                <option value="pieces">pieces</option>
                                                <option value="sqft">sqft</option>
                                                <option value="liters">liters</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Fiscal Unit Quote (INR)</label>
                                        <input type="number" value={materialForm.unitPrice} onChange={e => setMaterialForm({ ...materialForm, unitPrice: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <button type="button" onClick={() => setShowMaterialModal(false)} className="flex-1 py-4 bg-transparent border border-white/[0.05] rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-all">Discard</button>
                                        <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50">
                                            {submitting ? "Processing..." : "Catalog Asset"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 2. Assign Material Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-[#0A0A0B] border border-white/5 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
                            <div className="p-10">
                                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Active Allocation</h2>
                                <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em] mb-10">Asset deployment to active vectors</p>
                                <form onSubmit={handleAssignSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Target Project</label>
                                            <select value={assignForm.projectId} onChange={e => setAssignForm({ ...assignForm, projectId: e.target.value })} required
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-[12px] text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                                <option value="">Select Target</option>
                                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Asset Node</label>
                                            <select value={assignForm.materialId} onChange={e => setAssignForm({ ...assignForm, materialId: e.target.value })} required
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-[12px] text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                                <option value="">Select Node</option>
                                                {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Initial Quantum</label>
                                            <input type="number" value={assignForm.quantityAllocated} onChange={e => setAssignForm({ ...assignForm, quantityAllocated: e.target.value })} required
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Critical Floor</label>
                                            <input type="number" value={assignForm.lowStockThreshold} onChange={e => setAssignForm({ ...assignForm, lowStockThreshold: e.target.value })}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-4 bg-transparent border border-white/[0.05] rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-all">Abort</button>
                                        <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50">
                                            {submitting ? "Deploying..." : "Authorize Deployment"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 3. Material Request Modal (Slide-up style) */}
                {showRequestModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRequestModal(false)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
                        <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
                            className="bg-[#0A0A0B] border border-white/5 w-full max-w-4xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-12 overflow-y-auto scroller-hide">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Fiscal Requisition</h2>
                                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] mt-2">Central Procurement Protocol</p>
                                    </div>
                                    <button onClick={() => setShowRequestModal(false)} className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-white transition-all"><FaTimes size={14} /></button>
                                </div>
                                <form onSubmit={handleRequestSubmit} className="space-y-12 scroller-hide">
                                    <div className="space-y-4">
                                        <label className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Asset vector selection</label>
                                        <select value={requestForm.projectId} onChange={e => setRequestForm({ ...requestForm, projectId: e.target.value })} required
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] px-8 py-5 text-[14px] text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                            <option value="">Select Vector</option>
                                            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center px-2">
                                            <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Itemized Manifest</h4>
                                            <button type="button" onClick={handleAddRequestItem} className="text-[9px] font-bold text-gray-500 hover:text-white flex items-center gap-2 uppercase tracking-widest"><FaPlus size={8} /> Append Sequence</button>
                                        </div>

                                        <div className="space-y-4">
                                            {requestForm.items.map((item, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-white/[0.01] p-6 rounded-[2rem] border border-white/[0.03] group hover:border-white/10 transition-all duration-500">
                                                    <div className="col-span-12 md:col-span-4">
                                                        <select value={item.materialId} onChange={e => handleRequestItemChange(idx, "materialId", e.target.value)} required 
                                                            className="w-full bg-transparent border-b border-white/[0.05] py-3 text-[13px] text-white focus:outline-none focus:border-white/20 transition-all cursor-pointer">
                                                            <option value="">Asset Node</option>
                                                            <option value="custom">{"-> Custom Declaration"}</option>
                                                            {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                        </select>
                                                        {item.materialId === "custom" && (
                                                            <input type="text" placeholder="Declare Nomenclature" value={item.materialName} onChange={e => handleRequestItemChange(idx, "materialName", e.target.value)} required 
                                                                className="w-full bg-transparent border-b border-white/[0.1] py-2 text-[11px] text-white/50 focus:outline-none mt-2" />
                                                        )}
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2">
                                                        <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleRequestItemChange(idx, "quantity", e.target.value)} required 
                                                            className="w-full bg-transparent border-b border-white/[0.05] py-3 text-[13px] text-white text-center focus:outline-none focus:border-white/20 transition-all" />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2">
                                                        <input type="text" placeholder="Unit" value={item.unit} onChange={e => handleRequestItemChange(idx, "unit", e.target.value)} required 
                                                            className="w-full bg-transparent border-b border-white/[0.05] py-3 text-[13px] text-white text-center focus:outline-none focus:border-white/20 transition-all" />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-3">
                                                        <select value={item.urgency} onChange={e => handleRequestItemChange(idx, "urgency", e.target.value)} 
                                                            className="w-full bg-transparent border-b border-white/[0.05] py-3 text-[13px] text-gray-500 focus:outline-none focus:border-white/20 transition-all cursor-pointer">
                                                            <option value="Low">Low Priority</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="High">High</option>
                                                            <option value="Urgent">Urgent!</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-12 md:col-span-1 flex justify-end">
                                                        {requestForm.items.length > 1 && (
                                                            <button type="button" onClick={() => handleRemoveRequestItem(idx)} className="w-8 h-8 rounded-full bg-white/[0.02] hover:bg-red-500/10 text-gray-800 hover:text-red-500 transition-all flex items-center justify-center"><FaTimes size={10} /></button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea placeholder="Directives & Contextual Notes..." value={requestForm.notes} onChange={e => setRequestForm({ ...requestForm, notes: e.target.value })} rows={3}
                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] px-8 py-6 text-[13px] text-white focus:outline-none focus:border-white/20 transition-all resize-none placeholder:text-gray-800" />

                                    <div className="flex justify-end pt-8">
                                        <button type="submit" disabled={submitting} className="px-16 py-6 bg-white text-black rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-gray-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] disabled:opacity-50">
                                            {submitting ? "Transmitting..." : `Transmit Requisition (${requestForm.items.length} units)`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArchitectMaterials;
