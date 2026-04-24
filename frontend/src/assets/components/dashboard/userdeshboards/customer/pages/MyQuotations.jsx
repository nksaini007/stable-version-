import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { Loader2, FileText } from "lucide-react";

const MyQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await API.get("/quotations/my", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuotations(data);
        } catch (err) {
            console.error("Failed to fetch quotations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (id, response) => {
        try {
            const token = localStorage.getItem("token");
            await API.put(`/quotations/${id}/respond`, { response }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Quotation ${response} successfully!`);
            fetchQuotations();
        } catch (err) {
            setMessage("Failed to respond to quotation.");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 customer-theme">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-medium text-zinc-900 tracking-tight flex items-center gap-2">
                    <FileText size={18} className="text-zinc-500" /> Quotation Requests
                </h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Manage Your Custom Quotes</p>
            </div>

            {message && (
                <div className="mb-4 p-3 bg-zinc-50 text-zinc-800 text-[10px] font-medium border border-zinc-200 rounded-lg tracking-widest uppercase">
                    {message}
                </div>
            )}

            {quotations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200">
                     <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-100">
                        <FileText size={16} className="text-zinc-300" />
                     </div>
                     <h3 className="text-sm font-medium text-zinc-900 mb-1">No Quotations Found</h3>
                     <p className="text-[10px] text-zinc-400 tracking-wide">You haven't requested any custom quotes yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quotations.map((q) => (
                        <div key={q._id} className="bg-white rounded-xl border border-zinc-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Request ID: {q._id.slice(-8)}</span>
                                    <h3 className="text-lg font-medium text-zinc-900 mt-1 flex items-baseline gap-2 !font-medium">
                                        ₹{q.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">({q.items.length} Items)</span>
                                    </h3>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[8px] font-medium uppercase tracking-widest shadow-sm ${
                                    q.status === 'Requested' ? 'bg-zinc-50 text-zinc-500 border border-zinc-200' :
                                    q.status === 'Adjusted' ? 'bg-zinc-900 text-white border border-zinc-900' :
                                    q.status === 'Accepted' ? 'bg-zinc-100 text-zinc-900 border border-zinc-300' :
                                    'bg-zinc-50 text-zinc-400 border border-zinc-100'
                                }`}>
                                    {q.status}
                                </div>
                            </div>

                            <div className="space-y-3 mb-5 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                                {q.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm items-center">
                                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-zinc-100 shadow-sm">
                                            <img 
                                                src={item.product?.images?.[0]?.url || item.image} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className={`text-[11px] font-medium text-zinc-800 !font-medium ${!item.isAvailable ? 'line-through text-zinc-400' : ''}`}>{item.name}</p>
                                                    <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">QTY: {item.qty} • UNIT: ₹{item.price.toLocaleString()}</p>
                                                </div>
                                                <span className="font-medium text-zinc-900 text-[13px] !font-medium">₹{(item.price * item.qty).toLocaleString()}</span>
                                            </div>
                                            {!item.isAvailable && (
                                                <div className="mt-2 p-2.5 bg-zinc-100 border border-zinc-200 rounded-lg text-[9px]">
                                                    <p className="text-zinc-500 font-medium uppercase tracking-widest mb-1">Product Unavailable</p>
                                                    {item.alternativeProduct ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-zinc-400 font-medium uppercase">Suggestion:</span>
                                                            <span className="text-zinc-800 font-medium underline underline-offset-2">{item.alternativeProduct.name}</span>
                                                            <span className="text-zinc-500 font-medium">₹{item.alternativeProduct.price.toLocaleString()}</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-zinc-400 italic">No alternative suggested.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-medium uppercase tracking-widest text-zinc-400">
                                        <span>Items Subtotal</span>
                                        <span>₹{q.itemsPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-medium uppercase tracking-widest text-zinc-500">
                                        <span>{q.shippingPrice > 0 ? "Logistics Charges" : "Logistics"}</span>
                                        <span>{q.shippingPrice > 0 ? `+ ₹${q.shippingPrice.toLocaleString()}` : "FREE_OR_TBD"}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px] font-medium text-zinc-900 pt-2 border-t border-zinc-100 !font-medium">
                                        <span>Grand Total</span>
                                        <span>₹{q.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {q.adminNote && (
                                <div className="mb-5 p-3 bg-zinc-50 rounded-lg border-l-2 border-zinc-300">
                                    <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mb-1">Admin Note:</p>
                                    <p className="text-[11px] text-zinc-600 italic">"{q.adminNote}"</p>
                                </div>
                            )}

                            {q.status === 'Adjusted' && (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleResponse(q._id, 'Accepted')}
                                        className="flex-1 py-2 bg-zinc-900 hover:bg-black text-white text-[9px] font-medium uppercase tracking-widest rounded-lg transition-all shadow-sm"
                                    >
                                        Accept & Proceed
                                    </button>
                                    <button 
                                        onClick={() => handleResponse(q._id, 'Rejected')}
                                        className="flex-1 py-2 bg-white border border-red-200 text-red-500 text-[9px] font-medium uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {q.status === 'Accepted' && (
                                <div className="p-3 bg-zinc-50 text-zinc-600 text-center rounded-lg border border-zinc-200 font-medium uppercase tracking-widest text-[9px]">
                                    Quotation Accepted. Processing order...
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyQuotations;
