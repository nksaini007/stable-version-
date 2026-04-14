import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { 
    FaWallet, FaArrowUp, FaArrowDown, FaCalendarAlt, 
    FaSpinner, FaClipboardCheck, FaRegCreditCard
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const ProviderEarnings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, thisMonth: 0 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await API.get("/bookings/provider-bookings");
            const allBookings = res.data || [];
            setBookings(allBookings);

            const completed = allBookings.filter(b => b.status === "Completed");
            const total = completed.reduce((acc, b) => acc + (b.amount || 0), 0);
            
            const pnd = allBookings
                .filter(b => ["Confirmed", "Arrived", "WorkStarted", "PaymentPending"].includes(b.status))
                .reduce((acc, b) => acc + (b.amount || 0), 0);
            
            const curMonth = new Date().getMonth();
            const curYear = new Date().getFullYear();
            const mth = completed
                .filter(b => {
                    const d = new Date(b.updatedAt);
                    return d.getMonth() === curMonth && d.getFullYear() === curYear;
                })
                .reduce((acc, b) => acc + (b.amount || 0), 0);

            setStats({ total, pending: pnd, thisMonth: mth });
        } catch (err) {
            console.error(err);
            toast.error("Financial Data Sync Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <FaSpinner className="text-4xl text-orange-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Initialising_Financial_Nodes...</span>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-mono">
            {/* 🚀 Header */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Earnings_Protocol</h1>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                     Vault: Active // Financial_Sync: Stable
                </p>
            </div>

            {/* 🚀 KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><FaWallet className="text-7xl" /></div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Assets</p>
                    <h3 className="text-4xl font-black text-white italic">₹{stats.total.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase">
                        <FaArrowUp /> Verified_Capital
                    </div>
                </div>

                <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">In Pipeline</p>
                    <h3 className="text-4xl font-black text-orange-500 italic">₹{stats.pending.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-widest">
                         Active_Deployments
                    </div>
                </div>

                <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Monthly Yield</p>
                    <h3 className="text-4xl font-black text-white italic">₹{stats.thisMonth.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-blue-500 text-[9px] font-black uppercase tracking-widest">
                         Cycle: {new Date().toLocaleString('default', { month: 'long' })}
                    </div>
                </div>
            </div>

            {/* 🚀 Transaction Ledger */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">Transaction_Ledger</h2>
                    <button className="text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest">Download_Report</button>
                </div>

                <div className="bg-[#1e293b] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-white/20 text-[9px] font-black uppercase tracking-widest italic border-b border-white/5">
                                    <th className="p-6">Transaction_ID</th>
                                    <th className="p-6">Entity</th>
                                    <th className="p-6">Date</th>
                                    <th className="p-6">Amount</th>
                                    <th className="p-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bookings.filter(b => b.status === "Completed").length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                             <FaRegCreditCard className="text-4xl text-white/5 mx-auto mb-4" />
                                             <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">No settled transactions found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.filter(b => b.status === "Completed").map(b => (
                                        <tr key={b._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <code className="text-[10px] text-white/40 font-mono group-hover:text-orange-500/50 transition-colors">TXN_{b._id.slice(-8).toUpperCase()}</code>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-0.5">
                                                    <p className="text-[11px] font-black text-white uppercase">{b.customerId?.name}</p>
                                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{b.serviceId?.title}</p>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-[10px] text-white/50">{new Date(b.updatedAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-sm font-black text-white italic">₹{b.amount.toLocaleString()}</p>
                                            </td>
                                            <td className="p-6 text-emerald-500">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    Settled
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProviderEarnings;
