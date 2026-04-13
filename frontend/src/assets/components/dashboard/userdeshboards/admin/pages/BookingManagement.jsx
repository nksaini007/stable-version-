import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { 
    FaTrash, FaCalendarAlt, FaStore, FaUser, FaClipboardCheck, 
    FaPhone, FaMapMarkerAlt, FaEnvelope, FaInfoCircle, FaFilePdf, 
    FaUserShield, FaClock, FaCheckCircle, FaTimesCircle, FaChevronRight 
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bRes, pRes] = await Promise.all([
                API.get("/bookings"),
                API.get("/users/providers")
            ]);
            setBookings(bRes.data);
            setProviders(pRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/bookings/${id}/status`, { status });
            toast.success(`Protocol updated to ${status}`);
            fetchData();
            if (selectedBooking?._id === id) {
                setSelectedBooking(prev => ({ ...prev, status }));
            }
        } catch (err) {
            toast.error("Operation failed: status rejection.");
        }
    };

    const assignProvider = async (id, providerId) => {
        try {
            await API.put(`/bookings/${id}/status`, { providerId });
            toast.success(`Personnel deployment confirmed`);
            fetchData();
            if (selectedBooking?._id === id) {
                const p = providers.find(prov => prov._id === providerId);
                setSelectedBooking(prev => ({ ...prev, providerId: p }));
            }
        } catch (err) {
            toast.error("Assignment failure: expert mismatch or system error.");
        }
    };

    const deleteBooking = async (id) => {
        if (!window.confirm("Archive this protocol? This action is permanent.")) return;
        try {
            await API.delete(`/bookings/${id}`);
            toast.success("Protocol archived successfully");
            fetchData();
            setSelectedBooking(null);
        } catch (err) {
            toast.error("Archive failure: operational lock active.");
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "Pending": return { text: "Protocol Initiated", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: <FaClock className="size-3" /> };
            case "Confirmed": return { text: "Personnel Assigned", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: <FaCheckCircle className="size-3" /> };
            case "Completed": return { text: "Mission Success", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: <FaCheckCircle className="size-3" /> };
            case "Cancelled": return { text: "Protocol Aborted", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: <FaTimesCircle className="size-3" /> };
            default: return { text: status, color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: null };
        }
    };

    const OperationalProtocolModal = ({ booking, onClose }) => {
        if (!booking) return null;
        const statusObj = getStatusLabel(booking.status);

        return (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-[#1A1B1E] border border-[#2A2B2F] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl shadow-black/50"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-[#1A1B1E] border-b border-[#2A2B2F] px-8 py-6 flex items-center justify-between z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest border rounded {statusObj.color}`}>
                                    {statusObj.icon} {statusObj.text}
                                </span>
                                <span className="text-[10px] font-mono text-[#8E929C] uppercase">REQ_ID: {booking._id.toUpperCase()}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Service Operational Protocol</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-[#2A2B2F] text-[#8E929C] hover:text-white rounded-2xl transition-all">
                            <FaTimesCircle size={20} />
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
                        {/* Technical Data Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-[10px] font-bold text-[#8E929C] uppercase tracking-[0.3em] mb-4 border-l-2 border-orange-500 pl-3">Deployment Target</h3>
                                        <div className="bg-black/20 p-6 rounded-2xl border border-[#2A2B2F] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#2A2B2F] rounded-xl flex items-center justify-center text-blue-400"><FaPhone /></div>
                                                <div>
                                                    <p className="text-[9px] text-[#8E929C] font-bold uppercase">Deployment Contact</p>
                                                    <p className="font-bold text-white">{booking.contactPhone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-[#2A2B2F] rounded-xl flex items-center justify-center text-emerald-400"><FaMapMarkerAlt /></div>
                                                <div>
                                                    <p className="text-[9px] text-[#8E929C] font-bold uppercase">Target Location</p>
                                                    <p className="font-bold text-white leading-tight">{booking.serviceAddress}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold text-[#8E929C] uppercase tracking-[0.3em] mb-4 border-l-2 border-blue-500 pl-3">Identity Profile</h3>
                                        <div className="bg-black/20 p-6 rounded-2xl border border-[#2A2B2F] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#2A2B2F] rounded-xl flex items-center justify-center text-gray-400"><FaEnvelope /></div>
                                                <div>
                                                    <p className="text-[9px] text-[#8E929C] font-bold uppercase">Account Email</p>
                                                    <p className="font-bold text-white break-all">{booking.customerId?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#2A2B2F] rounded-xl flex items-center justify-center text-gray-400"><FaUserShield /></div>
                                                <div>
                                                    <p className="text-[9px] text-[#8E929C] font-bold uppercase">Master Profile Phone</p>
                                                    <p className="font-bold text-white">{booking.customerId?.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-bold text-[#8E929C] uppercase tracking-[0.3em] mb-4 border-l-2 border-orange-500 pl-3">Parametric Requirements</h3>
                                <div className="bg-black/20 p-6 rounded-2xl border border-[#2A2B2F] space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-[#2A2B2F]">
                                        <div>
                                            <p className="text-[9px] text-[#8E929C] font-bold uppercase">Quantity Unit</p>
                                            <p className="text-lg font-black text-white">{booking.quantity} Unit(s)</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-[#8E929C] font-bold uppercase">Financial Vector</p>
                                            <p className="text-lg font-black text-orange-500">₹{booking.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#8E929C] font-bold uppercase mb-2">Technical Description & Needs</p>
                                        <div className="p-4 bg-[#1A1B1E] rounded-xl border border-[#2A2B2F] text-xs leading-relaxed text-[#8E929C] italic">
                                            "{booking.requirements || "No supplemental parameters provided. Standard deployment protocols apply."}"
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Logistics & Controls Section */}
                        <div className="space-y-6">
                            <div className="p-6 bg-black/40 rounded-3xl border border-[#2A2B2F] space-y-6">
                                <div>
                                    <h4 className="text-[9px] font-black text-[#8E929C] uppercase tracking-widest mb-3">Schedule Information</h4>
                                    <div className="flex flex-col gap-2 p-4 bg-[#2A2B2F] rounded-2xl">
                                        <div className="flex items-center gap-2 text-white font-bold">
                                            <FaCalendarAlt className="text-orange-500 size-3" />
                                            {booking.date === 'Flexible' ? 'Timeline Flexible' : booking.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-[#8E929C] font-medium text-xs">
                                            <FaClock className="size-3" />
                                            {booking.time === 'Flexible' ? 'Arrival Window TBD' : booking.time}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[9px] font-black text-[#8E929C] uppercase tracking-widest mb-3">Expert Allocation</h4>
                                    <select
                                        onChange={(e) => assignProvider(booking._id, e.target.value)}
                                        value={booking.providerId?._id || ""}
                                        className="w-full bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-orange-500"
                                    >
                                        <option value="" disabled>Search & Assign Personnel</option>
                                        {providers.filter(p => p.offeredServices?.some(id => id === booking.serviceId?._id)).map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-[#2A2B2F]">
                                    <h4 className="text-[9px] font-black text-[#8E929C] uppercase tracking-widest mb-1">Status Command</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                                            <button 
                                                key={s} onClick={() => updateStatus(booking._id, s)}
                                                className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${booking.status === s ? 'bg-white text-black border-white' : 'bg-transparent text-[#8E929C] border-[#2A2B2F] hover:border-[#8E929C]'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => deleteBooking(booking._id)} className="w-full py-4 text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 rounded-3xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                <FaTrash /> Archive Protocol
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-8 h-8 border-2 border-[#2A2B2F] border-t-white rounded-full animate-spin"></div>
            <p className="text-[#8E929C] font-bold tracking-[0.3em] uppercase text-[10px]">Retrieving Secure Feed...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span> Live Operations Center
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">Service Protocols</h1>
                    <p className="text-sm text-[#8E929C] mt-2 font-medium max-w-lg">Advanced personnel deployment tracking and logistical command panel for active service requests.</p>
                </div>
                <div className="bg-[#1A1B1E] border border-[#2A2B2F] p-4 rounded-3xl flex items-center gap-6 shadow-xl shadow-black/20">
                    <div className="text-center px-4 border-r border-[#2A2B2F]">
                        <p className="text-[10px] font-bold text-[#8E929C] uppercase tracking-widest mb-0.5">Active</p>
                        <p className="text-2xl font-black text-white leading-none">{bookings.filter(b => b.status === "Pending").length}</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-[10px] font-bold text-[#8E929C] uppercase tracking-widest mb-0.5">Total</p>
                        <p className="text-2xl font-black text-white leading-none">{bookings.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {bookings.length === 0 ? (
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] border-dashed p-32 text-center rounded-3xl">
                        <h2 className="text-lg font-bold text-[#8E929C] uppercase tracking-widest">No Operational Requests Detected</h2>
                    </div>
                ) : (
                    bookings.map(b => {
                        const statusObj = getStatusLabel(b.status);
                        return (
                            <motion.div 
                                key={b._id} 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-3xl overflow-hidden hover:border-[#8E929C] transition-all group cursor-pointer"
                                onClick={() => setSelectedBooking(b)}
                            >
                                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#2A2B2F]">
                                    <div className="p-6 lg:w-1/4 bg-black/20 space-y-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest border rounded ${statusObj.color}`}>
                                            {statusObj.icon} {statusObj.text}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white truncate">{b.serviceId?.title}</h4>
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{b.serviceId?.category}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-2">Subject Persona</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-[#2A2B2F] flex items-center justify-center text-white font-bold text-xs">{b.customerId?.name?.charAt(0)}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-white line-clamp-1">{b.customerId?.name}</p>
                                                    <p className="text-[9px] text-[#8E929C] truncate max-w-[120px]">{b.customerId?.email}</p>
                                                    <p className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter mt-1">LOGISTICS: {b.contactPhone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-2">Technical Parameters</p>
                                            <p className="text-xs font-bold text-white">Qty: {b.quantity} Unit(s)</p>
                                            <p className="text-[10px] text-orange-500 font-black">Fee: ₹{b.amount.toLocaleString()}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-2">Deployment Schedule</p>
                                            <p className="text-xs font-bold text-white flex items-center gap-2 italic">
                                                <FaCalendarAlt className="size-3 text-[#6B7280]" />
                                                {b.date === 'Flexible' ? 'Flexible' : b.date}
                                            </p>
                                            <p className="text-[10px] text-[#8E929C] font-medium">{b.time === 'Flexible' ? 'TBD' : b.time}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-2">Assigned Expert</p>
                                            {b.providerId ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                    <p className="text-xs font-bold text-white line-clamp-1">{b.providerId.name}</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs font-black text-amber-500 uppercase italic">Unallocated</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-black/40 lg:w-16 flex items-center justify-center group-hover:bg-orange-500 transition-all duration-500 text-[#2A2B2F] group-hover:text-white">
                                        <FaChevronRight className="transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <AnimatePresence>
                {selectedBooking && (
                    <OperationalProtocolModal 
                        booking={selectedBooking} 
                        onClose={() => setSelectedBooking(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingManagement;
