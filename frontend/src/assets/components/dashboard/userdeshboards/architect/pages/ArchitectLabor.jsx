import React, { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import axios from "axios";
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
                axios.get("/api/labor/laborers", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/labor/payments", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/labor/summary", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/construction/architect/projects", { headers: { Authorization: `Bearer ${token}` } }),
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
                await axios.put(`/api/labor/laborers/${editingLaborer._id}`, laborerForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Laborer updated!");
            } else {
                await axios.post("/api/labor/laborers", laborerForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
            await axios.delete(`/api/labor/laborers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
            await axios.post("/api/labor/payments", paymentForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1c]">
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 text-white min-h-screen bg-[#0a0f1c]">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                        Labor Management
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
                        <FaUsers className="text-orange-500" /> Manage workers, assignments & payments
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { resetLaborerForm(); setShowLaborerModal(true); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all text-sm">
                        <FaPlus /> Add Laborer
                    </button>
                    <button onClick={() => { resetPaymentForm(); setShowPaymentModal(true); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all text-sm">
                        <FaMoneyBillWave /> Record Payment
                    </button>
                </div>
            </motion.div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Workers", value: summary.totalLaborers, icon: <FaUsers className="text-blue-400" />, bg: "from-blue-500/10", border: "border-blue-500/30" },
                        { label: "Active", value: summary.activeLaborers, icon: <FaCheckCircle className="text-emerald-400" />, bg: "from-emerald-500/10", border: "border-emerald-500/30" },
                        { label: "Total Paid", value: `₹${summary.totalPaid.toLocaleString("en-IN")}`, icon: <FaWallet className="text-green-400" />, bg: "from-green-500/10", border: "border-green-500/30" },
                        { label: "Pending", value: `₹${summary.totalPending.toLocaleString("en-IN")}`, icon: <FaClock className="text-amber-400" />, bg: "from-amber-500/10", border: "border-amber-500/30" },
                    ].map((stat, idx) => (
                        <div key={idx} className={`bg-gradient-to-br ${stat.bg} to-transparent ${stat.border} border rounded-2xl p-5`}>
                            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 w-fit mb-3">{stat.icon}</div>
                            <h3 className="text-2xl md:text-3xl font-black text-white">{stat.value}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-[#1e293b]/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md mb-8 w-fit">
                {["Laborers", "Payments", "Summary"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* LABORERS TAB */}
            {activeTab === "Laborers" && (
                <motion.div key="laborers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="relative mb-6 max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Search by name or phone..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e293b]/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
                    </div>

                    {filteredLaborers.length === 0 ? (
                        <div className="py-16 text-center bg-[#1e293b]/30 rounded-3xl border border-white/10 border-dashed">
                            <FaUsers className="text-4xl text-gray-600 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-300">No Workers Found</h3>
                            <p className="text-gray-500 text-sm mt-1">Add your first laborer to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredLaborers.map((l, idx) => (
                                <motion.div key={l._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }}
                                    className="bg-[#1e293b]/80 rounded-2xl border border-white/10 p-5 hover:border-orange-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {l.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{l.name}</h3>
                                                {l.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><FaPhoneAlt /> {l.phone}</p>}
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${l.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>
                                            {l.status}
                                        </span>
                                    </div>

                                    {l.skills && l.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {l.skills.map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-white/5 text-gray-400 text-[10px] font-bold rounded-md border border-white/5">{s}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-[#0f172a]/50 p-2.5 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Daily Rate</p>
                                            <p className="text-sm text-white font-bold">₹{(l.dailyRate || 0).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div className="bg-[#0f172a]/50 p-2.5 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Project</p>
                                            <p className="text-sm text-white font-medium truncate">{l.projectId?.name || "Unassigned"}</p>
                                        </div>
                                    </div>

                                    {l.taskDescription && (
                                        <p className="text-xs text-gray-400 mb-4 bg-[#0f172a]/30 p-3 rounded-xl border border-white/5"><strong className="text-gray-300">Task:</strong> {l.taskDescription}</p>
                                    )}

                                    <div className="flex gap-2 pt-3 border-t border-white/5">
                                        <button onClick={() => openEditLaborer(l)} className="flex-1 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                                            <FaEdit /> Edit
                                        </button>
                                        <button onClick={() => { resetPaymentForm(); setPaymentForm(prev => ({ ...prev, laborerId: l._id })); setShowPaymentModal(true); }}
                                            className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                                            <FaMoneyBillWave /> Pay
                                        </button>
                                        <button onClick={() => setDeleteConfirm(l._id)} className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-all">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "Payments" && (
                <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {payments.length === 0 ? (
                        <div className="py-16 text-center bg-[#1e293b]/30 rounded-3xl border border-white/10 border-dashed">
                            <FaMoneyBillWave className="text-4xl text-gray-600 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-300">No Payments Recorded</h3>
                        </div>
                    ) : (
                        <div className="bg-[#1e293b]/40 rounded-2xl border border-white/10 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                            <th className="text-left p-4">Worker</th>
                                            <th className="text-left p-4">Amount</th>
                                            <th className="text-left p-4">Date</th>
                                            <th className="text-left p-4">Method</th>
                                            <th className="text-left p-4">Status</th>
                                            <th className="text-left p-4">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p, i) => (
                                            <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium text-white">{p.laborerId?.name || "—"}</td>
                                                <td className="p-4 font-bold text-emerald-400">₹{p.amount.toLocaleString("en-IN")}</td>
                                                <td className="p-4 text-gray-400">{new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                                                <td className="p-4"><span className="px-2.5 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-300 border border-white/10">{p.paymentMethod}</span></td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${p.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>{p.status}</span>
                                                </td>
                                                <td className="p-4 text-gray-400 max-w-[200px] truncate">{p.description || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* SUMMARY TAB */}
            {activeTab === "Summary" && summary && (
                <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FaChartBar className="text-orange-400" /> Per-Worker Payment Summary</h3>
                    <div className="space-y-3">
                        {summary.laborerSummary.map(ls => (
                            <div key={ls.laborer._id} className="bg-[#1e293b]/60 rounded-2xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center text-orange-400 font-bold border border-orange-500/30">
                                        {ls.laborer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{ls.laborer.name}</h4>
                                        <p className="text-xs text-gray-500">Rate: ₹{(ls.laborer.dailyRate || 0).toLocaleString("en-IN")}/day · {ls.paymentCount} payments</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Paid</p>
                                        <p className="text-lg font-bold text-emerald-400">₹{ls.totalPaid.toLocaleString("en-IN")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Pending</p>
                                        <p className="text-lg font-bold text-amber-400">₹{ls.totalPending.toLocaleString("en-IN")}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {summary.laborerSummary.length === 0 && (
                            <div className="py-12 text-center text-gray-500 bg-[#1e293b]/20 rounded-2xl border border-white/5 border-dashed">No data yet.</div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* LABORER MODAL */}
            <AnimatePresence>
                {showLaborerModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-start z-50 p-4 overflow-y-auto">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl relative my-8">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-rose-500 rounded-t-3xl"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-white">{editingLaborer ? "Edit Worker" : "Add Worker"}</h3>
                                    <button onClick={() => { setShowLaborerModal(false); resetLaborerForm(); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><FaTimes /></button>
                                </div>
                                <form onSubmit={handleLaborerSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Name *</label>
                                            <input type="text" value={laborerForm.name} onChange={e => setLaborerForm({ ...laborerForm, name: e.target.value })} required
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                                            <input type="text" value={laborerForm.phone} onChange={e => setLaborerForm({ ...laborerForm, phone: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Skills (comma-separated)</label>
                                        <input type="text" value={laborerForm.skills} onChange={e => setLaborerForm({ ...laborerForm, skills: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" placeholder="Masonry, Welding, Painting" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Daily Rate (₹)</label>
                                            <input type="number" value={laborerForm.dailyRate} onChange={e => setLaborerForm({ ...laborerForm, dailyRate: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Assign to Project</label>
                                            <select value={laborerForm.projectId} onChange={e => setLaborerForm({ ...laborerForm, projectId: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer">
                                                <option value="">Unassigned</option>
                                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Task Description</label>
                                        <textarea value={laborerForm.taskDescription} onChange={e => setLaborerForm({ ...laborerForm, taskDescription: e.target.value })} rows={2}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all resize-none" placeholder="What work is assigned?" />
                                    </div>
                                    <div className="flex gap-3 pt-3">
                                        <button type="button" onClick={() => { setShowLaborerModal(false); resetLaborerForm(); }}
                                            className="flex-1 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 font-bold text-sm transition-all">Cancel</button>
                                        <button type="submit" disabled={submitting}
                                            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {submitting ? <FaSpinner className="animate-spin" /> : null}
                                            {editingLaborer ? "Update" : "Add Worker"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PAYMENT MODAL */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-white">Record Payment</h3>
                                    <button onClick={() => { setShowPaymentModal(false); resetPaymentForm(); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><FaTimes /></button>
                                </div>
                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Worker *</label>
                                        <select value={paymentForm.laborerId} onChange={e => setPaymentForm({ ...paymentForm, laborerId: e.target.value })} required
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                                            <option value="">Select Worker</option>
                                            {laborers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (₹) *</label>
                                            <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} required
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                                            <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Method</label>
                                            <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                                                <option value="Cash">Cash</option>
                                                <option value="UPI">UPI</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                                            <select value={paymentForm.status} onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                                                <option value="Paid">Paid</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                                        <input type="text" value={paymentForm.description} onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all" placeholder="e.g. Weekly salary" />
                                    </div>
                                    <div className="flex gap-3 pt-3">
                                        <button type="button" onClick={() => { setShowPaymentModal(false); resetPaymentForm(); }}
                                            className="flex-1 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 font-bold text-sm transition-all">Cancel</button>
                                        <button type="submit" disabled={submitting}
                                            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {submitting ? <FaSpinner className="animate-spin" /> : null} Record Payment
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRM */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl p-6 text-center">
                            <FaTrash className="text-3xl text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Delete Worker?</h3>
                            <p className="text-sm text-gray-400 mb-6">This will also remove all associated payment records.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 font-bold text-sm">Cancel</button>
                                <button onClick={() => handleDeleteLaborer(deleteConfirm)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold text-sm">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArchitectLabor;
