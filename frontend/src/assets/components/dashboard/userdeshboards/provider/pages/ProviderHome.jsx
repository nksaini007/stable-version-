import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import API from "../../../../../api/api";
import { 
    FaBoxOpen, FaClipboardList, FaCheckCircle, FaSpinner, 
    FaBell, FaArrowRight, FaMapMarkerAlt, FaPhone, 
    FaExternalLinkAlt, FaTools, FaQrcode, FaSearch
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ProviderHome = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ active: 0, pending: 0, earnings: 0 });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const res = await API.get("/bookings/provider-bookings");
            const allBookings = res.data || [];
            setBookings(allBookings);

            // Calculate Stats
            const active = allBookings.filter(b => ["Confirmed", "Arrived", "WorkStarted", "PaymentPending"].includes(b.status)).length;
            const pending = allBookings.filter(b => b.status === "Pending").length;
            
            // Calculate Month's Earnings
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const earnings = allBookings
                .filter(b => b.status === "Completed")
                .filter(b => {
                    const d = new Date(b.updatedAt);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, curr) => acc + (curr.amount || 0), 0);

            setStats({ active, pending, earnings });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            toast.error("Failed to sync dashboard nodes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await API.put(`/bookings/${id}/status`, { status });
            toast.success(`Node_Status -> ${status.toUpperCase()}`);
            fetchDashboardData();
        } catch (err) {
            toast.error("Status Sync Failure");
        }
    };

    const getStatusStep = (status) => {
        const steps = ["Confirmed", "Arrived", "WorkStarted", "PaymentPending", "Completed"];
        return steps.indexOf(status);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <FaSpinner className="text-4xl text-orange-500 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Initialising_Dashboard_Stream...</span>
            </div>
        );
    }

    const pendingRequests = bookings.filter(b => b.status === "Pending");
    const ongoingJobs = bookings.filter(b => ["Confirmed", "Arrived", "WorkStarted", "PaymentPending"].includes(b.status));

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* 1. Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Hello, <span className="text-orange-500">{user?.name.split(' ')[0]}!</span></h1>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Status: Prime_Provider // Logged_In
                    </p>
                </div>
                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all relative">
                    <FaBell />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                </button>
            </div>

            {/* 2. Primary KPI Pulses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <FaClipboardList className="text-8xl transform rotate-12" />
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Active Bookings</p>
                    <h3 className="text-4xl font-black text-white">{stats.active}</h3>
                    <div className="mt-4 h-1 w-12 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Pending Requests</p>
                    <h3 className="text-4xl font-black text-orange-500">{stats.pending} <span className="text-xs font-bold text-white/20">(New)</span></h3>
                    <div className="mt-4 h-1 w-12 bg-orange-500 rounded-full"></div>
                </div>
                <div className="bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Month's Earnings</p>
                    <h3 className="text-4xl font-black text-white">₹{stats.earnings.toLocaleString()}</h3>
                    <div className="mt-4 h-1 w-12 bg-blue-500 rounded-full"></div>
                </div>
            </div>

            {/* 3. Incoming Requests Queue */}
            {pendingRequests.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                             Incoming Requests <span className="text-orange-500 font-mono">({pendingRequests.length})</span>
                        </h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
                        {pendingRequests.map((req) => (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={req._id} 
                                className="min-w-[300px] bg-[#1e293b] border border-white/10 p-5 rounded-[2rem] snap-center shadow-xl flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-black text-white truncate max-w-[150px]">{req.customerId?.name}</p>
                                        <p className="text-[9px] text-white/40 font-bold uppercase">{req.serviceId?.title}</p>
                                    </div>
                                    <div className="bg-orange-500/10 text-orange-500 text-[8px] font-black px-2 py-1 rounded-full border border-orange-500/20 uppercase">
                                        Requested
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-[10px] text-white/60">
                                    <div className="flex items-center gap-1.5">
                                       <FaMapMarkerAlt className="text-orange-500" />
                                       <span className="truncate max-w-[100px]">{req.serviceAddress || "N/A"}</span>
                                    </div>
                                    <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                    <div>{req.date} @ {req.time}</div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleUpdateStatus(req._id, 'Confirmed')}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/10"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(req._id, 'Cancelled')}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white/40 text-[10px] font-black uppercase py-3 rounded-2xl border border-white/5 transition-all"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* 4. Booking Management & Progress Tracking */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">
                         Booking Management & Progress Tracking
                    </h2>
                    
                    {ongoingJobs.length === 0 ? (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center">
                             <FaClipboardList className="text-4xl text-white/10 mb-4" />
                             <p className="text-[11px] font-black text-white/20 uppercase tracking-widest">No active deployments found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {ongoingJobs.map((job) => {
                                const activeStep = getStatusStep(job.status);
                                const steps = ["Confirmed", "Arrived", "Work Started", "Payment", "Done"];

                                return (
                                    <div key={job._id} className="bg-[#1e293b] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative group">
                                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                             <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-xl">
                                                     <FaTools />
                                                 </div>
                                                 <div>
                                                     <h4 className="text-sm font-black text-white">{job.serviceId?.title}</h4>
                                                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{job.status}</p>
                                                 </div>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <button className="h-10 px-4 rounded-xl bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase flex items-center gap-2 border border-orange-500/10" onClick={() => window.open(`tel:${job.contactPhone}`)}>
                                                     <FaPhone /> Call
                                                 </button>
                                                 <button className="h-10 px-4 rounded-xl bg-white/5 text-white/60 text-[10px] font-black uppercase flex items-center gap-2 border border-white/5" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.serviceAddress)}`)}>
                                                     <FaArrowRight className="rotate-[-45deg]" /> Navigate
                                                 </button>
                                             </div>
                                         </div>

                                         {/* Progress Timeline */}
                                         <div className="relative pt-2 pb-6 px-2">
                                             <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2"></div>
                                             <div className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 transition-all duration-1000 -translate-y-1/2" style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}></div>
                                             
                                             <div className="relative flex justify-between">
                                                 {steps.map((step, idx) => (
                                                     <div key={step} className="flex flex-col items-center gap-3">
                                                         <div className={`w-3 h-3 rounded-full border-2 z-10 transition-all duration-500 ${idx <= activeStep ? 'bg-emerald-500 border-emerald-500 scale-125' : 'bg-[#1e293b] border-white/10'}`}></div>
                                                         <span className={`text-[8px] font-black uppercase tracking-tighter ${idx <= activeStep ? 'text-white' : 'text-white/20'}`}>{step}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>

                                         <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                                             {job.status === 'Confirmed' && (
                                                 <button onClick={() => handleUpdateStatus(job._id, 'Arrived')} className="flex-1 bg-white text-black text-[9px] font-black uppercase py-2.5 rounded-xl">I Have Arrived</button>
                                             )}
                                             {job.status === 'Arrived' && (
                                                 <button onClick={() => handleUpdateStatus(job._id, 'WorkStarted')} className="flex-1 bg-white text-black text-[9px] font-black uppercase py-2.5 rounded-xl">Start Work Now</button>
                                             )}
                                             {job.status === 'WorkStarted' && (
                                                 <button onClick={() => handleUpdateStatus(job._id, 'PaymentPending')} className="flex-1 bg-white text-black text-[9px] font-black uppercase py-2.5 rounded-xl">Job Finished (Request Payment)</button>
                                             )}
                                             {job.status === 'PaymentPending' && (
                                                 <button onClick={() => handleUpdateStatus(job._id, 'Completed')} className="flex-1 bg-emerald-500 text-black text-[9px] font-black uppercase py-2.5 rounded-xl">Mark Completely Done</button>
                                             )}
                                         </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {/* Share My Service Profile */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                         <div className="flex justify-between items-center">
                             <h3 className="text-sm font-black text-white uppercase tracking-widest">Share My Profile</h3>
                             <button className="text-[9px] font-black text-white/30 hover:text-white uppercase"><FaExternalLinkAlt /></button>
                         </div>
                         <div className="flex flex-col items-center gap-6">
                             <div className="bg-white p-4 rounded-3xl shadow-2xl relative group">
                                 <QRCodeSVG 
                                    value={`${window.location.origin}/service-profile/${user?._id}`} 
                                    size={140}
                                    fgColor="#0f172a"
                                 />
                                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/90 transition-opacity cursor-pointer">
                                     <FaSearch className="text-orange-500" />
                                 </div>
                             </div>
                             <div className="text-center">
                                 <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">System_URL_Node</p>
                                 <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/service-profile/${user?._id}`); toast.success("Link_Copied") }} className="text-[11px] font-black text-white truncate max-w-[200px] hover:text-orange-500 transition-colors">
                                     {window.location.origin.slice(8)}/.../{user?._id.slice(-6)}
                                 </button>
                             </div>
                         </div>
                    </div>

                    {/* Manage My Services */}
                    <Link to="/provider/services" className="block bg-orange-500 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-500/20 group hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl">
                                <FaTools />
                            </div>
                            <FaArrowRight className="text-white/40 group-hover:text-white rotate-[-45deg] transition-all" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-2">Manage My<br/>Services</h3>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Add or Remove from Stinchar Catalog</p>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default ProviderHome;
