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
            alert("Please login to book a service");
            navigate("/login");
            return;
        }

        try {
            await API.post("/bookings", {
                serviceId: bookingService._id,
                date: bookingDate,
                time: bookingTime
            });
            alert("Booking successful!");
            setBookingService(null);
            setBookingDate("");
            setBookingTime("");
            fetchMyBookings(); // Refresh the list
        } catch (err) {
            console.error(err);
            alert("Failed to create booking");
        }
    };

    const categories = ["All", "Cleaning", "Plumbing", "Electrical", "Carpentry", "Painting", "Appliance Repair"];

    return (<>
     <Nev/>
        <div className="bg-[#F8FAFC] min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Header & Search */}
                <div className="text-center space-y-8 relative">
                    <div className="flex justify-center mb-6">
                        <Link to={`/services/${categoryId}`} className="group flex items-center gap-2 text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase hover:text-orange-600 transition-colors">
                            <FaChevronLeft size={8} className="group-hover:-translate-x-1 transition-transform" /> Back to Specialties
                        </Link>
                    </div>
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-[900] text-slate-900 tracking-tight leading-tight"
                    >
                        {categoryName || "Premium"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Service Suite</span>
                    </motion.h1>
                    <p className="text-slate-500 text-xl font-light max-w-2xl mx-auto leading-relaxed">Secure elite professionals for your {categoryName?.toLowerCase() || 'specialized'} needs with deterministic booking.</p>

                    <div className="max-w-2xl mx-auto relative mt-12 group">
                        <input
                            type="text"
                            placeholder="Find specific professional services..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-20 py-6 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] focus:shadow-[0_40px_100px_rgba(0,0,0,0.08)] focus:ring-8 focus:ring-orange-50 outline-none text-xl transition-all border-none text-slate-700 placeholder:text-slate-300"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-orange-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-orange-200 hover:bg-orange-700 hover:scale-105 transition-all">
                            <FaSearch size={20} />
                        </button>
                    </div>
                </div>

                {/* My Bookings Section - Refined UI */}
                {user && user.role === "customer" && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Active Appointments</h2>
                        </div>
                        
                        {fetchingBookings ? (
                            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="min-w-[320px] h-32 bg-white rounded-[2.5rem] shadow-sm animate-pulse" />
                                ))}
                            </div>
                        ) : myBookings.length === 0 ? (
                            <div className="bg-white p-10 rounded-[3rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] text-center border-none">
                                <p className="text-slate-400 text-lg font-light italic">No pending appointments yet. Explore our network below.</p>
                            </div>
                        ) : (
                            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
                                {myBookings.map(b => (
                                    <motion.div 
                                        key={b._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="min-w-[340px] bg-white p-6 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all snap-start flex flex-col justify-between"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-900 text-base truncate mb-1">{b.serviceId?.title || "Specialized Service"}</h4>
                                                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg"><FaCalendarAlt size={10} /> {b.date}</span>
                                                    <span className="bg-slate-50 px-3 py-1 rounded-lg">{b.time}</span>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider
                                                ${b.status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
                                                ${b.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-600' : ''}
                                                ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : ''}
                                                ${b.status === 'Cancelled' ? 'bg-slate-50 text-slate-400' : ''}
                                            `}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                                            <span className="text-slate-300 font-mono text-[10px]">#BK-{b._id.slice(-6).toUpperCase()}</span>
                                            <span className="text-slate-900 font-black text-lg">₹{b.amount}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* Results Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px]">Syncing Network...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[4rem] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border-none">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                            <FaStore className="text-4xl text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800">No Professionals Found</h3>
                        <p className="mt-4 text-slate-400 text-lg font-light">Your specific requirement is currently being matched with our off-market experts.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {services.map(svc => (
                            <motion.div 
                                key={svc._id} 
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-[3rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 group flex flex-col"
                            >
                                <div className="h-64 bg-slate-50 relative overflow-hidden m-3 rounded-[2.5rem]">
                                    {svc.images?.length > 0 ? (
                                        <img src={`${svc.images[0]}`} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200 uppercase font-black tracking-widest text-xs">No Visual Data</div>
                                    )}
                                    <div className="absolute top-5 left-5 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-white shadow-xl uppercase tracking-widest">
                                        {svc.category}
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="font-black text-slate-800 text-2xl leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tight">{svc.title}</h3>
                                    </div>

                                    <p className="text-slate-400 text-sm font-light leading-relaxed mb-8 flex-1 italic truncate-3-lines">{svc.description}</p>
                                           
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="text-2xl font-black text-slate-900">₹{svc.price}</div>
                                        <button 
                                            onClick={() => setBookingService(svc)} 
                                            className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.1em] shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
                                        >
                                            Secure Slot
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Booking Modal Redesign */}
                {bookingService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)]"
                        >
                            <div className="p-10 relative">
                                <button onClick={() => setBookingService(null)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><FaTimes /></button>
                                
                                <div className="mb-10">
                                    <div className="w-16 h-1 w-1 bg-orange-600 rounded-full mb-6"></div>
                                    <h3 className="font-[900] text-3xl text-slate-900 leading-none">Schedule Service</h3>
                                    <p className="text-slate-400 font-light mt-3 uppercase tracking-[0.2em] text-[10px]">Professional Authorization Token Required</p>
                                </div>

                                <div className="flex gap-6 mb-10 p-5 bg-slate-50 rounded-[2.5rem]">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-white overflow-hidden shadow-sm flex-shrink-0">
                                        {bookingService.images?.length > 0 ? (
                                            <img src={`${bookingService.images[0]}`} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 p-6 flex items-center justify-center text-slate-200"><FaStore /></div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="font-black text-slate-800 leading-tight uppercase tracking-tight">{bookingService.title}</h4>
                                        <p className="text-xl font-black text-orange-600 mt-1">₹{bookingService.price}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleBook} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Target Date</label>
                                            <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                                                className="w-full bg-slate-50 px-6 py-5 rounded-[1.8rem] focus:ring-4 focus:ring-orange-50 outline-none transition-all font-bold text-slate-700 border-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Target Time</label>
                                            <input type="time" required value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                                                className="w-full bg-slate-50 px-6 py-5 rounded-[1.8rem] focus:ring-4 focus:ring-orange-50 outline-none transition-all font-bold text-slate-700 border-none" />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full mt-6 bg-slate-900 text-white py-6 rounded-[1.8rem] font-[900] text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-orange-600 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                                        Authorize Appointment
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

export default ServiceSearch;
