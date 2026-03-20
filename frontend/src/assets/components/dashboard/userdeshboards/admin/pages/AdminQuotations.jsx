import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { Loader2, Edit3, Send, CheckCircle, Trash2, User, Phone, MapPin } from "lucide-react";

const AdminQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [editData, setEditData] = useState({ items: [], shippingPrice: 0, adminNote: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await API.get("/quotations", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuotations(data);
        } catch (err) {
            console.error("Failed to fetch quotations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (q) => {
        setSelected(q);
        setEditData({
            items: [...q.items],
            shippingPrice: q.shippingPrice || 0,
            adminNote: q.adminNote || ""
        });
    };

    const handleItemPriceChange = (index, newPrice) => {
        const newItems = [...editData.items];
        newItems[index].price = parseFloat(newPrice) || 0;
        setEditData({ ...editData, items: newItems });
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            await API.put(`/quotations/${selected._id}/admin`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Quotation adjusted and sent to customer!");
            setSelected(null);
            fetchQuotations();
        } catch (err) {
            setMessage("Failed to update quotation.");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-500" /></div>;

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-mono">
            <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-slate-900 pb-2">Quotation_Portal</h2>

            {message && <div className="mb-6 p-4 bg-cyan-50 text-cyan-800 border-2 border-cyan-200 font-bold uppercase text-xs">{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">&gt; ACTIVE_REQUESTS</h3>
                    {quotations.map(q => (
                        <div 
                            key={q._id} 
                            onClick={() => handleSelect(q)}
                            className={`p-4 border-2 transition-all cursor-pointer ${selected?._id === q._id ? 'border-cyan-500 bg-white shadow-[4px_4px_0px_rgba(6,182,212,1)]' : 'border-slate-200 bg-white hover:border-slate-400 shadow-sm'}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-black">ID_{q._id.slice(-8)}</span>
                                <span className={`text-[10px] px-2 py-1 font-bold uppercase ${q.status === 'Requested' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {q.status}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><User size={10}/> {q.user?.name}</div>
                            <div className="text-sm font-bold text-cyan-600 uppercase">₹{q.totalPrice.toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                {/* Editor */}
                {selected ? (
                    <div className="bg-white border-4 border-slate-900 p-8 shadow-[10px_10px_0px_rgba(0,0,0,1)] sticky top-24">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase">Edit_Quotation</h3>
                            <button onClick={() => setSelected(null)} className="text-xs font-bold text-pink-500 hover:underline">CLOSE_PANEL</button>
                        </div>

                        <div className="bg-slate-50 p-4 border border-slate-200 mb-6 text-xs space-y-1">
                            <p className="flex items-center gap-2 font-bold"><User size={12}/> {selected.user?.name} ({selected.user?.email})</p>
                            <p className="flex items-center gap-2"><Phone size={12}/> {selected.shippingAddress?.phone}</p>
                            <p className="flex items-center gap-2"><MapPin size={12}/> {selected.shippingAddress?.address}, {selected.shippingAddress?.city}</p>
                        </div>

                        <div className="mb-6 space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase">Item_Pricing:</h4>
                            {editData.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold line-clamp-1 uppercase">{item.name}</p>
                                        <p className="text-[10px] text-slate-400">Qty: {item.qty}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">₹</span>
                                        <input 
                                            type="number" 
                                            value={item.price} 
                                            onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                                            className="w-24 p-1 border-2 border-slate-200 text-right font-bold text-xs focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Shipping_Adjustment:</label>
                                <input 
                                    type="number" 
                                    value={editData.shippingPrice} 
                                    onChange={(e) => setEditData({...editData, shippingPrice: parseFloat(e.target.value) || 0})}
                                    className="w-full p-2 border-2 border-slate-200 font-bold text-sm focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Internal_Note:</label>
                                <textarea 
                                    value={editData.adminNote} 
                                    onChange={(e) => setEditData({...editData, adminNote: e.target.value})}
                                    className="w-full p-2 border-2 border-slate-200 text-xs focus:border-cyan-500 outline-none"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleUpdate}
                            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-cyan-600 transition-all shadow-[6px_6px_0px_rgba(6,182,212,0.3)]"
                        >
                            <Send size={18} /> Send_Quotation
                        </button>
                    </div>
                ) : (
                    <div className="hidden lg:flex flex-col items-center justify-center opacity-20 border-4 border-dashed border-slate-300">
                        <Loader2 size={64} className="mb-4" />
                        <p className="font-bold text-xl uppercase tracking-[0.3em]">SELECT_REQUEST</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminQuotations;
