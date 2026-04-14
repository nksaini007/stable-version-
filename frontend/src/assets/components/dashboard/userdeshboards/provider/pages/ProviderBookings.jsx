import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { 
    FaCheck, FaBan, FaCalendarAlt, FaUser, FaTools, 
    FaMapMarkerAlt, FaPhone, FaArrowRight, FaSpinner,
    FaRegClock
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ProviderBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await API.get("/bookings/provider-bookings");
            setBookings(res.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to sync booking data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await API.put(`/bookings/${id}/status`, { status });
            toast.success(`Node_Status -> ${status.toUpperCase()}`);
            fetchBookings();
        } catch (err) {
            toast.error("Status Sync Failure");
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === "All") return true;
        if (filter === "Active") return ["Confirmed", "Arrived", "WorkStarted", "PaymentPending"].includes(b.status);
        if (filter === "Pending") return b.status === "Pending";
        if (filter === "Completed") return b.status === "Completed";
        return b.status === filter;
    });

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'Confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <FaSpinner className="text-4xl text-orange-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Syncing_Booking_Manifest...</span>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-mono">
            {/* 🚀 Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Booking_Logs</h1>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                         Status: Node_Connected // Total_Records: {bookings.length}
                    </p>
                </div>
                
                <div className="flex bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5">
                    {["All", "Active", "Pending", "Completed"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-orange-500 text-black' : 'text-white/40 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🚀 Records List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredBookings.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <FaCalendarAlt className="text-5xl text-white/10 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">No matching records in current sequence</p>
                    </div>
                ) : (
                    filteredBookings.map(b => (
                        <motion.div 
                            layout
                            key={b._id}
                            className="bg-[#1e293b] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl group hover:border-white/10 transition-all"
                        >
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left Section: Customer & Info */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-white/5 flex items-center justify-center text-white/40 text-xl">
                                                <FaUser />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase italic">{b.customerId?.name}</h3>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{b.serviceId?.title}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${getStatusStyle(b.status)}`}>
                                            {b.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                                            <FaMapMarkerAlt className="text-orange-500 text-xs" />
                                            <p className="text-[10px] font-black text-white/60 truncate uppercase">{b.serviceAddress}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                                            <FaRegClock className="text-orange-500 text-xs" />
                                            <p className="text-[10px] font-black text-white/60 uppercase">{b.date} @ {b.time}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Controls & Pricing */}
                                <div className="md:w-64 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between items-end gap-6 text-right">
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Contract_Value</p>
                                        <p className="text-2xl font-black text-white italic">₹{b.amount.toLocaleString()}</p>
                                    </div>

                                    <div className="w-full flex md:flex-col gap-2">
                                        {b.status === 'Pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(b._id, 'Confirmed')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black text-[9px] font-black uppercase py-2.5 rounded-xl transition-all">Accept</button>
                                                <button onClick={() => handleUpdateStatus(b._id, 'Cancelled')} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black uppercase py-2.5 rounded-xl transition-all">Reject</button>
                                            </>
                                        )}
                                        {['Confirmed', 'Arrived', 'WorkStarted', 'PaymentPending'].includes(b.status) && (
                                            <>
                                                 <button onClick={() => window.open(`tel:${b.customerId?.phone}`)} className="flex-1 bg-white text-black text-[9px] font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-2"><FaPhone size={10} /> Call</button>
                                                 <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.serviceAddress)}`)} className="flex-1 bg-white/5 text-white/60 text-[9px] font-black uppercase py-2.5 rounded-xl border border-white/5 flex items-center justify-center gap-2"><FaArrowRight className="rotate-[-45deg]" size={10} /> Maps</button>
                                            </>
                                        )}
                                        {b.status === 'Completed' && (
                                            <div className="flex-1 flex items-center justify-end gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                                <FaCheck /> Deployment_Closed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProviderBookings;
