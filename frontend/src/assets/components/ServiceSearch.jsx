import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { FaSearch, FaStar, FaStore, FaCalendarAlt, FaTimes, FaClipboardList } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import Nev from "./Nev";
import { FaChevronLeft } from "react-icons/fa";

const ServiceSearch = () => {
    const { categoryId, subCategoryId } = useParams();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryName, setCategoryName] = useState("");

    // Booking Modal State
    const [bookingService, setBookingService] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [bookingQuantity, setBookingQuantity] = useState(1);
    const [bookingRequirements, setBookingRequirements] = useState("");
    const [isFlexible, setIsFlexible] = useState(false);
    const [bookingAddress, setBookingAddress] = useState(user?.address || "");
    const [bookingPhone, setBookingPhone] = useState(user?.phone || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // My Bookings State
    const [myBookings, setMyBookings] = useState([]);
    const [fetchingBookings, setFetchingBookings] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchServices = async () => {
        try {
            setLoading(true);
            let queryParams = [];
            if (search) queryParams.push(`search=${search}`);
            if (categoryId) queryParams.push(`serviceCategoryId=${categoryId}`);
            if (subCategoryId) queryParams.push(`serviceSubCategoryId=${subCategoryId}`);
            
            const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
            const res = await API.get(`/services${queryString}`);
            setServices(res.data);
            
            if (res.data.length > 0 && res.data[0].category) {
                setCategoryName(res.data[0].category);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        if (!user || user.role !== "customer") return;
        try {
            setFetchingBookings(true);
            const res = await API.get("/bookings/my-bookings");
            setMyBookings(res.data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setFetchingBookings(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, [user]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchServices();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, categoryId, subCategoryId]);

    const handleBook = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Security Breach: Unauthorized. Please login to initiate protocol.");
            navigate("/login");
            return;
        }

        try {
            setIsSubmitting(true);
            await API.post("/bookings", {
                serviceId: bookingService._id,
                date: isFlexible ? "Flexible" : bookingDate,
                time: isFlexible ? "Flexible" : bookingTime,
                requirements: bookingRequirements,
                quantity: bookingQuantity,
                isFlexibleDate: isFlexible,
                serviceAddress: bookingAddress,
                contactPhone: bookingPhone
            });
            alert("Service Protocol Initialized Successfully");
            setBookingService(null);
            setBookingDate("");
            setBookingTime("");
            setBookingRequirements("");
            setBookingQuantity(1);
            setIsFlexible(false);
            fetchMyBookings(); // Refresh the list
        } catch (err) {
            console.error(err);
            alert("Critical Failure: Data transmission interrupted.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = ["All", "Cleaning", "Plumbing", "Electrical", "Carpentry", "Painting", "Appliance Repair"];

    return (<>
     <Nev/>
        <div className="bg-[#FCFCFC] min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header & Search */}
                <div className="border-l-4 border-slate-900 pl-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Link to={`/services/${categoryId}`} className="group flex items-center gap-2 text-slate-400 font-bold text-[10px] tracking-widest uppercase hover:text-slate-900 transition-colors">
                            <FaChevronLeft size={8} className="group-hover:-translate-x-1 transition-transform" /> Directory
                        </Link>
                    </div>
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-3xl font-bold text-slate-900 tracking-tight"
                    >
                        {categoryName || "Professional"} Service Suite
                    </motion.h1>
                    <p className="text-slate-500 text-sm max-w-xl font-medium">Verify credentials and secure expert personnel for deterministic service delivery.</p>

                    <div className="max-w-md relative mt-6 group">
                        <input
                            type="text"
                            placeholder="Search active directory..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-6 pr-14 py-4 rounded-none bg-white border border-slate-200 outline-none text-sm transition-all focus:border-slate-900"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
                            <FaSearch size={14} />
                        </button>
                    </div>
                </div>

                {/* My Bookings Section - Compact UI */}
                {user && user.role === "customer" && (
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Operations</h2>
                            <Link to="/dashboard/customer/services" className="text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:underline decoration-2">Management Panel &rarr;</Link>
                        </div>
                        
                        {fetchingBookings ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="min-w-[280px] h-24 bg-white border border-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : myBookings.length === 0 ? (
                            <div className="bg-white p-6 border border-slate-50 text-center">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Inventory empty</p>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {myBookings.map(b => (
                                    <motion.div 
                                        key={b._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="min-w-[300px] bg-white p-5 border border-slate-100 transition-all snap-start flex flex-col justify-between"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 text-xs truncate mb-1 uppercase tracking-tight">{b.serviceId?.title || "Professional Service"}</h4>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                                    <FaCalendarAlt size={8} /> {b.date === 'Flexible' ? 'Timeline Flexible' : `${b.date} • ${b.time}`}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter border
                                                ${b.status === 'Pending' ? 'bg-slate-50 text-slate-600 border-slate-200' : ''}
                                                ${b.status === 'Confirmed' ? 'bg-slate-900 text-white border-slate-900' : ''}
                                                ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                                                ${b.status === 'Cancelled' ? 'bg-slate-50 text-slate-300 border-slate-100' : ''}
                                            `}>
                                                {b.status === 'Pending' ? 'Protocol Initiated' : b.status}
                                            </span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                            <span className="text-slate-300 font-mono text-[9px]">ID: {b._id.slice(-6).toUpperCase()}</span>
                                            <span className="text-slate-900 font-bold text-sm">₹{b.amount}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* Results Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-6 h-6 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold tracking-widest uppercase text-[8px]">Processing query...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching personnel found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map(svc => (
                            <motion.div 
                                key={svc._id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white border border-slate-100 hover:border-slate-300 transition-all duration-300 group flex flex-col"
                            >
                                <Link to={`/service/${svc._id}`} className="block flex-1 flex flex-col">
                                    <div className="h-44 bg-slate-50 relative overflow-hidden">
                                        {svc.images?.length > 0 ? (
                                            <img src={`${svc.images[0]}`} alt={svc.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200 uppercase font-black tracking-widest text-[10px]">No Visual</div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 text-[8px] font-bold text-white uppercase tracking-widest">
                                            {svc.category}
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-tight group-hover:text-slate-900 transition-colors line-clamp-1">{svc.title}</h3>
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 flex-1 line-clamp-2">{svc.description}</p>
                                    </div>
                                </Link>
                                <div className="px-5 pb-5 pt-0">
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="text-sm font-bold text-slate-900">₹{svc.price}</div>
                                        <button 
                                            onClick={() => setBookingService(svc)} 
                                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                        >
                                            Book Item
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Booking Modal Redesign */}
                {bookingService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-slate-200 w-full max-w-lg my-8 shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 relative">
                                <button onClick={() => setBookingService(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors z-10"><FaTimes /></button>
                                
                                <div className="mb-8">
                                    <h3 className="font-bold text-2xl text-slate-900 uppercase tracking-tight">Service Protocol Initialization</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personnel Assignment Authorization Required</p>
                                </div>

                                <div className="flex gap-6 mb-8 p-5 bg-slate-50 border border-slate-100">
                                    <div className="w-20 h-20 bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                                        {bookingService.images?.length > 0 ? (
                                            <img src={`${bookingService.images[0]}`} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 p-4 flex items-center justify-center text-slate-200"><FaStore /></div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight mb-1">{bookingService.title}</h4>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-slate-900">₹{bookingService.price * bookingQuantity}</span>
                                            {bookingQuantity > 1 && <span className="text-[10px] text-slate-400 font-bold truncate">(₹{bookingService.price} x {bookingQuantity})</span>}
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleBook} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="col-span-1 space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] pl-1">Quantity</label>
                                                <input type="number" min="1" required value={bookingQuantity} onChange={e => setBookingQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-full bg-white border border-slate-200 px-4 py-3 outline-none transition-all font-bold text-xs text-slate-700 focus:border-slate-900" />
                                            </div>
                                            <div className="col-span-2 space-y-1.5 flex flex-col justify-end">
                                               <label className="flex items-center gap-3 cursor-pointer group mb-2">
                                                    <input type="checkbox" checked={isFlexible} onChange={e => setIsFlexible(e.target.checked)} className="accent-slate-900 w-4 h-4 cursor-pointer" />
                                                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest group-hover:text-slate-900 transition-colors">My timeline is flexible</span>
                                               </label>
                                            </div>
                                        </div>

                                        {!isFlexible && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] pl-1">Target Date</label>
                                                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                                                        className="w-full bg-white border border-slate-200 px-4 py-3 outline-none transition-all font-bold text-xs text-slate-700 focus:border-slate-900" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] pl-1">Target Time</label>
                                                    <input type="time" required value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                                                        className="w-full bg-white border border-slate-200 px-4 py-3 outline-none transition-all font-bold text-xs text-slate-700 focus:border-slate-900" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-1.5 text-right">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] pr-1">Detailed Requirements</label>
                                            <textarea 
                                                rows="3" 
                                                placeholder="Describe specific project parameters or special instructions..."
                                                value={bookingRequirements}
                                                onChange={e => setBookingRequirements(e.target.value)}
                                                className="w-full bg-white border border-slate-200 p-4 outline-none transition-all font-medium text-xs text-slate-700 focus:border-slate-900 resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] pl-1">Contact Phone</label>
                                                <input type="tel" required value={bookingPhone} onChange={e => setBookingPhone(e.target.value)} placeholder="Personnel Direct Contact"
                                                    className="w-full bg-white border border-slate-200 px-4 py-3 outline-none transition-all font-bold text-xs text-slate-700 focus:border-slate-900" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] pl-1">Service Address</label>
                                                <input type="text" required value={bookingAddress} onChange={e => setBookingAddress(e.target.value)} placeholder="Deployment Location"
                                                    className="w-full bg-white border border-slate-200 px-4 py-3 outline-none transition-all font-bold text-xs text-slate-700 focus:border-slate-900" />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-slate-900 text-white py-5 font-bold text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                                        ) : "Confirm Protocol Security"}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

            </div>
        </div>
        </>
    );
};

            </div>
        </div>
        </>
    );
};

export default ServiceSearch;
