import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { FaSearch, FaStar, FaStore, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Nev from "./Nev";

const ServiceSearch = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    // Booking Modal State
    const [bookingService, setBookingService] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchServices = async () => {
        try {
            setLoading(true);
            let query = [];
            if (search) query.push(`search=${search}`);
            if (category) query.push(`category=${category}`);
            const queryString = query.length > 0 ? `?${query.join("&")}` : "";

            const res = await API.get(`/services${queryString}`);
            setServices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search slightly
        const timeout = setTimeout(() => {
            fetchServices();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, category]);

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
            // optionally navigate to /profile or /customer/bookings
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
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                        Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Service</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">Book expert professionals for your home requirements instantly.</p>

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

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map(c => (
                        <button key={c}
                            onClick={() => setCategory(c === "All" ? "" : c)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition shadow-sm
                ${(category === c || (c === "All" && category === ""))
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Time Time</label>
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
