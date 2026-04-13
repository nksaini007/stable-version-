import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import API from "../../../../../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaShieldAlt, FaPhone, FaMapMarkerAlt, FaChevronRight, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Nev from "../../../../Nev";

const CustomerServices = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await API.get("/bookings/my-bookings");
            setBookings(res.data);
        } catch (err) {
            console.error("Critical Failure: Data retrieval interrupted.", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusLabel = (status) => {
        switch (status) {
            case "Pending": return { text: "Protocol Initiated", color: "bg-slate-100 text-slate-600 border-slate-200", icon: <FaClock className="animate-pulse" /> };
            case "Confirmed": return { text: "Personnel Assigned", color: "bg-slate-900 text-white border-slate-900", icon: <FaCheckCircle /> };
            case "Completed": return { text: "Deployment Successful", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <FaCheckCircle /> };
            case "Cancelled": return { text: "Operation Aborted", color: "bg-red-50 text-red-700 border-red-100", icon: <FaExclamationTriangle /> };
            default: return { text: status, color: "bg-gray-100 text-gray-600 border-gray-200", icon: null };
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-12">
            <Nev />
            <div className="pt-24 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-l-4 border-slate-900 pl-6">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Operational Inventory</h1>
                    <p className="text-slate-500 text-sm max-w-xl font-medium mt-1">Personnel deployment tracking and service lifecycle management panel.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-8 h-8 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px]">Retrieving secure data...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white border border-slate-100 p-20 text-center flex flex-col items-center">
                        <div className="text-slate-200 mb-6"><FaShieldAlt size={48} /></div>
                        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No Active Protocols Detected</h2>
                        <button onClick={() => window.location.href='/services'} className="mt-8 px-10 py-4 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all">Initialize First Request</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((booking) => {
                            const statusObj = getStatusLabel(booking.status);
                            return (
                                <motion.div 
                                    key={booking._id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-500 group"
                                >
                                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                        {/* Meta Section */}
                                        <div className="p-8 md:w-1/4 bg-slate-50/30 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${statusObj.color}`}>
                                                        {statusObj.icon} {statusObj.text}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-mono text-slate-300 uppercase tracking-tighter mb-1">REQ_ID: {booking._id.toUpperCase()}</div>
                                                <div className="text-2xl font-bold text-slate-900 tracking-tight">₹{booking.amount}</div>
                                            </div>
                                            
                                            <div className="mt-8 pt-6 border-t border-slate-100">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                                                        {booking.serviceId?.images?.[0] ? (
                                                            <img src={booking.serviceId.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : <FaShieldAlt />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-bold text-slate-900 uppercase truncate max-w-[120px]">{booking.serviceId?.title}</h4>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{booking.serviceId?.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Deployment Window</h3>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900"><FaCalendarAlt size={14} /></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{booking.date === 'Flexible' ? 'Protocol Timeline Flexible' : booking.date}</p>
                                                            <p className="text-xs text-slate-400 font-medium">{booking.time === 'Flexible' ? 'Time TBD' : booking.time}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Target Location</h3>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900"><FaMapMarkerAlt size={14} /></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{booking.serviceAddress || user?.address}</p>
                                                            <p className="text-xs text-slate-400 font-medium">{booking.contactPhone || user?.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6 lg:col-span-2">
                                                <div className="h-full bg-slate-50/50 p-6 border border-slate-100 border-dashed relative">
                                                    <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Technical Requirements & Parameters
                                                    </h3>
                                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                                        <div className="col-span-1 border-r border-slate-100">
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Quantity</p>
                                                            <p className="text-sm font-bold text-slate-900">{booking.quantity || 1}</p>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Status Protocol</p>
                                                            <p className="text-sm font-bold text-slate-900">{statusObj.text}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                                                        "{booking.requirements || 'No specific supplementary parameters provided for this operational request.'}"
                                                    </p>
                                                    
                                                    {booking.providerId && (
                                                        <div className="mt-6 flex items-center justify-between bg-white p-3 border border-slate-100 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]"> {booking.providerId.name?.charAt(0)}</div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-900 uppercase">Expert: {booking.providerId.name}</p>
                                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Personnel Confirmed</p>
                                                                </div>
                                                            </div>
                                                            <a href={`tel:${booking.providerId.phone}`} className="text-[10px] font-black underline text-slate-900 uppercase tracking-widest">Connect</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="md:w-16 bg-[#1A1A1A] flex md:flex-col items-center justify-center p-4 group-hover:bg-[#ff5c00] transition-colors duration-500">
                                            <FaChevronRight className="text-white transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerServices;
