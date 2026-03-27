import React, { useState, useEffect, useContext, useMemo } from "react";
import WebAPI from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUsers, FaPlus, FaEdit, FaTrash, FaTimes, FaMoneyBillWave,
    FaSearch, FaBuilding, FaCheckCircle, FaSpinner,
    FaClock, FaChartBar, FaWallet, FaPhoneAlt
} from "react-icons/fa";

const ArchitectLabor = () => {
    const { token } = useContext(AuthContext);
    const [laborers, setLaborers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Laborers");
    const [searchTerm, setSearchTerm] = useState("");

    // Modals
    const [showLaborerModal, setShowLaborerModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingLaborer, setEditingLaborer] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Architect's projects for assigning laborers
    const [projects, setProjects] = useState([]);

    // Forms
    const [laborerForm, setLaborerForm] = useState({
        name: "", phone: "", skills: "", dailyRate: "", projectId: "", taskDescription: "", notes: ""
    });
    const [paymentForm, setPaymentForm] = useState({
        laborerId: "", amount: "", date: "", description: "", paymentMethod: "Cash", status: "Paid"
    });

    useEffect(() => {
        if (token) {
            fetchAll();
        }
    }, [token]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [lRes, pRes, sRes, prRes] = await Promise.all([
                WebAPI.get("/labor/laborers"),
                WebAPI.get("/labor/payments"),
                WebAPI.get("/labor/summary"),
                WebAPI.get("/construction/architect/projects"),
            ]);
            setLaborers(lRes.data.laborers);
            setPayments(pRes.data.payments);
            setSummary(sRes.data.summary);
            setProjects(prRes.data.projects);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ─── LABORER CRUD ───
    const resetLaborerForm = () => {
        setLaborerForm({ name: "", phone: "", skills: "", dailyRate: "", projectId: "", taskDescription: "", notes: "" });
        setEditingLaborer(null);
    };

    const openEditLaborer = (l) => {
        setEditingLaborer(l);
        setLaborerForm({
            name: l.name, phone: l.phone || "", skills: (l.skills || []).join(", "),
            dailyRate: l.dailyRate || "", projectId: l.projectId?._id || l.projectId || "",
            taskDescription: l.taskDescription || "", notes: l.notes || ""
        });
        setShowLaborerModal(true);
    };

    const handleLaborerSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingLaborer) {
                await WebAPI.put(`/labor/laborers/${editingLaborer._id}`, laborerForm);
                toast.success("Laborer updated!");
            } else {
                await WebAPI.post("/labor/laborers", laborerForm);
                toast.success("Laborer added!");
            }
            setShowLaborerModal(false);
            resetLaborerForm();
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLaborer = async (id) => {
        try {
            await WebAPI.delete(`/labor/laborers/${id}`);
            toast.success("Laborer deleted!");
            setDeleteConfirm(null);
            fetchAll();
        } catch (err) {
            toast.error("Failed to delete.");
        }
    };

    // ─── PAYMENT CRUD ───
    const resetPaymentForm = () => setPaymentForm({ laborerId: "", amount: "", date: "", description: "", paymentMethod: "Cash", status: "Paid" });

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await WebAPI.post("/labor/payments", paymentForm);
            toast.success("Payment recorded!");
            setShowPaymentModal(false);
            resetPaymentForm();
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredLaborers = useMemo(() => laborers.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.phone || "").includes(searchTerm)
    ), [laborers, searchTerm]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808]">
            <FaSpinner className="text-4xl animate-spin text-gray-800 mb-6" />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Synching Labor Resources...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-12 text-white min-h-screen bg-[#080808] font-sans selection:bg-white/10">
            {/* Header Area */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-white opacity-20"></span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Resource Infrastructure</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Labor Management</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => { resetLaborerForm(); setShowLaborerModal(true); }}
                        className="px-8 py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 shadow-xl flex items-center gap-3">
                        <FaPlus className="text-[9px]" /> Onboard Talent
                    </button>
                    <button onClick={() => { resetPaymentForm(); setShowPaymentModal(true); }}
                        className="px-8 py-4 bg-[#121214] border border-white/[0.05] text-white rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-white/[0.08] transition-all duration-500 flex items-center gap-3">
                        <FaMoneyBillWave className="text-[10px] opacity-40" /> Record Disbursement
                    </button>
                </div>
            </motion.div>

            {/* Metrics Dashboard */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Total Workforce", value: summary.totalLaborers, icon: <FaUsers className="opacity-30" /> },
                        { label: "Active Deployment", value: summary.activeLaborers, icon: <FaCheckCircle className="opacity-30" /> },
                        { label: "Net Disbursements", value: `₹${summary.totalPaid.toLocaleString()}`, icon: <FaWallet className="opacity-30" /> },
                        { label: "Pending Obligations", value: `₹${summary.totalPending.toLocaleString()}`, icon: <FaClock className="opacity-30" /> },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-[#121214] border border-white/[0.03] rounded-[2rem] p-8 group hover:border-white/10 transition-all duration-500">
                            <div className="w-10 h-10 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center text-gray-500 mb-6 group-hover:text-white transition-colors duration-500">{stat.icon}</div>
                            <h3 className="text-3xl font-bold text-white group-hover:tracking-wider transition-all duration-500">{stat.value}</h3>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-3">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Navigation & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="flex bg-[#121214] p-1.5 rounded-[1.2rem] border border-white/[0.03] w-full md:w-fit overflow-hidden">
                    {["Laborers", "Payments", "Summary"].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 md:flex-none px-8 py-3.5 rounded-[0.9rem] text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${activeTab === tab ? "bg-white/[0.05] text-white border border-white/[0.05]" : "text-gray-500 hover:text-gray-300"}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                
                {activeTab === "Laborers" && (
                    <div className="relative w-full md:w-96 group">
                        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-white transition-colors" />
                        <input type="text" placeholder="Filter Workforce..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#121214] border border-white/[0.03] rounded-[1.2rem] pl-16 pr-6 py-4 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all placeholder:text-gray-800 font-medium" />
                    </div>
                )}
            </div>

            {/* Content Areas */}
            <AnimatePresence mode="wait">
                {activeTab === "Laborers" && (
                    <motion.div key="laborers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {filteredLaborers.length === 0 ? (
                            <div className="py-32 text-center bg-white/[0.01] rounded-[3rem] border border-white/[0.03] border-dashed">
                                <FaUsers className="text-5xl text-gray-800 mx-auto mb-6 opacity-30" />
                                <h3 className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.3em]">Inventory Empty</h3>
                                <p className="text-gray-700 mt-3 text-xs tracking-widest uppercase">No labor records found in current scope.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredLaborers.map((l, idx) => (
                                    <motion.div key={l._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                                        className="bg-[#121214] rounded-[2rem] border border-white/[0.03] p-8 hover:border-white/10 transition-all duration-500 group relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/40 font-bold text-xl group-hover:bg-white group-hover:text-black transition-all duration-700">
                                                    {l.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-lg uppercase tracking-tight">{l.name}</h3>
                                                    {l.phone && <p className="text-[10px] text-gray-600 flex items-center gap-2 mt-1 font-bold uppercase tracking-widest"><FaPhoneAlt className="opacity-30" size={8} /> {l.phone}</p>}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border ${l.status === "Active" ? "bg-white/5 border-white/20 text-white" : "bg-transparent border-white/[0.03] text-gray-700"}`}>
                                                {l.status}
                                            </span>
                                        </div>

                                        {l.skills && l.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {l.skills.map((s, i) => (
                                                    <span key={i} className="px-3 py-1 bg-white/[0.02] text-gray-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/[0.05]">{s}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-[#0C0C0C] p-4 rounded-2xl border border-white/[0.02]">
                                                <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">Fiscal Quote</p>
                                                <p className="text-[13px] text-white font-bold">₹{(l.dailyRate || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-[#0C0C0C] p-4 rounded-2xl border border-white/[0.02]">
                                                <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">Asset Link</p>
                                                <p className="text-[13px] text-white font-bold truncate uppercase">{l.projectId?.name || "NONE"}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-6 border-t border-white/[0.03]">
                                            <button onClick={() => openEditLaborer(l)} className="flex-1 py-4 bg-white/[0.02] hover:bg-white/10 text-gray-500 hover:text-white rounded-[1.2rem] text-[10px] font-bold uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2">
                                                <FaEdit size={10} /> Inspector
                                            </button>
                                            <button onClick={() => { resetPaymentForm(); setPaymentForm(prev => ({ ...prev, laborerId: l._id })); setShowPaymentModal(true); }}
                                                className="flex-1 py-4 bg-white text-black rounded-[1.2rem] text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 flex items-center justify-center gap-2">
                                                Disburse
                                            </button>
                                            <button onClick={() => setDeleteConfirm(l._id)} className="w-14 h-14 bg-white/[0.01] hover:bg-white/[0.05] text-gray-800 hover:text-red-400 rounded-[1.2rem] border border-white/[0.03] transition-all duration-500 flex items-center justify-center">
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "Payments" && (
                    <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-[#121214] rounded-[2.5rem] border border-white/[0.03] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/[0.03]">
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Resource</th>
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Amount</th>
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Timeline</th>
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Protocol</th>
                                            <th className="p-8 text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.01]">
                                        {payments.map((p) => (
                                            <tr key={p._id} className="hover:bg-white/5 transition-colors duration-500 group">
                                                <td className="p-8 pt-10 pb-10">
                                                    <p className="font-bold text-white uppercase tracking-tight">{p.laborerId?.name || "Terminated"}</p>
                                                    <p className="text-[9px] text-gray-700 mt-1 uppercase font-bold tracking-widest">{p.description || "NO DATA"}</p>
                                                </td>
                                                <td className="p-8">
                                                    <p className="text-xl font-bold text-white group-hover:tracking-wider transition-all duration-500">₹{p.amount.toLocaleString()}</p>
                                                </td>
                                                <td className="p-8 text-[11px] text-gray-600 font-bold uppercase tracking-widest">
                                                    {new Date(p.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="p-8">
                                                    <span className="px-3 py-1 bg-white/[0.02] border border-white/[0.05] rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">{p.paymentMethod}</span>
                                                </td>
                                                <td className="p-8">
                                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${p.status === "Paid" ? "bg-white/5 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" : "bg-transparent border-white/[0.03] text-gray-700"}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "Summary" && summary && (
                    <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-10">
                            <FaChartBar className="text-gray-800" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Deployment Fiscal Reports</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {summary.laborerSummary.map(ls => (
                                <div key={ls.laborer._id} className="bg-[#121214] rounded-[2rem] border border-white/[0.03] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-white/10 transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-center text-gray-700 font-black text-xl group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-inner">
                                            {ls.laborer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg uppercase tracking-tight">{ls.laborer.name}</h4>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">RATE: ₹{(ls.laborer.dailyRate || 0).toLocaleString()} · DEP COUNT: {ls.paymentCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-12">
                                        <div className="text-right">
                                            <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest mb-1">Realized</p>
                                            <p className="text-2xl font-bold text-white tracking-tight">₹{ls.totalPaid.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest mb-1">Obligation</p>
                                            <p className="text-2xl font-bold text-gray-800 tracking-tight">₹{ls.totalPending.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS - Redesigned to Match Architect Dashboard Style */}
            <AnimatePresence>
                {/* Laborer Modal */}
                {showLaborerModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLaborerModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0A0A0B] border border-white/5 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{editingLaborer ? "Inspector Entry" : "Workforce Expansion"}</h2>
                                    <button onClick={() => setShowLaborerModal(false)} className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-white transition-all"><FaTimes size={12} /></button>
                                </div>
                                <form onSubmit={handleLaborerSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Full Name</label>
                                            <input type="text" value={laborerForm.name} onChange={e => setLaborerForm({ ...laborerForm, name: e.target.value })} required 
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Contact Protocol</label>
                                            <input type="text" value={laborerForm.phone} onChange={e => setLaborerForm({ ...laborerForm, phone: e.target.value })} 
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-800" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Competencies (CSV)</label>
                                        <input type="text" value={laborerForm.skills} onChange={e => setLaborerForm({ ...laborerForm, skills: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-800" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Fiscal Rate (INR)</label>
                                            <input type="number" value={laborerForm.dailyRate} onChange={e => setLaborerForm({ ...laborerForm, dailyRate: e.target.value })}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Asset Allocation</label>
                                            <select value={laborerForm.projectId} onChange={e => setLaborerForm({ ...laborerForm, projectId: e.target.value })}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-[12px] text-gray-500 focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                                <option value="">Status: Unlinked</option>
                                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <button type="button" onClick={() => { setShowLaborerModal(false); resetLaborerForm(); }} className="flex-1 py-4 bg-transparent border border-white/[0.05] rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-all">Discard</button>
                                        <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50">
                                            {submitting ? "Transmitting..." : editingLaborer ? "Update Audit" : "Onboard Resource"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-[#0A0A0B] border border-white/5 w-full max-w-md rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
                            <div className="p-10">
                                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Record Disbursement</h2>
                                <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em] mb-10">Fiscal Operational Log</p>
                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Target Resource</label>
                                        <select value={paymentForm.laborerId} onChange={e => setPaymentForm({ ...paymentForm, laborerId: e.target.value })} required
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-[12px] text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer">
                                            <option value="">Select Resource</option>
                                            {laborers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Quantum (INR)</label>
                                            <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} required
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Cycle Date</label>
                                            <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-sm text-gray-500 focus:outline-none focus:border-white/20 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] ml-1">Narrative</label>
                                        <input type="text" value={paymentForm.description} onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] px-6 py-4 text-[12px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-900" placeholder="e.g. Structural Phase Salary" />
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <button type="button" onClick={() => { setShowPaymentModal(false); resetPaymentForm(); }} className="flex-1 py-4 bg-transparent border border-white/[0.05] rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-all">Abort</button>
                                        <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-white text-black rounded-[1.2rem] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50">
                                            {submitting ? "Committing..." : "Authorize Log"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0A0A0B] w-full max-w-sm rounded-[2rem] border border-white/[0.05] p-10 text-center relative z-10">
                            <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight text-red-500">Purge Record?</h3>
                            <p className="text-[11px] text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed mb-10">This action will permanently redact all associated activity logs and financial history.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-white/[0.02] border border-white/[0.05] rounded-[1.2rem] text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all">Cancel</button>
                                <button onClick={() => handleDeleteLaborer(deleteConfirm)} className="flex-1 py-4 bg-red-600 text-white rounded-[1.2rem] text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)]">Execute Purge</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArchitectLabor;
