import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { Loader2, CheckCircle, XCircle, Clock, FileText } from "lucide-react";

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

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 bg-white min-h-screen">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-cyan-600" /> My Quotation Requests
            </h2>

            {message && <div className="mb-4 p-3 bg-cyan-50 text-cyan-700 font-bold border-l-4 border-cyan-500">{message}</div>}

            {quotations.length === 0 ? (
                <div className="text-center py-20 text-gray-500 border-2 border-dashed rounded-xl">
                    No quotation requests found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {quotations.map((q) => (
                        <div key={q._id} className="border-2 border-slate-100 rounded-xl p-6 hover:border-cyan-200 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Request ID: {q._id.slice(-8)}</span>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">

                                        ₹{q.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">({q.items.length} Items)</span>
                                    </h3>
                                </div>
                                <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                    q.status === 'Requested' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    q.status === 'Adjusted' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200 animate-pulse' :
                                    q.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                    'bg-rose-100 text-rose-700 border border-rose-200'
                                }`}>
                                    {q.status}
                                </div>
                            </div>


                            <div className="space-y-4 mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                {q.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 text-sm items-center">
                                        <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                                            <img 
                                                src={item.product?.images?.[0]?.url || item.image} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className={`font-bold text-slate-800 ${!item.isAvailable ? 'line-through opacity-50' : ''}`}>{item.name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QTY: {item.qty} • UNIT: ₹{item.price.toLocaleString()}</p>
                                                </div>
                                                <span className="font-extrabold text-slate-900 text-base">₹{(item.price * item.qty).toLocaleString()}</span>
                                            </div>
                                            {!item.isAvailable && (
                                                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl text-[11px]">
                                                    <p className="text-red-700 font-black uppercase mb-1">Product_Unavailable</p>
                                                    {item.alternativeProduct ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500 font-bold uppercase">Recommendation:</span>
                                                            <span className="text-cyan-700 font-black underline decoration-cyan-400/30 underline-offset-4">{item.alternativeProduct.name}</span>
                                                            <span className="text-slate-400 font-black">₹{item.alternativeProduct.price.toLocaleString()}</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-400 italic">No alternative suggested. Please contact us.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Items Subtotal</span>
                                        <span>₹{q.itemsPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-600">
                                        <span>{q.shippingPrice > 0 ? "Logistics Charges" : "Logistics"}</span>
                                        <span>{q.shippingPrice > 0 ? `+ ₹${q.shippingPrice.toLocaleString()}` : "FREE_OR_TBD"}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-100 uppercase tracking-tighter">
                                        <span>Grand Total</span>
                                        <span className="text-2xl text-emerald-800">₹{q.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>


                            {q.adminNote && (
                                <div className="mb-6 p-4 bg-slate-50 rounded-lg border-l-4 border-slate-300">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Admin Note:</p>
                                    <p className="text-sm italic">"{q.adminNote}"</p>
                                </div>
                            )}

                            {q.status === 'Adjusted' && (
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleResponse(q._id, 'Accepted')}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-lg transition-all shadow-md"
                                    >
                                        Accept & Proceed
                                    </button>
                                    <button 
                                        onClick={() => handleResponse(q._id, 'Rejected')}
                                        className="flex-1 py-3 bg-white border-2 border-red-200 text-red-500 font-black uppercase tracking-widest rounded-lg hover:border-red-500 transition-all"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {q.status === 'Accepted' && (
                                <div className="p-4 bg-green-50 text-green-700 text-center rounded-lg border-2 border-green-100 font-bold uppercase tracking-widest text-sm">
                                    Quotation Accepted. Admin will process your order soon.
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
