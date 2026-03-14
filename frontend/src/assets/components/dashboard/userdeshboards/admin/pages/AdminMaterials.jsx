import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaCubes, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaSpinner, FaBoxes } from "react-icons/fa";

const AdminMaterials = () => {
    const { token } = useContext(AuthContext);
    const [materials, setMaterials] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("materials");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: "", category: "Cement", unit: "kg", unitPrice: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) fetchAllData();
    }, [token]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [matRes, reqRes] = await Promise.all([
                axios.get("/api/materials/all", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/materials/requests/all", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            // Filter only global materials for admin database
            setMaterials(matRes.data.materials.filter(m => m.isGlobal));
            setRequests(reqRes.data.requests);
        } catch (error) {
            toast.error("Failed to load materials data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMaterial = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await axios.put(`/api/materials/global/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Material updated!");
            } else {
                await axios.post("/api/materials/global", formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Material added to global database");
            }
            setShowModal(false);
            setFormData({ name: "", category: "Cement", unit: "kg", unitPrice: "", description: "" });
            setEditingId(null);
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save material");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this material from the global database?")) return;
        try {
            await axios.delete(`/api/materials/global/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Material deleted");
            fetchAllData();
        } catch (error) {
            toast.error("Failed to delete material");
        }
    };

    const openEditModal = (material) => {
        setFormData({
            name: material.name,
            category: material.category,
            unit: material.unit,
            unitPrice: material.unitPrice,
            description: material.description || ""
        });
        setEditingId(material._id);
        setShowModal(true);
    };

    const handleRequestAction = async (id, status) => {
        const notes = prompt(`Optional: Enter notes for ${status.toLowerCase()} this request:`);
        if (notes === null) return; // cancelled

        try {
            await axios.put(`/api/materials/requests/${id}`, { status, adminNotes: notes }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Request ${status.toLowerCase()}`);
            fetchAllData();
        } catch (error) {
            toast.error("Failed to update request");
        }
    };

    if (loading) return <div className="p-8 text-center"><FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto" /></div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaBoxes className="text-indigo-600" /> Material Management</h1>
                <button onClick={() => { setFormData({ name: "", category: "Cement", unit: "kg", unitPrice: "", description: "" }); setEditingId(null); setShowModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <FaPlus /> Add Material
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab("materials")} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "materials" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    Global Database ({materials.length})
                </button>
                <button onClick={() => setActiveTab("requests")} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === "requests" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    Architect Requests
                    {requests.filter(r => r.status === "Pending").length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.filter(r => r.status === "Pending").length}</span>
                    )}
                </button>
            </div>

            {/* Tab: Materials Database */}
            {activeTab === "materials" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Unit</th>
                                <th className="px-6 py-4">Price / Unit</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {materials.map(m => (
                                <tr key={m._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{m.name}</td>
                                    <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{m.category}</span></td>
                                    <td className="px-6 py-4 text-gray-600">{m.unit}</td>
                                    <td className="px-6 py-4 font-semibold">₹{m.unitPrice}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => openEditModal(m)} className="text-blue-500 hover:text-blue-700 p-1"><FaEdit /></button>
                                        <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:text-red-700 p-1"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                            {materials.length === 0 && <tr><td colSpan="5" className="text-center p-8 text-gray-500">No materials in the global database</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Requests */}
            {activeTab === "requests" && (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-gray-900">Request from {req.architectId?.name || "Unknown Architect"}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">Project: <span className="font-semibold">{req.projectId?.name || "Unknown Project"}</span> &bull; Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                                {req.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRequestAction(req._id, "Approved")} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"><FaCheck /> Approve</button>
                                        <button onClick={() => handleRequestAction(req._id, "Rejected")} className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"><FaTimes /> Reject</button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 border-b border-gray-50 pb-1">Requested Items</h4>
                                <ul className="space-y-2">
                                    {req.items.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center text-sm bg-gray-50 py-1.5 px-3 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">{item.materialId?.name || item.materialName || "Custom Material"}</span>
                                                <span className="text-gray-400 text-xs">({item.materialId?.category || "Custom"})</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${item.urgency === 'High' ? 'bg-red-100 text-red-700' : item.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{item.urgency} Priority</span>
                                                <span className="font-bold bg-indigo-50 text-indigo-700 px-2 rounded-sm border border-indigo-100">{item.quantity} {item.unit || item.materialId?.unit || "units"}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {req.adminNotes && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm italic text-gray-600 border border-gray-100">
                                    <span className="font-bold -not-italic text-gray-700">Notes:</span> {req.adminNotes}
                                </div>
                            )}
                        </div>
                    ))}
                    {requests.length === 0 && <div className="text-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">No material requests found.</div>}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">{editingId ? "Edit" : "Add"} Global Material</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSaveMaterial} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Portland Cement" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                        <option>Cement</option><option>Sand</option><option>Steel</option><option>Bricks</option><option>Wood</option><option>Electrical</option><option>Plumbing</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unit</label>
                                    <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                        <option>kg</option><option>tons</option><option>bags</option><option>sqft</option><option>cft</option><option>pieces</option><option>meters</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unit Price (₹)</label>
                                <input type="number" required min="0" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="450" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description (Optional)</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20" placeholder="Additional details..." />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                                    {submitting ? "Saving..." : "Save Material"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMaterials;
