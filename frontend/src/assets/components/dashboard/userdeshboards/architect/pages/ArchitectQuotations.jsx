import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { Loader2, FileText } from "lucide-react";
import { FaChevronRight } from "react-icons/fa";

const ArchitectQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const { data } = await API.get("/quotations/my");
            setQuotations(data);
        } catch (err) {
            console.error("Failed to fetch quotations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (id, response) => {
        try {
            await API.put(`/quotations/${id}/respond`, { response });
            setMessage(`QUOTATION_${response.toUpperCase()}_SUCCESSFULLY`);
            fetchQuotations();
        } catch (err) {
            setMessage("SYSTEM_ERROR: FAILED_TO_RESPOND");
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0C0C0C] flex justify-center p-20"><Loader2 className="animate-spin text-[#ff5c00]" /></div>;

    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white p-6 md:p-10 font-mono">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-widest relative inline-block">
                            HQ Quotations
                            <div className="absolute -bottom-2 lg:-bottom-4 left-0 w-1/3 h-1 bg-[#ff5c00]"></div>
                        </h1>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-4 lg:mt-6">
                            Review and approve custom architectural supply rates.
                        </p>
                    </div>
                </div>

                {message && (
                    <div className="p-4 bg-[#ff5c00]/10 border border-[#ff5c00]/30 text-[#ff5c00] font-bold text-[10px] uppercase tracking-widest rounded-xl">
                        {message}
                    </div>
                )}

                {quotations.length === 0 ? (
                    <div className="text-center py-20 bg-[#1A1A1C] border-2 border-dashed border-white/10 rounded-2xl">
                        <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-white mb-2 tracking-widest uppercase">No Active Proposals</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            No active quotations found in the mainframe.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 pt-6">
                        {quotations.map((q) => (
                            <div key={q._id} className="bg-[#1A1A1C] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all shadow-xl group">
                                <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/5">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">REQUEST_ID: {q._id.slice(-8)}</span>
                                        <h3 className="text-2xl font-black text-white mt-2 flex items-baseline gap-2">
                                            ₹{q.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">({q.items.length} Items)</span>
                                        </h3>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                        q.status === 'Requested' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        q.status === 'Adjusted' ? 'bg-[#ff5c00]/10 text-[#ff5c00] border border-[#ff5c00]/30 animate-pulse' :
                                        q.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                        STATUS::{q.status}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Line Items</h4>
                                    {q.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 text-sm items-center bg-black/30 p-4 rounded-xl border border-white/5">
                                            <div className="w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0 border border-white/10">
                                                <img 
                                                    src={item.product?.images?.[0]?.url || item.image} 
                                                    alt="" 
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className={`font-bold text-white truncate ${!item.isAvailable ? 'line-through opacity-50' : ''}`}>{item.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">QTY: {item.qty} • UNIT: ₹{item.price.toLocaleString()}</p>
                                                    </div>
                                                    <span className="font-extrabold text-white">₹{(item.price * item.qty).toLocaleString()}</span>
                                                </div>
                                                {!item.isAvailable && (
                                                    <div className="mt-3 p-3 bg-red-950/30 border border-red-500/20 rounded-lg text-[10px]">
                                                        <p className="text-red-500 font-black uppercase mb-1">Warning: Inventory Depleted</p>
                                                        {item.alternativeProduct ? (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-gray-500 font-bold uppercase">Replacement:</span>
                                                                <span className="text-orange-400 font-bold underline decoration-orange-400/30 underline-offset-4">{item.alternativeProduct.name}</span>
                                                                <span className="text-gray-400 font-bold">₹{item.alternativeProduct.price.toLocaleString()}</span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500">No systematic fallback. Proceed manually.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            <span>Subtotal</span>
                                            <span>₹{q.itemsPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#ff5c00]">
                                            <span>{q.shippingPrice > 0 ? "Logistics" : "Logistics"}</span>
                                            <span>{q.shippingPrice > 0 ? `+ ₹${q.shippingPrice.toLocaleString()}` : "TBD / FREE"}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-white/5 uppercase tracking-tighter">
                                            <span>Gross Total</span>
                                            <span className="text-xl text-emerald-400">₹{q.totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {q.adminNote && (
                                    <div className="mb-6 p-4 bg-orange-500/5 rounded-lg border-l-2 border-orange-500">
                                        <p className="text-[10px] font-black text-orange-500/70 uppercase mb-2 tracking-widest">HQ NOTE:</p>
                                        <p className="text-xs text-gray-300 font-medium">"{q.adminNote}"</p>
                                    </div>
                                )}

                                {q.status === 'Adjusted' && (
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={() => handleResponse(q._id, 'Accepted')}
                                            className="flex-1 py-3 bg-[#ff5c00] text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-[#e65300] transition-all flex justify-center items-center gap-2"
                                        >
                                            Confirm <FaChevronRight size={10} />
                                        </button>
                                        <button 
                                            onClick={() => handleResponse(q._id, 'Rejected')}
                                            className="flex-1 py-3 bg-transparent border border-red-500/50 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-500/10 transition-all"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}

                                {q.status === 'Accepted' && (
                                    <div className="p-4 bg-emerald-500/10 text-emerald-500 text-center rounded-xl border border-emerald-500/20 font-black uppercase text-[10px] tracking-[0.2em] mt-4">
                                        Contract Executed. Awaiting final order manifest.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArchitectQuotations;
