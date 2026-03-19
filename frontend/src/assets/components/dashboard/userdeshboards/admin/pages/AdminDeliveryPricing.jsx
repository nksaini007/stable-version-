import React, { useState, useEffect, useContext } from "react";
import {
    FaTruck, FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
    FaMotorcycle, FaBox, FaWeightHanging, FaMapMarkerAlt,
    FaDatabase, FaCalculator, FaCheckCircle,
} from "react-icons/fa";
import API from "../../../../../api/api";

const VEHICLE_ICONS = {
    bike: "🏍️",
    mini_truck: "🚐",
    truck: "🚚",
    heavy_trailer: "🚛",
};

const VEHICLE_LABELS = {
    bike: "Bike/Scooter",
    mini_truck: "Mini Truck (1T)",
    truck: "Truck (5T)",
    heavy_trailer: "Heavy Trailer (25T)",
};

const NORTH_INDIA_STATES = [
    "Delhi", "UP", "Uttar Pradesh", "Haryana", "Punjab", "Rajasthan",
    "Himachal Pradesh", "Uttarakhand", "Bihar", "Jharkhand", "Jammu and Kashmir", "Ladakh",
];

const emptyRule = {
    zoneName: "", states: [], vehicleType: "bike", vehicleLabel: "",
    maxWeightKg: 0, basePrice: 0, pricePerKm: 0, pricePerKg: 0,
    minDistanceKm: 0, maxDistanceKm: 500, minimumCharge: 0, isActive: true,
};

