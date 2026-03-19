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
        <div className="bg-slate-50 min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
           
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Search */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center mb-4">
                        <Link to={`/services/${categoryId}`} className="text-orange-600 font-bold flex items-center gap-2 text-sm hover:-translate-x-1 transition">
                            <FaChevronLeft size={10} /> BACK TO SUB-CATEGORIES
                        </Link>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                        {categoryName || "Expert"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Services</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">Book expert professionals for your {categoryName?.toLowerCase() || 'home'} requirements instantly.</p>

                    <div className="max-w-xl mx-auto relative mt-8">
                        <input
                            type="text"
                            placeholder="Search for services..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-6 pr-14 py-4 rounded-full border-2 border-gray-100 shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none text-lg transition"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition">
                            <FaSearch />
                        </button>
                    </div>
                </div>

                {/* My Bookings Section - Compact UI */}
                {user && user.role === "customer" && (
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <FaClipboardList className="text-orange-500" />
                            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">My Recent Bookings</h2>
                        </div>
                        
                        {fetchingBookings ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {[1, 2].map(i => (
                                    <div key={i} className="min-w-[280px] h-24 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : myBookings.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                                <p className="text-sm text-gray-400 font-medium">No active bookings. Start exploring below!</p>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {myBookings.map(b => (
                                    <motion.div 
                                        key={b._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="min-w-[300px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all snap-start flex flex-col justify-between"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{b.serviceId?.title || "Service"}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1"><FaCalendarAlt className="text-[10px]" /> {b.date}</span>
                                                    <span>•</span>
                                                    <span>{b.time}</span>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                                                ${b.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                                                ${b.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                                                ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                                                ${b.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' : ''}
                                            `}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-[11px]">
                                            <span className="text-gray-400 font-medium">ID: #{b._id.slice(-6).toUpperCase()}</span>
                                            <span className="text-gray-900 font-black">₹{b.amount}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* Results */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading services...</div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <FaStore className="text-5xl mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No Services Found</h3>
                        <p className="mt-2">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-4 gap-2">
                        {services.map(svc => (
                            <div key={svc._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                                <div className="h-35 bg-gray-100 relative overflow-hidden">
                                    {svc.images?.length > 0 ? (
                                        <img src={`${svc.images[0]}`} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Image</div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                                        {svc.category}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{svc.title}</h3>
                                    </div>

                                    <p className="text-gray-500 text-sm line-clamp-2 mb-1">{svc.description}</p>
                                           
                                    <div className=" items-center justify-between pt-1">
                                        <div className="text-1xl font-black text-gray-900">₹{svc.price}</div> <br/>
                                        <button onClick={() => setBookingService(svc)} className="bg-gray-800 right-[12px] hover:bg-orange-500 text-white px-2 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-orange-500/30 transition-all">
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Booking Modal */}
                {bookingService && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900">Book Service</h3>
                                <button onClick={() => setBookingService(null)} className="text-gray-400 hover:text-red-500 transition p-1"><FaTimes /></button>
                            </div>
                            <div className="p-6">
                                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        {bookingService.images?.length > 0 ? (
                                            <img src={`${bookingService.images[0]}`} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <FaStore className="w-full h-full p-4 text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 line-clamp-1">{bookingService.title}</h4>
                                        <p className="text-lg font-black text-orange-500 mt-1">₹{bookingService.price}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleBook} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                                        <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                                            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-400 focus:ring-0 outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
                                        <input type="time" required value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                                            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-400 focus:ring-0 outline-none transition" />
                                    </div>

                                    <button type="submit" className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                        <FaCalendarAlt /> Confirm Booking
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
        </>
    );
};

export default ServiceSearch;
