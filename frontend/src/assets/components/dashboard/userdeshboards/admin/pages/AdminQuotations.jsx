import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { Loader2, Edit3, Send, CheckCircle, Trash2, User, Phone, MapPin, Package, AlertTriangle, ExternalLink, Search } from "lucide-react";
import { getOptimizedImage } from "../../../../../utils/imageUtils";

const AdminQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [editData, setEditData] = useState({ items: [], shippingPrice: 0, adminNote: "" });
    const [message, setMessage] = useState("");
    const [searchTerms, setSearchTerms] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [activeSearchIdx, setActiveSearchIdx] = useState(null);

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

    const handleItemToggleAvailability = (index) => {
        const newItems = [...editData.items];
        newItems[index].isAvailable = !newItems[index].isAvailable;
        setEditData({ ...editData, items: newItems });
    };

    const handleAlternativeChange = (index, altId) => {
        const newItems = [...editData.items];
        newItems[index].alternativeProduct = altId;
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

    const handleSearchProducts = async (term) => {
        setSearchTerms(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const { data } = await API.get(`/products/admin-all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filtered = data.filter(p => p.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
            setSearchResults(filtered);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const handleSelectAlternative = (idx, product) => {
        handleAlternativeChange(idx, product._id);
        setSearchResults([]);
        setActiveSearchIdx(null);
        setSearchTerms("");
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-500" /></div>;

    return (
        <div className="p-6 bg-[#121212] min-h-screen text-white">
            <h2 className="text-2xl font-black uppercase mb-8 border-b border-[#2A2B2F] pb-4 tracking-widest">Quotation Portal</h2>

            {message && <div className="mb-6 p-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase text-xs rounded-xl">{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-[#8E929C] uppercase tracking-widest mb-6 px-1">ACTIVE REQUESTS</h3>
                    {quotations.map(q => (
                        <div 
                            key={q._id} 
                            onClick={() => handleSelect(q)}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer ${selected?._id === q._id ? 'border-blue-500 bg-[#1A1B1E] shadow-lg shadow-blue-500/5' : 'border-[#2A2B2F] bg-[#1A1B1E] hover:border-[#323338]'}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white tracking-tight">#{q._id.slice(-8)}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${q.status === 'Requested' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                    {q.status}
                                </span>
                            </div>
                            <div className="text-xs text-[#8E929C] mb-2 flex items-center gap-2"><User size={12} className="text-[#6B7280]"/> {q.user?.name}</div>
                            <div className="text-sm font-bold text-blue-400">₹{q.totalPrice.toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                {/* Editor */}
                {selected ? (
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl p-8 sticky top-24 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest">Adjust Quotation</h3>
                            <button onClick={() => setSelected(null)} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Close Panel</button>
                        </div>

                        <div className="bg-[#121212] p-6 rounded-xl border border-[#2A2B2F] mb-8 text-[11px] space-y-3">
                            <p className="flex items-center gap-3 font-bold text-white"><User size={14} className="text-blue-500"/> {selected.user?.name} ({selected.user?.email})</p>
                            <p className="flex items-center gap-3 text-[#8E929C]"><Phone size={14} className="text-[#6B7280]"/> {selected.shippingAddress?.phone}</p>
                            <p className="flex items-center gap-3 text-[#8E929C] leading-relaxed"><MapPin size={14} className="text-[#6B7280]"/> {selected.shippingAddress?.address}, {selected.shippingAddress?.city}</p>
                        </div>

                        <div className="mb-8 space-y-6">
                            <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Line Items</h4>
                            {editData.items.map((item, idx) => (
                                <div key={idx} className={`p-6 rounded-2xl border-2 transition-colors ${item.isAvailable ? 'border-[#2A2B2F] bg-[#121212]/50' : 'border-red-900/50 bg-red-950/20'} space-y-6`}>
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-[#1A1B1E] rounded-xl border border-[#2A2B2F] overflow-hidden shrink-0">
                                            <img 
                                                src={getOptimizedImage(item.product?.images?.[0]?.url || item.image, 200)} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{item.name}</p>
                                                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0">#{item.product?._id?.slice(-6) || 'N/A'}</span>
                                            </div>
                                            <p className="text-[10px] text-[#8E929C] mt-2 uppercase">Seller: <span className="text-[#6B7280]">{item.seller?.name || item.product?.seller?.name || 'STINCHAR'}</span></p>
                                            
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <div className="p-2 bg-[#121212] rounded-lg border border-[#2A2B2F]">
                                                    <p className="text-[8px] text-[#6B7280] uppercase">Cost (Stinchar):</p>
                                                    <p className="text-[10px] text-orange-400 font-bold">₹{item.product?.pricingTiers?.stinchar ?? '0'}</p>
                                                </div>
                                                <div className="p-2 bg-[#121212] rounded-lg border border-[#2A2B2F]">
                                                    <p className="text-[8px] text-[#6B7280] uppercase">Admin Margin:</p>
                                                    <p className={`text-[10px] font-bold ${item.price - (item.product?.pricingTiers?.stinchar || 0) > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                                        ₹{(item.price - (item.product?.pricingTiers?.stinchar || 0)).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-[#6B7280] mt-3 uppercase tracking-tighter">Qty: {item.qty} | Public Price: ₹{item.product?.price || '?'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest mb-2 block px-1">Adjust Price (₹):</label>
                                            <input 
                                                type="number" 
                                                value={item.price} 
                                                onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                                                className="w-full p-3 bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl font-bold text-sm text-white focus:border-blue-500 outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-end">
                                            <button 
                                                onClick={() => handleItemToggleAvailability(idx)}
                                                className={`py-3 px-4 text-[10px] font-bold uppercase rounded-xl border transition-all ${item.isAvailable ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/5' : 'bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/10'}`}
                                            >
                                                {item.isAvailable ? "MARK UNAVAILABLE" : "RESTORE AVAILABILITY"}
                                            </button>
                                        </div>
                                    </div>

                                    {!item.isAvailable && (
                                        <div className="pt-6 border-t border-red-900/30">
                                            <label className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-3 block px-1">Recommended Alternative:</label>
                                                <div className="flex-1 relative">
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Search alternative products..."
                                                            value={activeSearchIdx === idx ? searchTerms : (typeof item.alternativeProduct === 'object' ? item.alternativeProduct?.name : (item.alternativeProduct || ""))} 
                                                            onFocus={() => setActiveSearchIdx(idx)}
                                                            onChange={(e) => handleSearchProducts(e.target.value)}
                                                            className="flex-1 p-3 bg-[#1A1B1E] border border-red-900/40 rounded-xl text-[11px] text-white outline-none focus:border-red-500"
                                                        />
                                                        {activeSearchIdx === idx && searchResults.length > 0 && (
                                                            <div className="absolute bottom-full left-0 right-0 bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl z-50 mb-2 max-h-48 overflow-y-auto shadow-2xl p-2">
                                                                {searchResults.map((res) => (
                                                                    <div 
                                                                        key={res._id} 
                                                                        onClick={() => handleSelectAlternative(idx, res)}
                                                                        className="p-3 hover:bg-[#121212] rounded-xl cursor-pointer text-[10px] border-b border-[#2A2B2F] last:border-0 flex justify-between group"
                                                                    >
                                                                        <span className="font-bold text-[#8E929C] group-hover:text-white transition-colors">{res.name}</span>
                                                                        <span className="text-blue-400">₹{res.price}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <button 
                                                            type="button"
                                                            onClick={() => setActiveSearchIdx(activeSearchIdx === idx ? null : idx)}
                                                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
                                                        >
                                                            <Search size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-6 mb-8">
                            <div>
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2 block px-1">Shipping Adjustment (₹):</label>
                                <input 
                                    type="number" 
                                    value={editData.shippingPrice} 
                                    onChange={(e) => setEditData({...editData, shippingPrice: parseFloat(e.target.value) || 0})}
                                    className="w-full p-4 bg-[#121212] border border-[#2A2B2F] rounded-xl font-bold text-sm text-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2 block px-1">Internal Review Note:</label>
                                <textarea 
                                    value={editData.adminNote} 
                                    onChange={(e) => setEditData({...editData, adminNote: e.target.value})}
                                    className="w-full p-4 bg-[#121212] border border-[#2A2B2F] rounded-xl text-xs text-[#8E929C] focus:border-blue-500 outline-none transition-colors"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleUpdate}
                            className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10"
                        >
                            <Send size={18} /> Send Quotation
                        </button>
                    </div>
                ) : (
                    <div className="hidden lg:flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-[#2A2B2F] rounded-3xl">
                        <Loader2 size={64} className="mb-4 text-[#8E929C]" />
                        <p className="font-bold text-sm uppercase tracking-[0.5em] text-[#6B7280]">Select Request</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminQuotations;