export default function AdminDeliveryPricing() {
    const { token } = useContext(AuthContext);
    const [tab, setTab] = useState("rules");
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [modal, setModal] = useState(null); // null | {mode:'add'|'edit', rule}
    const [form, setForm] = useState(emptyRule);
    const [msg, setMsg] = useState("");
    const [groupBy, setGroupBy] = useState("zone"); // zone | vehicle

    // Calculator state
    const [calcForm, setCalcForm] = useState({ pincode: "", weightKg: "", volumeM3: "", estimatedKm: 50 });
    const [calcResult, setCalcResult] = useState(null);
    const [calcLoading, setCalcLoading] = useState(false);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchRules(); }, []);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/delivery-pricing/`, { headers });
            setRules(data);
        } catch { } finally { setLoading(false); }
    };

    const handleSeed = async () => {
        if (!confirm("This will reset ALL delivery pricing rules with North India defaults. Continue?")) return;
        setSeeding(true);
        try {
            const { data } = await API.post(`/delivery-pricing/seed`, {}, { headers });
            setMsg(`✅ ${data.message}`);
            fetchRules();
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Error"));
        } finally { setSeeding(false); }
    };

    const openAdd = () => { setForm({ ...emptyRule }); setModal("add"); };
    const openEdit = (rule) => { setForm({ ...rule }); setModal("edit"); };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (modal === "add") {
                await API.post(`/delivery-pricing/`, form, { headers });
                setMsg("✅ Rule added");
            } else {
                await API.put(`/delivery-pricing/${form._id}`, form, { headers });
                setMsg("✅ Rule updated");
            }
            fetchRules();
            setModal(null);
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.message || "Error"));
        } finally { setLoading(false); }
    };

    const handleDelete = async (id, label) => {
        if (!confirm(`Delete "${label}" rule?`)) return;
        try {
            await API.delete(`/delivery-pricing/${id}`, { headers });
            setMsg("✅ Rule deleted");
            fetchRules();
        } catch { setMsg("❌ Error deleting rule"); }
    };

    const handleCalculate = async () => {
        if (!calcForm.pincode || !calcForm.weightKg) return;
        setCalcLoading(true);
        setCalcResult(null);
        try {
            const { data } = await API.post(`/delivery-pricing/calculate`, calcForm, { headers });
            setCalcResult(data);
        } catch (err) {
            setCalcResult({ error: err.response?.data?.message || "Error calculating" });
        } finally { setCalcLoading(false); }
    };

    // Group rules for display
    const grouped = rules.reduce((acc, r) => {
        const key = groupBy === "zone" ? r.zoneName : r.vehicleType;
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
    }, {});

    const totalRules = rules.length;
    const activeRules = rules.filter((r) => r.isActive).length;
    const zones = [...new Set(rules.map((r) => r.zoneName))].length;
    const vehicles = [...new Set(rules.map((r) => r.vehicleType))].length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <FaTruck className="text-blue-400" /> Delivery Pricing Control
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage delivery zones, vehicle rates, and multi-vehicle rules for North India</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSeed} disabled={seeding}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60">
                        <FaDatabase /> {seeding ? "Seeding..." : "Seed North India Defaults"}
                    </button>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all">
                        <FaPlus /> Add Rule
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Rules", val: totalRules, icon: "📋", color: "from-blue-500 to-cyan-500" },
                    { label: "Active Rules", val: activeRules, icon: "✅", color: "from-green-500 to-emerald-500" },
                    { label: "Coverage Zones", val: zones, icon: "🗺️", color: "from-orange-500 to-amber-500" },
                    { label: "Vehicle Types", val: vehicles, icon: "🚛", color: "from-purple-500 to-pink-500" },
                ].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
                        <p className="text-2xl font-black text-white">{s.val}</p>
                        <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {msg && (
                <div className={`p-3 rounded-xl text-sm text-center border ${msg.startsWith("✅") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {msg} <button onClick={() => setMsg("")} className="ml-3 opacity-60 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-white/[0.03] border border-white/5 p-1 rounded-xl w-fit">
                {[["rules", "Pricing Rules"], ["calculator", "Charge Calculator"]].map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* RULES TAB */}
            {tab === "rules" && (
                <>
                    <div className="flex gap-2 items-center">
                        <span className="text-gray-400 text-sm">Group by:</span>
                        {[["zone", "Zone"], ["vehicle", "Vehicle Type"]].map(([k, l]) => (
                            <button key={k} onClick={() => setGroupBy(k)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === k ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
                                {l}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading pricing rules...</div>
                    ) : (
                        Object.entries(grouped).map(([group, groupRules]) => (
                            <div key={group} className="space-y-2">
                                <h3 className=" font-bold flex items-center gap-2">
                                    {groupBy === "vehicle" ? <span>{VEHICLE_ICONS[group]}</span> : <FaMapMarkerAlt className="text-blue-400" />}
                                    {groupBy === "vehicle" ? VEHICLE_LABELS[group] || group : group}
                                    <span className="text-gray-500 text-xs font-normal">({groupRules.length} rules)</span>
                                </h3>
                                <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-white/[0.03]">
                                                    {(groupBy === "zone"
                                                        ? ["Vehicle", "Max Weight", "Base Price", "Per Km", "Per Kg", "Min Charge", "Status", "Actions"]
                                                        : ["Zone", "States", "Max Weight", "Base Price", "Per Km", "Per Kg", "Status", "Actions"]
                                                    ).map((h) => (
                                                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupRules.map((r) => (
                                                    <tr key={r._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                                                        {groupBy === "zone" ? (
                                                            <>
                                                                <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                                                                    {VEHICLE_ICONS[r.vehicleType]} {r.vehicleLabel || VEHICLE_LABELS[r.vehicleType]}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-300">{r.maxWeightKg?.toLocaleString()} kg</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="px-4 py-3 text-white font-semibold">{r.zoneName}</td>
                                                                <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">{r.states?.join(", ")}</td>
                                                            </>
                                                        )}
                                                        <td className="px-4 py-3 text-orange-400 font-bold">₹{r.basePrice}</td>
                                                        <td className="px-4 py-3 text-gray-300">₹{r.pricePerKm}/km</td>
                                                        <td className="px-4 py-3 text-gray-300">₹{r.pricePerKg}/kg</td>
                                                        {groupBy === "zone" && <td className="px-4 py-3 text-gray-400">₹{r.minimumCharge || 0}</td>}
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                                {r.isActive ? "Active" : "Off"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <button onClick={() => openEdit(r)}
                                                                    className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                                                                    <FaEdit />
                                                                </button>
                                                                <button onClick={() => handleDelete(r._id, `${r.zoneName} - ${r.vehicleType}`)}
                                                                    className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {!loading && rules.length === 0 && (
                        <div className="text-center py-16 text-gray-500">
                            <FaTruck className="text-5xl mx-auto mb-4 opacity-20" />
                            <p className="mb-4">No pricing rules configured.</p>
                            <button onClick={handleSeed} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-all">
                                🌐 Seed North India Defaults
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* CALCULATOR TAB */}
            {tab === "calculator" && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
                        <h3 className="text-white font-bold flex items-center gap-2"><FaCalculator className="text-blue-400" /> Delivery Charge Calculator</h3>
                        <p className="text-gray-400 text-sm">Preview how delivery charges are calculated for any order</p>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Delivery Pincode *</label>
                            <input value={calcForm.pincode} onChange={(e) => setCalcForm({ ...calcForm, pincode: e.target.value })}
                                placeholder="e.g. 226001"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Weight (kg) *</label>
                                <input type="number" value={calcForm.weightKg} onChange={(e) => setCalcForm({ ...calcForm, weightKg: e.target.value })}
                                    placeholder="e.g. 250"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Volume (m³)</label>
                                <input type="number" value={calcForm.volumeM3} onChange={(e) => setCalcForm({ ...calcForm, volumeM3: e.target.value })}
                                    placeholder="e.g. 2.5"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Est. Distance (km)</label>
                                <input type="number" value={calcForm.estimatedKm} onChange={(e) => setCalcForm({ ...calcForm, estimatedKm: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50" />
                            </div>
                        </div>
                        <button onClick={handleCalculate} disabled={calcLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60">
                            {calcLoading ? "Calculating..." : "Calculate Delivery Charge"}
                        </button>
                    </div>

                    {/* Result */}
                    <div>
                        {calcResult && !calcResult.error && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
                                <h3 className="text-white font-bold flex items-center gap-2"><FaCheckCircle className="text-green-400" /> Calculation Result</h3>

                                {calcResult.multiVehicle && (
                                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                        <p className="text-orange-400 font-bold text-sm">⚠️ Multi-Vehicle Required</p>
                                        <p className="text-orange-300/80 text-xs mt-1">{calcResult.note}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Zone</span>
                                        <span className="text-white font-semibold">{calcResult.zone}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Vehicle Type</span>
                                        <span className="text-white font-semibold">
                                            {VEHICLE_ICONS[calcResult.vehicleType]} {calcResult.vehicleLabel}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Vehicles Needed</span>
                                        <span className={`font-bold ${calcResult.vehicleCount > 1 ? "text-orange-400" : "text-white"}`}>
                                            × {calcResult.vehicleCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Base Charge</span>
                                        <span className="text-gray-300">₹{calcResult.breakdown?.baseCharge}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Weight Charge</span>
                                        <span className="text-gray-300">₹{calcResult.breakdown?.weightCharge}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Distance Charge</span>
                                        <span className="text-gray-300">₹{calcResult.breakdown?.distanceCharge} ({calcResult.breakdown?.totalEstimatedKm} km)</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 bg-blue-500/10 rounded-xl px-3 border border-blue-500/20">
                                        <span className="text-blue-300 font-bold">Total Delivery Charge</span>
                                        <span className="text-blue-300 font-black text-xl">₹{calcResult.totalCharge}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {calcResult?.error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400">{calcResult.error}</div>
                        )}
                        {!calcResult && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center text-gray-500">
                                <FaTruck className="text-5xl mx-auto mb-4 opacity-20" />
                                <p>Enter order details to calculate delivery charge</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ADD / EDIT MODAL */}
            {modal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-white font-bold">{modal === "add" ? "Add Pricing Rule" : "Edit Pricing Rule"}</h3>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Zone Name *</label>
                                    <input value={form.zoneName} onChange={(e) => setForm({ ...form, zoneName: e.target.value })}
                                        placeholder="e.g. Delhi NCR"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">States Covered (comma separated)</label>
                                    <input value={form.states?.join(", ")} onChange={(e) => setForm({ ...form, states: e.target.value.split(",").map((s) => s.trim()) })}
                                        placeholder="e.g. Delhi, Haryana, UP"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Vehicle Type *</label>
                                    <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
                                        {Object.entries(VEHICLE_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#0f172a]">{VEHICLE_ICONS[v]} {l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Vehicle Label</label>
                                    <input value={form.vehicleLabel} onChange={(e) => setForm({ ...form, vehicleLabel: e.target.value })}
                                        placeholder="Display label"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Max Weight (kg) *</label>
                                    <input type="number" value={form.maxWeightKg} onChange={(e) => setForm({ ...form, maxWeightKg: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Base Price (₹) *</label>
                                    <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Price per Km (₹)</label>
                                    <input type="number" value={form.pricePerKm} onChange={(e) => setForm({ ...form, pricePerKm: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Price per Kg (₹)</label>
                                    <input type="number" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Minimum Charge (₹)</label>
                                    <input type="number" value={form.minimumCharge} onChange={(e) => setForm({ ...form, minimumCharge: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                </div>
                                <div className="flex items-center gap-3 col-span-2">
                                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                                    <label htmlFor="isActive" className="text-white text-sm">Active Rule</label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setModal(null)}
                                    className="flex-1 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm hover:bg-white/10 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={loading}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                    <FaSave /> {loading ? "Saving..." : "Save Rule"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
